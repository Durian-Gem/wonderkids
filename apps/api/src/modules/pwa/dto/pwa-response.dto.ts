import { ApiProperty } from '@nestjs/swagger';

export class ContentPackResponseDto {
  @ApiProperty({
    description: 'Content pack ID',
    example: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d'
  })
  id: string;

  @ApiProperty({
    description: 'Unique pack code',
    example: 'a1-u1'
  })
  code: string;

  @ApiProperty({
    description: 'Pack title',
    example: 'Animals Unit 1'
  })
  title: string;

  @ApiProperty({
    description: 'Pack description',
    example: 'Learn about domestic animals with fun activities'
  })
  description: string;

  @ApiProperty({
    description: 'List of assets in this pack',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        hash: { type: 'string' },
        bytes: { type: 'number' },
        kind: { type: 'string' }
      }
    }
  })
  assets: Array<{
    url: string;
    hash: string;
    bytes: number;
    kind: string;
  }>;

  @ApiProperty({
    description: 'Whether the pack is published',
    example: true
  })
  isPublished: boolean;

  @ApiProperty({
    description: 'Pack creation timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;
}

export class ContentPackListResponseDto {
  @ApiProperty({
    description: 'List of available content packs',
    type: [ContentPackResponseDto]
  })
  packs: ContentPackResponseDto[];

  @ApiProperty({
    description: 'Total number of packs',
    example: 5
  })
  total: number;

  @ApiProperty({
    description: 'Total size of all assets in bytes',
    example: 1234567
  })
  totalBytes: number;
}
