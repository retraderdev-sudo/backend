import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'User ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  @Column()
  username: string;

  @ApiProperty({
    description: 'Hashed password (nullable for Google users)',
    example: null,
    required: false,
  })
  @Column({ nullable: true })
  password: string;

  @ApiProperty({ description: 'Email verification status', example: false })
  @Column({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @Column({ nullable: true })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @Column({ nullable: true })
  lastName: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
  })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiProperty({
    description: 'Refresh token for JWT',
    example: null,
    required: false,
  })
  @Column({ nullable: true })
  refreshToken: string;

  @ApiProperty({ description: 'Account creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
