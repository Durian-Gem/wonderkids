import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChildrenService } from './children.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

@ApiTags('children')
@ApiBearerAuth()
@Controller('children')
@UseGuards(AuthGuard)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get()
  @ApiOperation({ summary: 'Get all children for current guardian' })
  async getChildren(@Request() req) {
    return this.childrenService.getChildren(req.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new child profile' })
  async createChild(@Request() req, @Body() createChildDto: CreateChildDto) {
    return this.childrenService.createChild(req.userId, createChildDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a child profile' })
  async updateChild(
    @Request() req,
    @Param('id') id: string,
    @Body() updateChildDto: UpdateChildDto,
  ) {
    return this.childrenService.updateChild(req.userId, id, updateChildDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a child profile' })
  async deleteChild(@Request() req, @Param('id') id: string) {
    return this.childrenService.deleteChild(req.userId, id);
  }
}
