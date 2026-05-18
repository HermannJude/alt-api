import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  HttpCode,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get()
  getToolList(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.toolsService.getToolList(
      page > 0 ? page : 1,
      limit > 0 ? limit : 10,
    );
  }

  @Get(':id')
  @HttpCode(200)
  getToolById(@Param('id') id: string) {
    return this.toolsService.getTool(+id);
  }

  @Post()
  @HttpCode(201)
  createTool(@Body() createToolDto: CreateToolDto) {
    return this.toolsService.createTool(createToolDto);
  }

  @Put(':id')
  @HttpCode(200)
  updateTool(@Param('id') id: string, @Body() updateToolDto: UpdateToolDto) {
    return this.toolsService.updateTool(+id, updateToolDto);
  }
}
