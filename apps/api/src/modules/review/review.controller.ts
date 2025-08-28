import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewService } from './review.service';
import {
  ReviewQueueQueryDto,
  ReviewQueueResponseDto,
} from './dto/review-queue.dto';
import {
  ReviewGradeDto,
  ReviewGradeResponseDto,
} from './dto/review-grade.dto';

@ApiTags('review')
@Controller('review')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('queue')
  @ApiOperation({
    summary: 'Get spaced repetition review queue',
    description:
      'Returns a list of questions that are due for review based on Leitner spaced repetition algorithm. Items are ordered by due date.',
  })
  @ApiQuery({
    name: 'childId',
    required: false,
    description: 'Optional child ID to get review queue for (guardians only)',
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of items to return (1-50)',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Review queue retrieved successfully',
    type: ReviewQueueResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found or access denied',
  })
  async getReviewQueue(
    @Query() query: ReviewQueueQueryDto,
    @Request() req: any,
  ): Promise<ReviewQueueResponseDto> {
    const userId = req.user.sub;
    return this.reviewService.getReviewQueue(
      userId,
      query.childId,
      query.limit,
    );
  }

  @Post('grade')
  @ApiOperation({
    summary: 'Grade a review item',
    description:
      'Submit a grade for a question in the review queue. Uses Leitner spaced repetition algorithm to schedule the next review.',
  })
  @ApiResponse({
    status: 200,
    description: 'Review item graded successfully',
    type: ReviewGradeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid grade value or request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Review item not found or access denied',
  })
  async gradeReviewItem(
    @Body() gradeDto: ReviewGradeDto,
    @Request() req: any,
  ): Promise<ReviewGradeResponseDto> {
    const userId = req.user.sub;
    return this.reviewService.gradeReviewItem(
      userId,
      gradeDto.questionId,
      gradeDto.grade,
      gradeDto.childId,
    );
  }
}
