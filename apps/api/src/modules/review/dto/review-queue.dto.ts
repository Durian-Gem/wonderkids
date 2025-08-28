import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class ReviewQueueQueryDto {
  @ApiProperty({
    description: 'Child ID to get review queue for (optional for guardians)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  childId?: string;

  @ApiProperty({
    description: 'Maximum number of items to return',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class ReviewQuestionDto {
  @ApiProperty({ description: 'Review item ID' })
  reviewItemId: string;

  @ApiProperty({ description: 'Question ID' })
  questionId: string;

  @ApiProperty({ description: 'Question text' })
  questionText: string;

  @ApiProperty({ description: 'Question type (mcq, listen_choose, etc.)' })
  questionType: string;

  @ApiProperty({ description: 'Activity title' })
  activityTitle: string;

  @ApiProperty({ description: 'Activity instructions' })
  activityInstructions: string;

  @ApiProperty({ description: 'Current Leitner box (1-5)' })
  box: number;

  @ApiProperty({ description: 'Number of previous lapses' })
  lapses: number;

  @ApiProperty({ description: 'Last grade received (0-3)' })
  lastGrade?: number;

  @ApiProperty({ description: 'When this item is due for review' })
  dueAt: Date;

  @ApiProperty({
    description: 'Answer options (for MCQ questions)',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        optionText: { type: 'string' },
        isCorrect: { type: 'boolean' },
      },
    },
  })
  options: Array<{
    id: string;
    optionText: string;
    isCorrect: boolean;
  }>;

  @ApiProperty({
    description: 'Lesson context information',
    type: 'object',
    properties: {
      lessonId: { type: 'string' },
      lessonTitle: { type: 'string' },
      unitTitle: { type: 'string' },
      courseTitle: { type: 'string' },
    },
  })
  lesson: {
    lessonId: string;
    lessonTitle: string;
    unitTitle: string;
    courseTitle: string;
  };
}

export class ReviewQueueResponseDto {
  @ApiProperty({
    description: 'List of questions due for review',
    type: [ReviewQuestionDto],
  })
  questions: ReviewQuestionDto[];

  @ApiProperty({
    description: 'Total number of items due for review',
    example: 25,
  })
  totalDue: number;

  @ApiProperty({
    description: 'Queue statistics',
    type: 'object',
    properties: {
      box1: { type: 'number', description: 'Items in box 1' },
      box2: { type: 'number', description: 'Items in box 2' },
      box3: { type: 'number', description: 'Items in box 3' },
      box4: { type: 'number', description: 'Items in box 4' },
      box5: { type: 'number', description: 'Items in box 5' },
    },
  })
  boxDistribution: {
    box1: number;
    box2: number;
    box3: number;
    box4: number;
    box5: number;
  };
}
