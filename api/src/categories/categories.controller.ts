import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'List all tool categories',
    description: 'Retrieve all available tool categories in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all categories',
    schema: {
      example: {
        data: [
          { id: 1, name: 'Communication', slug: 'communication' },
          { id: 2, name: 'Development', slug: 'development' },
          { id: 3, name: 'Analytics', slug: 'analytics' },
        ],
      },
    },
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new tool category',
    description: 'Add a new category to the system',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    schema: {
      example: { id: 4, name: 'Security', slug: 'security' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }
}
