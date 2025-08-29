import { IsString, IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Topic for the AI tutor session',
    example: 'animals',
    enum: ['animals', 'family', 'school', 'food', 'weather', 'hobbies', 'numbers', 'colors', 'body-parts', 'clothes']
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  topic: string;

  @ApiPropertyOptional({
    description: 'Child ID if this session is for a specific child',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  @IsOptional()
  @IsUUID()
  childId?: string;
}
