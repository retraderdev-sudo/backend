import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from '../entities/otp.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createOtp(email: string): Promise<string> {
    // Clean up expired OTPs
    await this.cleanupExpiredOtps();

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate new OTP
    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database with user relationship
    const otp = this.otpRepository.create({
      user,
      code,
      expiresAt,
    });

    await this.otpRepository.save(otp);

    return code;
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    try {
      // Find user by email first
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Find OTP with user relationship
      const otp = await this.otpRepository.findOne({
        where: {
          user: { id: user.id },
          code,
          isUsed: false,
        },
        relations: ['user'],
      });

      if (!otp) {
        throw new BadRequestException('Invalid OTP');
      }

      // Check if OTP is expired
      if (new Date() > otp.expiresAt) {
        // Mark as used even if expired to prevent reuse
        otp.isUsed = true;
        await this.otpRepository.save(otp);
        throw new BadRequestException('OTP expired');
      }

      // Mark OTP as used
      otp.isUsed = true;
      await this.otpRepository.save(otp);

      return true;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  async cleanupExpiredOtps(): Promise<void> {
    await this.otpRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
