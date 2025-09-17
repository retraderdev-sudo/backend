import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure nodemailer (you'll need to set up your SMTP credentials)
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendOtpEmail(
    email: string,
    otp: string,
    username?: string,
  ): Promise<boolean> {
    try {
      const html = this.createOtpEmailTemplate(otp, username);

      await this.transporter.sendMail({
        from: process.env.MAIL_FROM_ADDRESS || 'noreply@retrader.com',
        to: email,
        subject: 'Your OTP Code - Retrader',
        html,
      });

      this.logger.log(`OTP email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      return false;
    }
  }

  private createOtpEmailTemplate(otp: string, username?: string): string {
    return `
<!DOCTYPE html>
<html dir="ltr" lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code - Retrader</title>
    <style>
        body {
            font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
        }
        .otp-container {
            background: #f1f5f9;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 2px dashed #cbd5e1;
        }
        .otp-label {
            font-size: 16px;
            color: #374151;
            margin-bottom: 15px;
            font-weight: 500;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #1e40af;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background: white;
            padding: 15px 25px;
            border-radius: 8px;
            display: inline-block;
            border: 2px solid #3b82f6;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .otp-note {
            font-size: 14px;
            color: #6b7280;
            margin-top: 15px;
            font-style: italic;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .footer-text {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
        }
        .company {
            font-size: 14px;
            color: #9ca3af;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 30px 0;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px;
            }
            .otp-code {
                font-size: 24px;
                letter-spacing: 4px;
                padding: 12px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Retrader</div>
            <h1 class="title">Welcome to Retrader!</h1>
        </div>
        
        <div class="message">
            <p>Hello${username ? ` ${username}` : ''},</p>
            <p>To complete your registration, please enter the verification code below:</p>
        </div>
        
        <div class="otp-container">
            <div class="otp-label">Your verification code is:</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-note">This code will expire in 5 minutes.</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
            <p class="footer-text">If you didn't request this code, please ignore this email.</p>
            <p class="company">Retrader Team</p>
        </div>
    </div>
</body>
</html>
    `;
  }
}
