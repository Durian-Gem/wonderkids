import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider } from './email-provider.interface';

@Injectable()
export class MockProvider implements EmailProvider {
  private readonly logger = new Logger(MockProvider.name);

  constructor() {
    this.logger.log('Mock email provider initialized (for development/testing)');
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
    this.logger.log(`[MOCK EMAIL] To: ${to}`);
    this.logger.log(`[MOCK EMAIL] Subject: ${subject}`);
    this.logger.log(`[MOCK EMAIL] HTML Length: ${html.length} chars`);
    if (text) {
      this.logger.log(`[MOCK EMAIL] Text Length: ${text.length} chars`);
    }
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.logger.log(`[MOCK EMAIL] Email "sent" successfully to ${to}`);
  }

  getName(): string {
    return 'mock';
  }
}
