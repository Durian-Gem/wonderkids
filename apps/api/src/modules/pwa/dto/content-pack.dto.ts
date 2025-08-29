import { IsString, IsBoolean, IsArray, IsOptional, ValidateNested, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AssetDto {
  @ApiProperty({
    description: 'Asset URL',
    example: '/images/animals/cat.jpg'
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: 'Asset hash for cache invalidation',
    example: 'abc123def456'
  })
  @IsString()
  hash: string;

  @ApiProperty({
    description: 'Asset size in bytes',
    example: 12345
  })
  bytes: number;

  @ApiProperty({
    description: 'Asset type/kind',
    example: 'image',
    enum: ['image', 'audio', 'video', 'json', 'html', 'css', 'js']
  })
  @IsString()
  kind: string;
}

export class CreateContentPackDto {
  @ApiProperty({
    description: 'Unique pack code',
    example: 'a1-u1'
  })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'Pack title',
    example: 'Animals Unit 1'
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Pack description',
    example: 'Learn about domestic animals with fun activities'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'List of assets in this pack',
    type: [AssetDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetDto)
  assets: AssetDto[];

  @ApiPropertyOptional({
    description: 'Whether the pack is published',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateContentPackDto {
  @ApiPropertyOptional({
    description: 'Pack title',
    example: 'Animals Unit 1 - Updated'
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Pack description',
    example: 'Updated description'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'List of assets in this pack',
    type: [AssetDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetDto)
  assets?: AssetDto[];

  @ApiPropertyOptional({
    description: 'Whether the pack is published',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
