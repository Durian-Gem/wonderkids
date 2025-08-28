import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillingService } from './billing.service';
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponseDto,
  CustomerPortalResponseDto,
  SubscriptionStatusDto,
} from './dto/billing.dto';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Stripe checkout session',
    description:
      'Creates a new Stripe checkout session for subscribing to a premium plan.',
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
    type: CheckoutSessionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid plan code or request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  async createCheckoutSession(
    @Body() createCheckoutDto: CreateCheckoutSessionDto,
    @Request() req: any,
  ): Promise<CheckoutSessionResponseDto> {
    const userId = req.user.sub;
    return this.billingService.createCheckoutSession(
      userId,
      createCheckoutDto.planCode,
      createCheckoutDto.successUrl,
      createCheckoutDto.cancelUrl,
    );
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create customer portal session',
    description:
      'Creates a Stripe customer portal session for managing billing and subscriptions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Portal session created successfully',
    type: CustomerPortalResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'No billing account found for user',
  })
  async createPortalSession(
    @Request() req: any,
    @Body() body?: { returnUrl?: string },
  ): Promise<CustomerPortalResponseDto> {
    const userId = req.user.sub;
    return this.billingService.createCustomerPortalSession(
      userId,
      body?.returnUrl,
    );
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get subscription status',
    description:
      'Returns the current subscription status and available premium features for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription status retrieved successfully',
    type: SubscriptionStatusDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  async getSubscriptionStatus(
    @Request() req: any,
  ): Promise<SubscriptionStatusDto> {
    const userId = req.user.sub;
    return this.billingService.getSubscriptionStatus(userId);
  }

  @Post('webhooks/stripe')
  @ApiExcludeEndpoint() // Exclude from Swagger docs as it's for Stripe only
  @ApiOperation({
    summary: 'Stripe webhook handler',
    description:
      'Handles Stripe webhook events for subscription updates, payments, etc. This endpoint is called by Stripe and should not be used directly.',
  })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    try {
      // TODO: Verify webhook signature when Stripe is installed
      /*
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      */

      // Mock event for now
      const event = {
        type: 'test.event',
        data: { object: {} },
      };

      await this.billingService.handleWebhook(event);

      return { received: true };
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return { received: false };
    }
  }
}
