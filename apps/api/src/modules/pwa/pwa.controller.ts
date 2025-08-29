import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PWAService } from './pwa.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateContentPackDto, UpdateContentPackDto, ContentPackResponseDto, ContentPackListResponseDto } from './dto';

@ApiTags('pwa')
@Controller('pwa')
export class PWAController {
  constructor(private readonly pwaService: PWAService) {}

  @Get('packs')
  @ApiOperation({ 
    summary: 'Get published content packs',
    description: 'Returns list of published content packs for offline caching'
  })
  @ApiResponse({
    status: 200,
    description: 'Published content packs retrieved successfully',
    type: ContentPackListResponseDto
  })
  async getPublishedPacks() {
    return this.pwaService.getPublishedPacks();
  }

  @Get('packs/:code')
  @ApiOperation({ 
    summary: 'Get content pack by code',
    description: 'Returns specific content pack details by its unique code'
  })
  @ApiResponse({
    status: 200,
    description: 'Content pack retrieved successfully',
    type: ContentPackResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Content pack not found'
  })
  async getPackByCode(@Param('code') code: string) {
    return this.pwaService.getPackByCode(code);
  }

  // Admin endpoints (protected)
  @Post('admin/packs')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'Create content pack (Admin)',
    description: 'Creates a new content pack with assets list'
  })
  @ApiResponse({
    status: 201,
    description: 'Content pack created successfully',
    type: ContentPackResponseDto
  })
  @ApiResponse({
    status: 409,
    description: 'Content pack with this code already exists'
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required'
  })
  async createContentPack(@Body() createPackDto: CreateContentPackDto) {
    return this.pwaService.createContentPack(createPackDto);
  }

  @Put('admin/packs/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'Update content pack (Admin)',
    description: 'Updates an existing content pack'
  })
  @ApiResponse({
    status: 200,
    description: 'Content pack updated successfully',
    type: ContentPackResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Content pack not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required'
  })
  async updateContentPack(
    @Param('id') packId: string,
    @Body() updatePackDto: UpdateContentPackDto
  ) {
    return this.pwaService.updateContentPack(packId, updatePackDto);
  }

  @Delete('admin/packs/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'Delete content pack (Admin)',
    description: 'Deletes a content pack'
  })
  @ApiResponse({
    status: 200,
    description: 'Content pack deleted successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Content pack not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required'
  })
  async deleteContentPack(@Param('id') packId: string) {
    return this.pwaService.deleteContentPack(packId);
  }

  @Get('admin/packs')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'Get all content packs (Admin)',
    description: 'Returns all content packs including unpublished ones'
  })
  @ApiResponse({
    status: 200,
    description: 'All content packs retrieved successfully',
    type: ContentPackListResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required'
  })
  async getAllPacks() {
    return this.pwaService.getAllPacks();
  }

  @Post('admin/generate-samples')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'Generate sample content packs (Admin)',
    description: 'Creates sample A1 level content packs for testing'
  })
  @ApiResponse({
    status: 201,
    description: 'Sample content packs generated successfully'
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required'
  })
  async generateSamplePacks() {
    return this.pwaService.generateSamplePacks();
  }
}
