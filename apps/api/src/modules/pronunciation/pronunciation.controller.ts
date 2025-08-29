import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PronunciationService } from './pronunciation.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateSpeechAttemptDto, SpeechAttemptResponseDto, PronunciationHistoryDto } from './dto';

@ApiTags('pronunciation')
@ApiBearerAuth()
@Controller('pronunciation')
@UseGuards(AuthGuard)
export class PronunciationController {
  constructor(private readonly pronunciationService: PronunciationService) {}

  @Post('attempts')
  @ApiOperation({ 
    summary: 'Create a pronunciation attempt',
    description: 'Records and scores a speech attempt with heuristic pronunciation analysis'
  })
  @ApiResponse({
    status: 201,
    description: 'Speech attempt recorded and scored successfully',
    type: SpeechAttemptResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data'
  })
  @ApiResponse({
    status: 404,
    description: 'Question, lesson, or child not found'
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to create attempt for this child or access this content'
  })
  async createSpeechAttempt(@Request() req, @Body() createAttemptDto: CreateSpeechAttemptDto) {
    return this.pronunciationService.createSpeechAttempt(req.userId, createAttemptDto);
  }

  @Get('attempts')
  @ApiOperation({ 
    summary: 'Get pronunciation attempt history',
    description: 'Retrieves speech attempts with filtering and summary statistics'
  })
  @ApiQuery({
    name: 'lessonId',
    required: false,
    description: 'Filter by specific lesson ID'
  })
  @ApiQuery({
    name: 'childId',
    required: false,
    description: 'Filter by specific child ID (must be user\'s child)'
  })
  @ApiResponse({
    status: 200,
    description: 'Speech attempts retrieved successfully',
    type: PronunciationHistoryDto
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to view attempts for this child'
  })
  async getSpeechAttempts(
    @Request() req,
    @Query('lessonId') lessonId?: string,
    @Query('childId') childId?: string
  ) {
    return this.pronunciationService.getSpeechAttempts(req.userId, lessonId, childId);
  }

  @Get('attempts/:id')
  @ApiOperation({ 
    summary: 'Get specific pronunciation attempt',
    description: 'Retrieves detailed information about a specific speech attempt'
  })
  @ApiResponse({
    status: 200,
    description: 'Speech attempt retrieved successfully',
    type: SpeechAttemptResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Speech attempt not found'
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to view this speech attempt'
  })
  async getSpeechAttempt(@Request() req, @Param('id') attemptId: string) {
    return this.pronunciationService.getSpeechAttempt(req.userId, attemptId);
  }
}
