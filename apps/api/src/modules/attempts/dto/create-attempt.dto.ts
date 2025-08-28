import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttemptDto {
  @ApiProperty({
    description: 'ID of the lesson to attempt',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  lessonId: string;

  @ApiPropertyOptional({
    description: 'ID of the child (if attempting as a child profile)',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsOptional()
  @IsUUID()
  childId?: string;
}
