import { IsArray, IsUUID, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerDto {
  @ApiProperty({
    description: 'ID of the question being answered',
    example: '550e8400-e29b-41d4-a716-446655440002'
  })
  @IsUUID()
  questionId: string;

  @ApiProperty({
    description: 'Response data (format depends on activity type)',
    example: { "selectedOptions": ["Hello"] },
    additionalProperties: true
  })
  @IsObject()
  response: Record<string, any>;
}

export class SubmitAnswersDto {
  @ApiProperty({
    description: 'Array of answers for the attempt',
    type: [AnswerDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
