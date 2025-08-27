import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new NotFoundException('Profile not found');
    }

    return { data, success: true };
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    const { data, error } = await this.supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        ...updateData,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return { data, success: true };
  }
}
