import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TutorService } from './tutor.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateSessionDto, AddMessageDto, TutorSessionResponseDto, TutorMessageResponseDto } from './dto';

@ApiTags('tutor')
@ApiBearerAuth()
@Controller('tutor')
@UseGuards(AuthGuard)
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post('sessions')
  @ApiOperation({ 
    summary: 'Create a new AI tutor session',
    description: 'Creates a new tutoring session with kid-safe topic boundaries'
  })
  @ApiResponse({
    status: 201,
    description: 'Session created successfully',
    type: TutorSessionResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid topic or validation error'
  })
  async createSession(@Request() req, @Body() createSessionDto: CreateSessionDto) {
    return this.tutorService.createSession(req.userId, createSessionDto);
  }

  @Post('sessions/:id/messages')
  @ApiOperation({ 
    summary: 'Add a message to tutor session',
    description: 'Sends a user message and receives AI tutor response with safety filtering'
  })
  @ApiResponse({
    status: 201,
    description: 'Message exchange completed successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            userMessage: { $ref: '#/components/schemas/TutorMessageResponseDto' },
            aiMessage: { $ref: '#/components/schemas/TutorMessageResponseDto' }
          }
        },
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Message contains blocked content or exceeds length limit'
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found'
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to access this session'
  })
  async addMessage(
    @Request() req,
    @Param('id') sessionId: string,
    @Body() addMessageDto: AddMessageDto
  ) {
    return this.tutorService.addMessage(req.userId, sessionId, addMessageDto);
  }

  @Get('sessions/:id')
  @ApiOperation({ 
    summary: 'Get tutor session with messages',
    description: 'Retrieves session details and conversation history (guardian can view child sessions)'
  })
  @ApiResponse({
    status: 200,
    description: 'Session retrieved successfully',
    type: TutorSessionResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found'
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to access this session'
  })
  async getSession(@Request() req, @Param('id') sessionId: string) {
    return this.tutorService.getSession(req.userId, sessionId);
  }

  @Get('sessions')
  @ApiOperation({ 
    summary: 'Get user\'s recent tutor sessions',
    description: 'Lists recent tutor sessions for the user and their children'
  })
  @ApiResponse({
    status: 200,
    description: 'Sessions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              topic: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              children: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' }
                }
              }
            }
          }
        },
        success: { type: 'boolean' }
      }
    }
  })
  async getUserSessions(@Request() req) {
    return this.tutorService.getUserSessions(req.userId);
  }
}
