import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, IsIn } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Display name', required: false })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @ApiProperty({ description: 'User locale', required: false, enum: ['en', 'vi'] })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'vi'])
  locale?: string;
}
