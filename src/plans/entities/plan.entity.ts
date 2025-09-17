import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('plans')
export class Plan {
  @ApiProperty({ description: 'Plan ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Plan name', example: 'Basic Monthly' })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Plan description',
    example: 'Perfect for getting started with basic trading features',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Stripe Price ID',
    example: 'price_1S7Juj4hRkLRan8xPqXtf68G',
  })
  @Column({ unique: true })
  priceId: string;

  @ApiProperty({
    description: 'Billing interval',
    enum: ['month', 'year'],
    example: 'month',
  })
  @Column({ type: 'enum', enum: ['month', 'year'] })
  interval: 'month' | 'year';

  @ApiProperty({ description: 'Plan amount in cents', example: 999 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
