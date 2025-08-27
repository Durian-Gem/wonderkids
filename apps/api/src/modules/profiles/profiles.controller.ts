import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('profiles')
@ApiBearerAuth()
@Controller('profiles')
@UseGuards(AuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.profilesService.getProfile(req.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.updateProfile(req.userId, updateProfileDto);
  }
}
