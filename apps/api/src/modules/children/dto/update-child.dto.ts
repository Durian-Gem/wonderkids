import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsInt, Min, Max, IsIn } from 'class-validator';

export class UpdateChildDto {
  @ApiProperty({ description: 'Child display name', required: false })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @ApiProperty({ description: 'Birth year', required: false, minimum: 2010, maximum: 2025 })
  @IsOptional()
  @IsInt()
  @Min(2010)
  @Max(2025)
  birth_year?: number;

  @ApiProperty({ description: 'Locale', required: false, enum: ['en', 'vi'] })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'vi'])
  locale?: string;
}
