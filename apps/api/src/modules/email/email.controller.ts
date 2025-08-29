import {
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { AuthGuard } from '../auth/auth.guard';
import { EmailJobResponseDto } from './dto';

@ApiTags('email')
@ApiBearerAuth()
@Controller('email')
@UseGuards(AuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-weekly-now')
  @ApiOperation({ 
    summary: 'Send weekly summary email now (Dev/Admin)',
    description: 'Manually triggers a weekly summary email for the current user for testing purposes'
  })
  @ApiResponse({
    status: 201,
    description: 'Weekly summary email sent successfully',
    type: EmailJobResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required'
  })
  async sendWeeklyNow(@Request() req) {
    return this.emailService.sendWeeklyNow(req.userId);
  }
}
