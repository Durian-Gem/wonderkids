import { IsEmail, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    description: 'Recipient email address',
    example: 'parent@example.com'
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'Email subject',
    example: 'Weekly Progress Summary for Your Child'
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Email content (HTML)',
    example: '<h1>Weekly Progress</h1><p>Your child completed 5 lessons this week!</p>'
  })
  @IsString()
  html: string;

  @ApiPropertyOptional({
    description: 'Email content (plain text)',
    example: 'Weekly Progress: Your child completed 5 lessons this week!'
  })
  @IsOptional()
  @IsString()
  text?: string;
}

export class WeeklySummaryPayload {
  @ApiProperty({
    description: 'User ID for the summary',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  userId: string;

  @ApiProperty({
    description: 'User email',
    example: 'parent@example.com'
  })
  userEmail: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  userName: string;

  @ApiProperty({
    description: 'Week start date',
    example: '2024-01-15'
  })
  weekStart: string;

  @ApiProperty({
    description: 'Week end date',
    example: '2024-01-21'
  })
  weekEnd: string;

  @ApiProperty({
    description: 'Summary statistics',
    type: 'object',
    properties: {
      totalMinutes: { type: 'number' },
      lessonsCompleted: { type: 'number' },
      currentStreak: { type: 'number' },
      badgesEarned: { type: 'number' },
      topScores: { type: 'array', items: { type: 'object' } }
    }
  })
  @IsObject()
  summary: {
    totalMinutes: number;
    lessonsCompleted: number;
    currentStreak: number;
    badgesEarned: number;
    topScores: Array<{
      lessonTitle: string;
      score: number;
      date: string;
    }>;
    children: Array<{
      id: string;
      name: string;
      minutes: number;
      lessons: number;
      progress: string;
    }>;
  };
}

export class EmailJobResponseDto {
  @ApiProperty({
    description: 'Email job ID',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  userId: string;

  @ApiProperty({
    description: 'Email job kind',
    example: 'weekly_summary',
    enum: ['weekly_summary']
  })
  kind: string;

  @ApiProperty({
    description: 'Email job payload',
    type: 'object'
  })
  payload: any;

  @ApiProperty({
    description: 'Job status',
    example: 'queued',
    enum: ['queued', 'sent', 'failed']
  })
  status: string;

  @ApiProperty({
    description: 'Scheduled send time',
    example: '2024-01-21T18:00:00Z'
  })
  scheduledAt: Date;

  @ApiProperty({
    description: 'Actual send time',
    example: '2024-01-21T18:05:00Z',
    required: false
  })
  sentAt?: Date;
}
