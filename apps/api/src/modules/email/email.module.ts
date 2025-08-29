import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { ResendProvider, SMTPProvider, MockProvider } from './providers';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Enable cron scheduling
  ],
  controllers: [EmailController],
  providers: [
    EmailService,
    ResendProvider,
    SMTPProvider,
    MockProvider,
  ],
  exports: [EmailService],
})
export class EmailModule {}
