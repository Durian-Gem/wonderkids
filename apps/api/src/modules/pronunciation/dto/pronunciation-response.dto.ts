import { ApiProperty } from '@nestjs/swagger';

export class SpeechAttemptResponseDto {
  @ApiProperty({
    description: 'Speech attempt ID',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  id: string;

  @ApiProperty({
    description: 'User ID who made the attempt',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  userId: string;

  @ApiProperty({
    description: 'Child ID if attempt was for a specific child',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d',
    required: false
  })
  childId?: string;

  @ApiProperty({
    description: 'Lesson ID',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  lessonId: string;

  @ApiProperty({
    description: 'Activity ID',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  activityId: string;

  @ApiProperty({
    description: 'Question ID',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  questionId: string;

  @ApiProperty({
    description: 'Storage path for the audio recording',
    example: 'recordings/user123/child456/20240115_103000.webm'
  })
  audioPath: string;

  @ApiProperty({
    description: 'Total number of words expected',
    example: 5
  })
  wordsTotal: number;

  @ApiProperty({
    description: 'Number of words pronounced correctly',
    example: 4
  })
  wordsCorrect: number;

  @ApiProperty({
    description: 'Accuracy score (0-1)',
    example: 0.8
  })
  accuracy: number;

  @ApiProperty({
    description: 'Fluency score (0-1)',
    example: 0.75
  })
  fluencyScore: number;

  @ApiProperty({
    description: 'Overall pronunciation score (0-1)',
    example: 0.77
  })
  pronScore: number;

  @ApiProperty({
    description: 'Words per minute',
    example: 45.5
  })
  wpm: number;

  @ApiProperty({
    description: 'Attempt creation timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;
}

export class PronunciationHistoryDto {
  @ApiProperty({
    description: 'List of speech attempts',
    type: [SpeechAttemptResponseDto]
  })
  attempts: SpeechAttemptResponseDto[];

  @ApiProperty({
    description: 'Average pronunciation score',
    example: 0.82
  })
  averageScore: number;

  @ApiProperty({
    description: 'Total number of attempts',
    example: 15
  })
  totalAttempts: number;

  @ApiProperty({
    description: 'Improvement trend (positive/negative/stable)',
    example: 'positive'
  })
  trend: 'positive' | 'negative' | 'stable';
}
