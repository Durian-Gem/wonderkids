import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMessageDto {
  @ApiProperty({
    description: 'Message content from user (max 60 words for safety)',
    example: 'Tell me about cats',
    maxLength: 300
  })
  @IsString()
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(300, { message: 'Message too long. Please keep it under 60 words.' })
  content: string;
}
