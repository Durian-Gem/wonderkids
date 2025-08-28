# Stripe Configuration for WonderKids

## Sprint 3 Billing Features Setup

To enable the billing functionality in Sprint 3, you need to configure Stripe environment variables.

## Step 1: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a free account if you don't have one

## Step 2: Get API Keys

1. In your Stripe dashboard, go to **Developers > API keys**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

## Step 3: Configure Webhooks (Optional)

For production webhook processing:

1. Go to **Developers > Webhooks**
2. Add endpoint: `https://yourdomain.com/api/billing/webhooks/stripe`
3. Copy the **Webhook signing secret** (starts with `whsec_`)

## Step 4: Environment Variables

Create or update your `.env.local` file in the `apps/web/` directory:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

## Step 5: Test Billing Features

Once configured, these endpoints will work:

- `POST /api/billing/create-checkout-session` - Create payment sessions
- `POST /api/billing/portal` - Customer billing portal
- `GET /api/billing/status` - Subscription status (already working)

## Available Billing Plans

The system supports these plan codes:
- `family_monthly` - Monthly subscription
- `family_yearly` - Yearly subscription

## Current Status

- ✅ Billing status endpoint working
- ✅ Checkout session creation (needs Stripe keys)
- ✅ Customer portal access (needs Stripe keys)
- ✅ Premium content gating (needs database migration)

## Troubleshooting

If billing endpoints return 500 errors:
1. Check that environment variables are set correctly
2. Verify Stripe keys are valid
3. Ensure webhook endpoint is accessible (for production)

## Next Steps

After configuring Stripe:
1. Test checkout session creation
2. Test premium content access
3. Set up webhook processing for subscription events
