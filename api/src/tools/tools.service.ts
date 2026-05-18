import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@Injectable()
export class ToolsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createToolDto: CreateToolDto) {
    return this.prisma.tool.create({
      data: createToolDto as Prisma.ToolCreateInput,
    });
  }

  findAll() {
    return this.prisma.tool.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.tool.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateToolDto: UpdateToolDto) {
    return this.prisma.tool.update({
      where: {
        id,
      },
      data: updateToolDto as Prisma.ToolUpdateInput,
    });
  }

  remove(id: number) {
    return this.prisma.tool.delete({
      where: {
        id,
      },
    });
  }
}
