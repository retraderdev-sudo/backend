import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'User email from Google',
    example: 'user@gmail.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User display name from Google',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Google user ID',
    example: '1234567890123456789',
  })
  @IsString()
  googleId: string;

  @ApiProperty({
    description: 'User profile image URL from Google',
    example: 'https://lh3.googleusercontent.com/a/...',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;
}
