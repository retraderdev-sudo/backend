import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { OtpService } from './services/otp.service';
import { EmailService } from './services/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password } = registerDto;

    // Use database transaction to ensure atomicity
    return await this.dataSource.transaction(async (manager) => {
      const existingUserByEmail = await manager.findOne(User, {
        where: { email },
      });
      if (existingUserByEmail) {
        throw new ConflictException('User with this email already exists');
      }

      const existingUserByUsername = await manager.findOne(User, {
        where: { username },
      });
      if (existingUserByUsername) {
        throw new ConflictException('User with this username already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user within transaction
      const user = manager.create(User, {
        email,
        username,
        password: hashedPassword,
      });
      const savedUser = await manager.save(user);

      const tokens = await this.generateTokens(savedUser.id, savedUser.email);

      // Update refresh token within transaction
      await manager.update(
        User,
        { id: savedUser.id },
        { refreshToken: tokens.refreshToken },
      );

      return {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          username: savedUser.username,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    });
  }

  async login(loginDto: LoginDto) {
    const { email, password, otp, loginMethod } = loginDto;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (loginMethod === 'password') {
      if (!password) {
        throw new UnauthorizedException(
          'Password is required for password login',
        );
      }

      // Check if user was created via Google OAuth (password is googleId hash)
      if (!user.password) {
        throw new UnauthorizedException(
          'This account was created with Google. Please use Google sign-in or set a password in your profile.',
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else if (loginMethod === 'otp') {
      if (!otp) {
        throw new UnauthorizedException('OTP is required for OTP login');
      }
      await this.otpService.verifyOtp(email, otp);
    } else {
      throw new UnauthorizedException('Invalid login method');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email);

      await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // New OTP-based authentication methods
  async sendOtp(sendOtpDto: SendOtpDto) {
    const { email } = sendOtpDto;

    // Generate and save OTP (works for any email, user doesn't need to exist yet)
    const otp = await this.otpService.createOtp(email);

    // Get user if they exist, otherwise use email as username
    const user = await this.userService.findByEmail(email);
    const username = user ? user.username : email.split('@')[0];

    // Send OTP email
    await this.emailService.sendOtpEmail(email, otp, username);

    return {
      message: 'OTP sent to your email',
      expiresIn: 300, // 5 minutes
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, code } = verifyOtpDto;

    // Verify OTP
    const isValid = await this.otpService.verifyOtp(email, code);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Get user and generate tokens
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async loginWithOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, code } = verifyOtpDto;

    // Verify OTP
    const isValid = await this.otpService.verifyOtp(email, code);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Get user and generate tokens - if they don't exist, create them
    let user = await this.userService.findByEmail(email);
    if (!user) {
      // Create user for OTP login (similar to Google OAuth flow)
      const username =
        email.split('@')[0] + Math.random().toString(36).substr(2, 5);
      const hashedPassword = await bcrypt.hash(code + Date.now(), 10); // Use OTP + timestamp as password

      user = await this.userService.create(email, username, hashedPassword);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async googleAuth(googleAuthDto: GoogleAuthDto) {
    const { email, name, googleId } = googleAuthDto;

    // Check if user exists
    let user = await this.userService.findByEmail(email);

    if (!user) {
      // Create new user for Google auth
      const username =
        name.toLowerCase().replace(/\s+/g, '') +
        Math.random().toString(36).substr(2, 5);
      const hashedPassword = await bcrypt.hash(googleId, 10); // Use googleId as password

      user = await this.userService.create(email, username, hashedPassword);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async setPasswordForGoogleUser(email: string, newPassword: string) {
    return this.userService.setPasswordForGoogleUser(email, newPassword);
  }

  private async generateTokens(userId: number, email: string) {
    const payload = { email, sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
