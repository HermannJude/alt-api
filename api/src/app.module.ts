import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ToolsModule } from './tools/tools.module';
import { UsageMetricsModule } from './usage-metrics/usage-metrics.module';
import { CategoriesModule } from './categories/categories.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ToolsModule, CategoriesModule, UsageMetricsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
