import { Controller, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@ApiTags('attempts')
@Controller('attempts')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new lesson attempt',
    description: 'Starts a new attempt for a lesson. Can be for the authenticated user or a child profile.'
  })
  async createAttempt(@Body() createAttemptDto: CreateAttemptDto, @Request() req) {
    return this.attemptsService.createAttempt(createAttemptDto, req.user.id);
  }

  @Post(':id/answers')
  @ApiOperation({ 
    summary: 'Submit answers for an attempt',
    description: 'Submits answers for questions in the attempt. Can be called multiple times to update answers.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID of the attempt',
    example: '550e8400-e29b-41d4-a716-446655440003'
  })
  async submitAnswers(
    @Param('id') attemptId: string,
    @Body() submitAnswersDto: SubmitAnswersDto,
    @Request() req
  ) {
    return this.attemptsService.submitAnswers(attemptId, submitAnswersDto, req.user.id);
  }

  @Post(':id/finish')
  @ApiOperation({ 
    summary: 'Finish and score an attempt',
    description: 'Completes the attempt, calculates the score, awards XP, updates progress, and checks for badge achievements.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'UUID of the attempt',
    example: '550e8400-e29b-41d4-a716-446655440003'
  })
  async finishAttempt(@Param('id') attemptId: string, @Request() req) {
    return this.attemptsService.finishAttempt(attemptId, req.user.id);
  }
}
