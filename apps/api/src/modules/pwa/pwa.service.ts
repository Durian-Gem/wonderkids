import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CreateContentPackDto, UpdateContentPackDto } from './dto';

@Injectable()
export class PWAService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async getPublishedPacks() {
    const { data, error } = await this.supabase
      .from('content_packs')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch content packs: ${error.message}`);
    }

    // Calculate total bytes across all packs
    const totalBytes = data.reduce((sum, pack) => {
      return sum + pack.assets.reduce((assetSum, asset) => assetSum + asset.bytes, 0);
    }, 0);

    return {
      data: {
        packs: data,
        total: data.length,
        totalBytes
      },
      success: true
    };
  }

  async getPackByCode(code: string) {
    const { data, error } = await this.supabase
      .from('content_packs')
      .select('*')
      .eq('code', code)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Content pack with code '${code}' not found`);
    }

    return {
      data,
      success: true
    };
  }

  // Admin methods for content pack management
  async createContentPack(createPackDto: CreateContentPackDto) {
    // Check if pack code already exists
    const { data: existing } = await this.supabase
      .from('content_packs')
      .select('id')
      .eq('code', createPackDto.code)
      .single();

    if (existing) {
      throw new ConflictException(`Content pack with code '${createPackDto.code}' already exists`);
    }

    const { data, error } = await this.supabase
      .from('content_packs')
      .insert({
        code: createPackDto.code,
        title: createPackDto.title,
        description: createPackDto.description || '',
        assets: createPackDto.assets,
        is_published: createPackDto.isPublished || false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create content pack: ${error.message}`);
    }

    return {
      data,
      success: true,
      message: 'Content pack created successfully'
    };
  }

  async updateContentPack(packId: string, updatePackDto: UpdateContentPackDto) {
    const { data: existing } = await this.supabase
      .from('content_packs')
      .select('id')
      .eq('id', packId)
      .single();

    if (!existing) {
      throw new NotFoundException('Content pack not found');
    }

    const updateData: any = {};
    if (updatePackDto.title !== undefined) updateData.title = updatePackDto.title;
    if (updatePackDto.description !== undefined) updateData.description = updatePackDto.description;
    if (updatePackDto.assets !== undefined) updateData.assets = updatePackDto.assets;
    if (updatePackDto.isPublished !== undefined) updateData.is_published = updatePackDto.isPublished;

    const { data, error } = await this.supabase
      .from('content_packs')
      .update(updateData)
      .eq('id', packId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update content pack: ${error.message}`);
    }

    return {
      data,
      success: true,
      message: 'Content pack updated successfully'
    };
  }

  async deleteContentPack(packId: string) {
    const { data: existing } = await this.supabase
      .from('content_packs')
      .select('id')
      .eq('id', packId)
      .single();

    if (!existing) {
      throw new NotFoundException('Content pack not found');
    }

    const { error } = await this.supabase
      .from('content_packs')
      .delete()
      .eq('id', packId);

    if (error) {
      throw new Error(`Failed to delete content pack: ${error.message}`);
    }

    return {
      success: true,
      message: 'Content pack deleted successfully'
    };
  }

  async getAllPacks() {
    const { data, error } = await this.supabase
      .from('content_packs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch all content packs: ${error.message}`);
    }

    const totalBytes = data.reduce((sum, pack) => {
      return sum + pack.assets.reduce((assetSum, asset) => assetSum + asset.bytes, 0);
    }, 0);

    return {
      data: {
        packs: data,
        total: data.length,
        totalBytes
      },
      success: true
    };
  }

  // Generate sample content packs for A1 level
  async generateSamplePacks() {
    const samplePacks = [
      {
        code: 'a1-animals',
        title: 'Animals Pack',
        description: 'Learn about domestic and wild animals',
        assets: [
          { url: '/images/animals/cat.jpg', hash: 'cat123', bytes: 15000, kind: 'image' },
          { url: '/images/animals/dog.jpg', hash: 'dog456', bytes: 18000, kind: 'image' },
          { url: '/audio/animals/cat-sound.mp3', hash: 'cataud789', bytes: 25000, kind: 'audio' },
          { url: '/audio/animals/dog-sound.mp3', hash: 'dogaud012', bytes: 22000, kind: 'audio' },
        ],
        isPublished: true
      },
      {
        code: 'a1-family',
        title: 'Family Pack',
        description: 'Learn about family members and relationships',
        assets: [
          { url: '/images/family/mother.jpg', hash: 'mom123', bytes: 16000, kind: 'image' },
          { url: '/images/family/father.jpg', hash: 'dad456', bytes: 17000, kind: 'image' },
          { url: '/audio/family/mother.mp3', hash: 'momaud789', bytes: 20000, kind: 'audio' },
          { url: '/audio/family/father.mp3', hash: 'dadaud012', bytes: 21000, kind: 'audio' },
        ],
        isPublished: true
      },
      {
        code: 'a1-colors',
        title: 'Colors Pack',
        description: 'Learn basic colors and color recognition',
        assets: [
          { url: '/images/colors/red.jpg', hash: 'red123', bytes: 12000, kind: 'image' },
          { url: '/images/colors/blue.jpg', hash: 'blue456', bytes: 11000, kind: 'image' },
          { url: '/images/colors/green.jpg', hash: 'green789', bytes: 13000, kind: 'image' },
          { url: '/audio/colors/red.mp3', hash: 'redaud012', bytes: 18000, kind: 'audio' },
        ],
        isPublished: true
      }
    ];

    const results = [];
    for (const pack of samplePacks) {
      try {
        const result = await this.createContentPack(pack);
        results.push(result);
      } catch (error) {
        // Skip if already exists
        if (error instanceof ConflictException) {
          console.log(`Pack ${pack.code} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    return {
      data: results,
      success: true,
      message: `Generated ${results.length} sample content packs`
    };
  }
}
