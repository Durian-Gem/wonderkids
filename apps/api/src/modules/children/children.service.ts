import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

@Injectable()
export class ChildrenService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async getChildren(guardianId: string) {
    const { data, error } = await this.supabase
      .from('children')
      .select('*')
      .eq('guardian_id', guardianId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch children: ${error.message}`);
    }

    return { data, success: true };
  }

  async createChild(guardianId: string, createChildDto: CreateChildDto) {
    const { data, error } = await this.supabase
      .from('children')
      .insert({
        guardian_id: guardianId,
        ...createChildDto,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create child: ${error.message}`);
    }

    return { data, success: true, message: 'Child profile created successfully' };
  }

  async updateChild(guardianId: string, childId: string, updateChildDto: UpdateChildDto) {
    // First check if the child belongs to this guardian
    const { data: existingChild, error: fetchError } = await this.supabase
      .from('children')
      .select('guardian_id')
      .eq('id', childId)
      .single();

    if (fetchError) {
      throw new NotFoundException('Child not found');
    }

    if (existingChild.guardian_id !== guardianId) {
      throw new ForbiddenException('Not authorized to update this child');
    }

    const { data, error } = await this.supabase
      .from('children')
      .update(updateChildDto)
      .eq('id', childId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update child: ${error.message}`);
    }

    return { data, success: true, message: 'Child profile updated successfully' };
  }

  async deleteChild(guardianId: string, childId: string) {
    // First check if the child belongs to this guardian
    const { data: existingChild, error: fetchError } = await this.supabase
      .from('children')
      .select('guardian_id')
      .eq('id', childId)
      .single();

    if (fetchError) {
      throw new NotFoundException('Child not found');
    }

    if (existingChild.guardian_id !== guardianId) {
      throw new ForbiddenException('Not authorized to delete this child');
    }

    const { error } = await this.supabase
      .from('children')
      .delete()
      .eq('id', childId);

    if (error) {
      throw new Error(`Failed to delete child: ${error.message}`);
    }

    return { success: true, message: 'Child profile deleted successfully' };
  }
}
