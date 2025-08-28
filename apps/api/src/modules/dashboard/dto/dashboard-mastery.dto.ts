import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional } from 'class-validator';

export class DashboardMasteryQueryDto {
  @ApiProperty({
    description: 'Child ID to get mastery data for (optional for guardians)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  childId?: string;
}

export class LessonMasteryDto {
  @ApiProperty({ description: 'Lesson ID' })
  lessonId: string;

  @ApiProperty({ description: 'Lesson title' })
  lessonTitle: string;

  @ApiProperty({ description: 'Unit ID' })
  unitId: string;

  @ApiProperty({ description: 'Unit title' })
  unitTitle: string;

  @ApiProperty({ description: 'Course ID' })
  courseId: string;

  @ApiProperty({ description: 'Course title' })
  courseTitle: string;

  @ApiProperty({ 
    description: 'Mastery level (0.0 to 1.0)',
    example: 0.85 
  })
  mastery: number;

  @ApiProperty({ 
    description: 'Stars earned (0-3)',
    example: 2 
  })
  stars: number;

  @ApiProperty({ 
    description: 'Number of attempts made',
    example: 3 
  })
  attemptCount: number;

  @ApiProperty({ 
    description: 'Average score across attempts',
    example: 85.5 
  })
  avgScore: number;

  @ApiProperty({ 
    description: 'Date of last completion',
    required: false 
  })
  lastCompleted?: Date;
}

export class DashboardMasteryResponseDto {
  @ApiProperty({
    description: 'List of lesson mastery data',
    type: [LessonMasteryDto]
  })
  lessons: LessonMasteryDto[];

  @ApiProperty({
    description: 'Overall statistics',
    example: {
      totalLessons: 25,
      completedLessons: 18,
      averageMastery: 0.72,
      totalStars: 42
    }
  })
  overall: {
    totalLessons: number;
    completedLessons: number;
    averageMastery: number;
    totalStars: number;
  };
}
