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
  NotFoundException,
} from '@nestjs/common';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get()
  @HttpCode(200)
  async getToolList(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const tools = await this.toolsService.getToolList(
      page > 0 ? page : 1,
      limit > 0 ? limit : 10,
    );
    return tools;
  }

  @Get(':id')
  @HttpCode(200)
  async getTool(@Param('id', ParseIntPipe) id: number) {
    const tool = await this.toolsService.findToolById(id);

    if (!tool) {
      throw new NotFoundException(`Tool with ID ${id} does not exist`);
    }

    return tool;
  }

  @Post()
  @HttpCode(201)
  async createTool(@Body() createToolDto: CreateToolDto) {
    return await this.toolsService.createTool(createToolDto);
  }

  @Put(':id')
  @HttpCode(200)
  updateTool(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateToolDto: UpdateToolDto,
  ) {
    return this.toolsService.updateTool(id, updateToolDto);
  }
}
