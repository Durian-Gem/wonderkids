import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, Max, IsOptional } from 'class-validator';

export class ReviewGradeDto {
  @ApiProperty({
    description: 'Question ID that was reviewed',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  questionId: string;

  @ApiProperty({
    description: 'Child ID (optional for guardians)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  childId?: string;

  @ApiProperty({
    description: 'Grade given: 0=wrong/again, 1=hard, 2=good, 3=easy',
    example: 2,
    minimum: 0,
    maximum: 3,
  })
  @IsInt()
  @Min(0)
  @Max(3)
  grade: number;
}

export class ReviewGradeResponseDto {
  @ApiProperty({
    description: 'Whether the grading was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'New Leitner box after grading',
    example: 3,
  })
  newBox: number;

  @ApiProperty({
    description: 'When this item is next due for review',
    example: '2024-01-15T10:00:00.000Z',
  })
  nextDue: Date;

  @ApiProperty({
    description: 'Updated lapse count',
    example: 0,
  })
  lapses: number;

  @ApiProperty({
    description: 'Number of items remaining in review queue',
    example: 7,
  })
  remainingInQueue: number;

  @ApiProperty({
    description: 'Feedback message based on grade',
    example: 'Great job! Moving to the next level.',
  })
  message: string;
}
