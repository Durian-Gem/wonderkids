import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':lessonId')
  @ApiOperation({ 
    summary: 'Get lesson with activities, questions, and options by ID',
    description: 'Returns a complete lesson structure for the lesson player including all activities, questions, and options. Only published lessons are returned.'
  })
  @ApiParam({ 
    name: 'lessonId', 
    description: 'UUID of the lesson',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  async getLessonById(@Param('lessonId') lessonId: string) {
    return this.lessonsService.getLessonById(lessonId);
  }
}
