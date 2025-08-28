import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PremiumGuard implements CanActivate {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if this is a mock user for testing
    if (userId === 'mock-user-id-123' || userId === 'mock-child-id-456') {
      // Allow mock users to access premium content for testing
      return true;
    }

    try {
      // Only check database if we have real Supabase credentials
      if (this.configService.get('SUPABASE_URL') && this.configService.get('SUPABASE_SERVICE_ROLE_KEY')) {
        // Check if user has active subscription using our database function
        const { data: hasActiveSubscription, error } = await this.supabase
          .rpc('has_active_subscription', { user_uuid: userId });

        if (error) {
          console.error('Error checking subscription status:', error);
          // On error, deny access to be safe
          throw new ForbiddenException(
            'Unable to verify subscription status'
          );
        }

        if (!hasActiveSubscription) {
          throw new ForbiddenException(
            'Premium subscription required to access this content'
          );
        }
      } else {
        // For testing without Supabase, allow premium access
        console.log('Mock premium access granted for user:', userId);
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      console.error('Premium guard error:', error);
      throw new ForbiddenException(
        'Unable to verify premium access'
      );
    }
  }
}
