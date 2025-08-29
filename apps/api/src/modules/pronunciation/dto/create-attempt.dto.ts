import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpeechAttemptDto {
  @ApiProperty({
    description: 'Lesson ID where the speech attempt occurred',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  @IsUUID()
  lessonId: string;

  @ApiProperty({
    description: 'Activity ID within the lesson',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  @IsUUID()
  activityId: string;

  @ApiProperty({
    description: 'Question ID within the activity',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  @IsUUID()
  questionId: string;

  @ApiProperty({
    description: 'Storage path for the uploaded audio recording',
    example: 'recordings/user123/child456/20240115_103000.webm'
  })
  @IsString()
  @MaxLength(500)
  audioPath: string;

  @ApiPropertyOptional({
    description: 'Child ID if attempt is for a specific child',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  @IsOptional()
  @IsUUID()
  childId?: string;
}
