import { IsString, IsNumber, IsEnum, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ description: 'Plan name', example: 'Basic Monthly' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Plan description',
    example: 'Perfect for getting started with basic trading features',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Stripe Price ID',
    example: 'price_1S7Juj4hRkLRan8xPqXtf68G',
  })
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @ApiProperty({
    description: 'Billing interval',
    enum: ['month', 'year'],
    example: 'month',
  })
  @IsEnum(['month', 'year'])
  interval: 'month' | 'year';

  @ApiProperty({ description: 'Plan amount in cents', example: 999 })
  @IsNumber()
  @Min(0)
  amount: number;
}
