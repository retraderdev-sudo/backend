import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PlansModule } from './plans/plans.module';
import { StripeModule } from './stripe/stripe.module';
import { User } from './user/entities/user.entity';
import { Otp } from './auth/entities/otp.entity';
import { Plan } from './plans/entities/plan.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'retrader',
      entities: [User, Otp, Plan],
      synchronize: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UserModule,
    PlansModule,
    StripeModule,
  ],
})
export class AppModule {}
