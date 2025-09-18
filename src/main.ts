import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PlansModule } from './plans/plans.module';
import { StripeModule } from './stripe/stripe.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://retrader-frontend:3000',
    ],
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Retrader API')
    .setDescription(
      'API documentation for Retrader - A comprehensive trading platform',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management operations')
    .addTag('Plans', 'Subscription plan management')
    .addTag('Stripe', 'Payment processing with Stripe')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [User],
    include: [AuthModule, UserModule, PlansModule, StripeModule],
  });

  // Manually add User schema if it's missing
  if (!document.components?.schemas?.User) {
    document.components = document.components || {};
    document.components.schemas = document.components.schemas || {};
    document.components.schemas.User = {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'User ID', example: 1 },
        email: {
          type: 'string',
          description: 'User email address',
          example: 'user@example.com',
        },
        username: {
          type: 'string',
          description: 'Username',
          example: 'johndoe',
        },
        password: {
          type: 'string',
          description: 'Hashed password (nullable for Google users)',
          example: null,
          nullable: true,
        },
        isEmailVerified: {
          type: 'boolean',
          description: 'Email verification status',
          example: false,
        },
        firstName: {
          type: 'string',
          description: 'User first name',
          example: 'John',
          nullable: true,
        },
        lastName: {
          type: 'string',
          description: 'User last name',
          example: 'Doe',
          nullable: true,
        },
        role: {
          type: 'string',
          description: 'User role',
          enum: ['USER', 'ADMIN'],
          example: 'USER',
        },
        refreshToken: {
          type: 'string',
          description: 'Refresh token for JWT',
          example: null,
          nullable: true,
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Account creation timestamp',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp',
        },
      },
      required: [
        'id',
        'email',
        'username',
        'isEmailVerified',
        'role',
        'createdAt',
        'updatedAt',
      ],
    };
  }
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT);
}
bootstrap();
