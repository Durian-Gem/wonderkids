import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailProvider } from './email-provider.interface';

@Injectable()
export class SMTPProvider implements EmailProvider {
  private readonly logger = new Logger(SMTPProvider.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      this.logger.warn('SMTP configuration incomplete');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates in development
      }
    });

    this.logger.log('SMTP email provider initialized');
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('SMTP not configured - missing required environment variables');
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"WonderKids" <hello@wonderkids.edu>',
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`Email sent via SMTP to ${to}, Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email via SMTP to ${to}:`, error);
      throw error;
    }
  }

  getName(): string {
    return 'smtp';
  }
}
