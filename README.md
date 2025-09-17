# Retrader Backend

Nest.js backend application for the Retrader trading platform.

## Features

- **Authentication System**: JWT-based authentication with refresh tokens
- **User Management**: User registration, login, logout
- **Database**: MySQL with TypeORM
- **Security**: Password hashing with bcrypt, JWT strategy with Passport
- **API**: RESTful endpoints with validation

## Tech Stack

- Nest.js (latest)
- TypeScript
- TypeORM
- MySQL
- Passport.js (JWT strategy)
- bcrypt
- class-validator

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Copy `env.example` to `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=password
   DB_DATABASE=retrader
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   JWT_REFRESH_EXPIRES_IN=7d
   PORT=3001
   NODE_ENV=development
   ```

3. **Set up MySQL database**
   ```sql
   CREATE DATABASE retrader;
   ```

4. **Run the application**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user profile

## Development

### Code Style
- ESLint + Prettier configured
- Format on save enabled
- TypeScript strict mode

### Scripts
- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests

## License

This project is licensed under the MIT License.
