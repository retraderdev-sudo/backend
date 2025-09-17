import { IsEmail, IsString, IsIn, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password (required when loginMethod is "password")',
    example: 'password123',
    required: false,
  })
  @ValidateIf((o) => o.loginMethod === 'password')
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'OTP code (required when loginMethod is "otp")',
    example: '123456',
    required: false,
  })
  @ValidateIf((o) => o.loginMethod === 'otp')
  @IsString()
  otp?: string;

  @ApiProperty({
    description: 'Login method',
    enum: ['password', 'otp'],
    example: 'password',
  })
  @IsString()
  @IsIn(['password', 'otp'])
  loginMethod: string;
}
