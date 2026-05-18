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
import { QueryToolsDto } from './dto/query-tools.dto';

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

  async getToolList(query: QueryToolsDto): Promise<ToolListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereCondition(query);
    const orderBy = this.buildOrderBy(query);

    const [tools, total, filtered] = await Promise.all([
      this.prisma.tool.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy,
      }),
      this.prisma.tool.count(),
      this.prisma.tool.count({ where }),
    ]);

    const data = tools.map((tool) =>
      this.mapToolToResponse(tool, tool.category),
    );

    const filters_applied = this.buildFiltersApplied(query, page, limit);

    return {
      data,
      total,
      filtered,
      filters_applied,
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

  private buildWhereCondition(query: QueryToolsDto): Prisma.ToolWhereInput {
    const where: Prisma.ToolWhereInput = {};

    if (query.department) {
      where.ownerDepartment = query.department;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.min_cost !== undefined || query.max_cost !== undefined) {
      where.monthlyCost = {};
      if (query.min_cost !== undefined) {
        where.monthlyCost.gte = query.min_cost;
      }
      if (query.max_cost !== undefined) {
        where.monthlyCost.lte = query.max_cost;
      }
    }

    if (query.category) {
      where.category = {
        name: { equals: query.category, mode: 'insensitive' },
      };
    }

    return where;
  }

  private buildOrderBy(
    query: QueryToolsDto,
  ): Prisma.ToolOrderByWithRelationInput {
    switch (query.sort) {
      case 'name_asc':
        return { name: 'asc' };
      case 'name_desc':
        return { name: 'desc' };
      case 'cost_asc':
        return { monthlyCost: 'asc' };
      case 'cost_desc':
        return { monthlyCost: 'desc' };
      case 'created_at_asc':
        return { createdAt: 'asc' };
      case 'created_at_desc':
        return { createdAt: 'desc' };
      default:
        return { id: 'asc' };
    }
  }

  private buildFiltersApplied(
    query: QueryToolsDto,
    page: number,
    limit: number,
  ): Record<string, string | number | boolean | null> {
    const filters_applied: Record<string, string | number | boolean | null> =
      {};

    if (query.department) filters_applied.department = query.department;
    if (query.status) filters_applied.status = query.status;
    if (query.min_cost !== undefined) filters_applied.min_cost = query.min_cost;
    if (query.max_cost !== undefined) filters_applied.max_cost = query.max_cost;
    if (query.category) filters_applied.category = query.category;
    if (query.sort) filters_applied.sort = query.sort;
    filters_applied.page = page;
    filters_applied.limit = limit;

    return filters_applied;
  }
}
