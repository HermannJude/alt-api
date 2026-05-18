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
import { async, skip } from 'rxjs';

@Injectable()
export class ToolsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTool(createToolDto: CreateToolDto): Promise<ToolResponseDto> {
    try {
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Category does not exist. Please provide a valid categoryId.',
          );
        }

        if (error.code === 'P2002') {
          throw new ConflictException(
            'A tool with the same unique value already exists.',
          );
        }
      }

      throw error;
    }
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

  async getTool(id: number): Promise<ToolResponseDto> {
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
      throw new NotFoundException(`Tool with ID ${id} does not exist`);
    }

    return this.mapToolToResponse(tool, tool.category);
  }

  async updateTool(
    id: number,
    updateToolDto: UpdateToolDto,
  ): Promise<ToolResponseDto> {
    const existingTool = await this.prisma.tool.findUnique({
      where: { id },
    });

    if (!existingTool) {
      throw new NotFoundException(`Tool with ID ${id} does not exist`);
    }

    try {
      const tool = await this.prisma.tool.update({
        where: { id },
        data: {
          ...(updateToolDto.name !== undefined && { name: updateToolDto.name }),
          ...(updateToolDto.description !== undefined && {
            description: updateToolDto.description,
          }),
          ...(updateToolDto.vendor !== undefined && {
            vendor: updateToolDto.vendor,
          }),
          ...(updateToolDto.websiteUrl !== undefined && {
            websiteUrl: updateToolDto.websiteUrl,
          }),
          ...(updateToolDto.categoryId !== undefined && {
            categoryId: updateToolDto.categoryId,
          }),
          ...(updateToolDto.monthlyCost !== undefined && {
            monthlyCost: updateToolDto.monthlyCost,
          }),
          ...(updateToolDto.ownerDepartment !== undefined && {
            ownerDepartment: updateToolDto.ownerDepartment,
          }),
          ...(updateToolDto.status !== undefined && {
            status: updateToolDto.status,
          }),
        },
        include: {
          category: true,
        },
      });

      return this.mapToolToResponse(tool, tool.category);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Category does not exist. Please provide a valid categoryId.',
        );
      }
      throw error;
    }
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
