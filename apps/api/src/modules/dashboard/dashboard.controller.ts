import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import {
  DashboardSummaryQueryDto,
  DashboardSummaryResponseDto,
} from './dto/dashboard-summary.dto';
import {
  DashboardMasteryQueryDto,
  DashboardMasteryResponseDto,
} from './dto/dashboard-mastery.dto';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get dashboard summary metrics',
    description:
      'Returns learning metrics including minutes learned, lessons completed, streak, and badges for the authenticated user or specified child.',
  })
  @ApiQuery({
    name: 'childId',
    required: false,
    description: 'Optional child ID to get metrics for (guardians only)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary retrieved successfully',
    type: DashboardSummaryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found or access denied',
  })
  async getDashboardSummary(
    @Query() query: DashboardSummaryQueryDto,
    @Request() req: any,
  ): Promise<DashboardSummaryResponseDto> {
    const userId = req.user.sub;
    return this.dashboardService.getDashboardSummary(userId, query.childId);
  }

  @Get('mastery')
  @ApiOperation({
    summary: 'Get lesson mastery data',
    description:
      'Returns detailed mastery information for each lesson, including completion status, scores, and progress for dashboard heatmaps and analytics.',
  })
  @ApiQuery({
    name: 'childId',
    required: false,
    description: 'Optional child ID to get mastery for (guardians only)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Mastery data retrieved successfully',
    type: DashboardMasteryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found or access denied',
  })
  async getDashboardMastery(
    @Query() query: DashboardMasteryQueryDto,
    @Request() req: any,
  ): Promise<DashboardMasteryResponseDto> {
    const userId = req.user.sub;
    return this.dashboardService.getDashboardMastery(userId, query.childId);
  }
}
