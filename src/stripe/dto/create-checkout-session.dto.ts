import { IsNumber, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Plan ID to subscribe to', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  planId: number;

  @ApiProperty({
    description: 'Customer email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
