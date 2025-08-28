import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'Plan code for the subscription',
    example: 'family_monthly',
    enum: ['family_monthly', 'family_yearly'],
  })
  @IsString()
  planCode: string;

  @ApiProperty({
    description: 'Success URL to redirect after successful payment',
    required: false,
    example: 'https://wonderkids.com/dashboard?success=true',
  })
  @IsOptional()
  @IsUrl()
  successUrl?: string;

  @ApiProperty({
    description: 'Cancel URL to redirect if payment is cancelled',
    required: false,
    example: 'https://wonderkids.com/pricing',
  })
  @IsOptional()
  @IsUrl()
  cancelUrl?: string;
}

export class CheckoutSessionResponseDto {
  @ApiProperty({
    description: 'Stripe checkout session URL',
    example: 'https://checkout.stripe.com/pay/cs_test_...',
  })
  url: string;

  @ApiProperty({
    description: 'Stripe session ID for reference',
    example: 'cs_test_...',
  })
  sessionId: string;
}

export class CustomerPortalResponseDto {
  @ApiProperty({
    description: 'Stripe customer portal URL',
    example: 'https://billing.stripe.com/p/login/...',
  })
  url: string;
}

export class SubscriptionStatusDto {
  @ApiProperty({
    description: 'Whether user has an active subscription',
    example: true,
  })
  hasActiveSubscription: boolean;

  @ApiProperty({
    description: 'Current subscription details',
    required: false,
  })
  subscription?: {
    id: string;
    planCode: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEnd?: Date;
  };

  @ApiProperty({
    description: 'Premium features available to user',
    example: ['advanced_lessons', 'ai_tutor', 'progress_analytics'],
  })
  premiumFeatures: string[];
}

export class WebhookEventDto {
  @ApiProperty({
    description: 'Stripe webhook event type',
    example: 'checkout.session.completed',
  })
  type: string;

  @ApiProperty({
    description: 'Event data object',
  })
  data: any;
}
