import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContentService } from './content.service';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  async test() {
    return { message: 'API is working', timestamp: new Date().toISOString() };
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get all published courses' })
  async getCourses() {
    return this.contentService.getCourses();
  }

  @Get('courses/:slug')
  @ApiOperation({ summary: 'Get course with units and lessons by slug' })
  async getCourseBySlug(@Param('slug') slug: string) {
    return this.contentService.getCourseBySlug(slug);
  }
}
