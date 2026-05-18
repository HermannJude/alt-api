-- CreateEnum
CREATE TYPE "Department" AS ENUM ('Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Design');

-- CreateEnum
CREATE TYPE "ToolStatus" AS ENUM ('active', 'deprecated', 'trial');

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "color_hex" VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tools" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "vendor" VARCHAR(100),
    "website_url" VARCHAR(255),
    "category_id" INTEGER NOT NULL,
    "monthly_cost" DECIMAL(10,2) NOT NULL,
    "active_users_count" INTEGER NOT NULL DEFAULT 0,
    "owner_department" "Department" NOT NULL,
    "status" "ToolStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_metrics" (
    "id" SERIAL NOT NULL,
    "tool_id" INTEGER NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "avg_session_minutes" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "tools_category_id_idx" ON "tools"("category_id");

-- CreateIndex
CREATE INDEX "tools_owner_department_idx" ON "tools"("owner_department");

-- CreateIndex
CREATE INDEX "tools_status_idx" ON "tools"("status");

-- CreateIndex
CREATE INDEX "tools_active_users_count_idx" ON "tools"("active_users_count");

-- CreateIndex
CREATE INDEX "usage_metrics_tool_id_idx" ON "usage_metrics"("tool_id");

-- CreateIndex
CREATE INDEX "usage_metrics_period_start_period_end_idx" ON "usage_metrics"("period_start", "period_end");

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_metrics" ADD CONSTRAINT "usage_metrics_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
