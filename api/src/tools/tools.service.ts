import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { ToolListResponseDto, ToolResponseDto } from './dto/tool.dto';

@Injectable()
export class ToolsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTool(createToolDto: CreateToolDto): Promise<ToolResponseDto> {
    const tool = await this.prisma.tool.create({
      data: {
        name: createToolDto.name,
        description: createToolDto.description,
        vendor: createToolDto.vendor,
        websiteUrl: createToolDto.websiteUrl,
        categoryId: createToolDto.categoryId,
        monthlyCost: createToolDto.monthlyCost,
        ownerDepartment: createToolDto.ownerDepartment,
        status: createToolDto.status || 'active',
      },
      include: { category: true },
    });
    return this.mapToolToResponse(tool, tool.category);
  }

  async getToolList(
    page: number = 1,
    limit: number = 10,
  ): Promise<ToolListResponseDto> {
    const skip = (page - 1) * limit;

    const [tools, total] = await Promise.all([
      this.prisma.tool.findMany({
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: {
          id: 'asc',
        },
      }),
      this.prisma.tool.count(),
    ]);

    const data = tools.map((tool) =>
      this.mapToolToResponse(tool, tool.category),
    );

    return {
      data,
      total,
      filtered: data.length,
      filters_applied: {},
    };
  }

  async findToolById(id: number): Promise<ToolResponseDto | null> {
    const tool = await this.prisma.tool.findUnique({
      where: { id },
      include: {
        category: true,
        usageMetrics: {
          orderBy: {
            periodStart: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!tool) {
      return null;
    }

    return this.mapToolToResponse(tool, tool.category);
  }

  async updateTool(
    id: number,
    updateToolDto: UpdateToolDto,
  ): Promise<ToolResponseDto> {
    const tool = await this.prisma.tool.update({
      where: { id },
      data: {
        name: updateToolDto.name,
        description: updateToolDto.description,
        vendor: updateToolDto.vendor,
        websiteUrl: updateToolDto.websiteUrl,
        categoryId: updateToolDto.categoryId,
        monthlyCost: updateToolDto.monthlyCost,
        ownerDepartment: updateToolDto.ownerDepartment,
        status: updateToolDto.status,
      },
      include: { category: true },
    });

    return this.mapToolToResponse(tool, tool.category);
  }

  private mapToolToResponse(tool: any, category?: any): ToolResponseDto {
    return {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      vendor: tool.vendor,
      website_url: tool.websiteUrl,
      category: category?.name || 'Unknown',
      monthly_cost: Number(tool.monthlyCost),
      owner_department: tool.ownerDepartment,
      status: tool.status,
      active_users_count: tool.activeUsersCount,
      created_at: tool.createdAt,
      updated_at: tool.updatedAt,
    };
  }
}
