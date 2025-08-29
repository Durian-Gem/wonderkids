import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { EmailProvider } from './email-provider.interface';

@Injectable()
export class ResendProvider implements EmailProvider {
  private readonly logger = new Logger(ResendProvider.name);
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured');
      return;
    }
    
    this.resend = new Resend(apiKey);
    this.logger.log('Resend email provider initialized');
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
    if (!this.resend) {
      throw new Error('Resend not configured - missing RESEND_API_KEY');
    }

    try {
      const result = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'WonderKids <hello@wonderkids.edu>',
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`Email sent via Resend to ${to}, ID: ${result.data?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email via Resend to ${to}:`, error);
      throw error;
    }
  }

  getName(): string {
    return 'resend';
  }
}
