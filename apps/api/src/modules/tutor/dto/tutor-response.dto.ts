import { ApiProperty } from '@nestjs/swagger';

export class TutorSessionResponseDto {
  @ApiProperty({
    description: 'Session ID',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns the session',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  userId: string;

  @ApiProperty({
    description: 'Child ID if session is for a specific child',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d',
    required: false
  })
  childId?: string;

  @ApiProperty({
    description: 'Topic of the session',
    example: 'animals'
  })
  topic: string;

  @ApiProperty({
    description: 'AI provider used',
    example: 'anthropic'
  })
  provider: string;

  @ApiProperty({
    description: 'System prompt used for safety',
    example: 'You are a helpful English tutor...'
  })
  systemPrompt: string;

  @ApiProperty({
    description: 'Session creation timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Recent messages in this session',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        sender: { type: 'string', enum: ['user', 'assistant', 'system'] },
        content: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  messages: Array<{
    id: string;
    sender: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: Date;
  }>;
}

export class TutorMessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  id: string;

  @ApiProperty({
    description: 'Session ID',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  sessionId: string;

  @ApiProperty({
    description: 'Message sender',
    enum: ['user', 'assistant', 'system'],
    example: 'assistant'
  })
  sender: 'user' | 'assistant' | 'system';

  @ApiProperty({
    description: 'Message content',
    example: 'Cats are wonderful animals! They are furry and like to play.'
  })
  content: string;

  @ApiProperty({
    description: 'Message creation timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;
}
