import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PremiumGuard } from '../billing/guards/premium.guard';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  async test() {
    return {
      message: 'API is working',
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.SUPABASE_URL || 'not set',
      hasSupabase: !!process.env.SUPABASE_URL,
    };
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get all published courses' })
  async getCourses() {
    return this.contentService.getCourses();
  }

  @Get('courses/:slug')
  @ApiOperation({ 
    summary: 'Get course with units and lessons by slug',
    description: 'Returns course details. Premium courses require active subscription.'
  })
  @ApiResponse({
    status: 200,
    description: 'Course retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Premium subscription required for this course',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async getCourseBySlug(@Param('slug') slug: string, @Request() req?: any) {
    return this.contentService.getCourseBySlug(slug, req?.user?.sub);
  }

  @Get('courses/:slug/premium')
  @UseGuards(JwtAuthGuard, PremiumGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get premium course content',
    description: 'Access premium course content. Requires active subscription.'
  })
  @ApiResponse({
    status: 200,
    description: 'Premium course content retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Premium subscription required',
  })
  async getPremiumCourse(@Param('slug') slug: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.contentService.getCourseBySlug(slug, userId, true);
  }
}
