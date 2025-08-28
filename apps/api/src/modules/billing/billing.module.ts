import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PremiumGuard } from './guards/premium.guard';

@Module({
  imports: [ConfigModule],
  controllers: [BillingController],
  providers: [BillingService, PremiumGuard],
  exports: [BillingService, PremiumGuard],
})
export class BillingModule {}
