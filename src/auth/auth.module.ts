import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { OtpService } from './services/otp.service';
import { EmailService } from './services/email.service';
import { Otp } from './entities/otp.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Otp, User]),
  ],
  providers: [AuthService, JwtStrategy, OtpService, EmailService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
