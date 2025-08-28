import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional } from 'class-validator';

export class DashboardSummaryQueryDto {
  @ApiProperty({
    description: 'Child ID to get dashboard summary for (optional for guardians)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  childId?: string;
}

export class BadgeDto {
  @ApiProperty({ description: 'Badge unique code' })
  code: string;

  @ApiProperty({ description: 'Badge title' })
  title: string;

  @ApiProperty({ description: 'Badge description' })
  description: string;

  @ApiProperty({ description: 'Badge icon URL' })
  icon: string;

  @ApiProperty({ description: 'Date when badge was earned' })
  earnedAt: Date;
}

export class DashboardSummaryResponseDto {
  @ApiProperty({ 
    description: 'Total minutes learned this week',
    example: 125.5 
  })
  minutesThisWeek: number;

  @ApiProperty({ 
    description: 'Total lessons completed',
    example: 12 
  })
  lessonsCompleted: number;

  @ApiProperty({ 
    description: 'Current learning streak in days',
    example: 7 
  })
  streakDays: number;

  @ApiProperty({ 
    description: 'List of earned badges',
    type: [BadgeDto]
  })
  badges: BadgeDto[];

  @ApiProperty({
    description: 'Total XP earned',
    example: 1250
  })
  totalXp: number;

  @ApiProperty({
    description: 'Weekly learning data for charts',
    example: [
      { week: '2024-01-01', minutes: 45.5 },
      { week: '2024-01-08', minutes: 62.0 }
    ]
  })
  weeklyMinutes: Array<{
    week: string;
    minutes: number;
  }>;
}
