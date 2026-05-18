# Internal Tools API

Production-ready REST API for managing SaaS tool subscriptions across departments.

## Stack

| Component     | Technology                   |
| ------------- | ---------------------------- |
| Runtime       | Node.js 24.x                 |
| Framework     | NestJS 11.x + TypeScript 5.7 |
| Database      | PostgreSQL 15 + Prisma ORM   |
| Testing       | Jest (18 tests)              |
| Documentation | Swagger/OpenAPI              |

## What's Done

- **Tools Endpoints**: GET (list/filter/sort/paginate), POST, PUT, GET by ID
- **Categories Endpoints**: GET (list), POST (create)
- **UsageMetrics Endpoints**: GET (with tool filter), POST (record)
- **Validation**: Input validation with support for camelCase + snake_case
- **Error Handling**: Centralized exception filter with proper HTTP codes
- **Documentation**: Full Swagger UI with examples

## Quick Start

```bash
# Set .env or copy environment variables from .env.example to .env and update if needed
cp .env.example .env

# Start services (database + API container)
make start
# Or
docker-compose up -d

# Install dependencies
make install
# Or
cd api && pnpm install

#  Run in watch mode
cd api && pnpm start:dev
```

**Services running:**

- API: http://localhost:3000
- Swagger: http://localhost:3000/api
- Database: localhost:5432
- pgAdmin: http://localhost:8081

## Swagger Usage

Navigate to **http://localhost:3000/api** to:

- View all endpoint documentation
- Test endpoints directly in browser
- See request/response examples
- Validate input schemas

## Makefile Commands

```bash
make help       # Show all commands
make start      # Start all services
make stop       # Stop all services
make restart    # Restart services
make logs       # View logs
make install    # Install dependencies
make build      # Build for production
make test       # Run unit tests
make docs       # Open Swagger (browser)
```

## CI/CD Pipeline

**Before cloning/starting work:**
Check GitHub Actions status to ensure builds are passing:

- Navigate to `.github/workflows/test.yml` in Actions tab
- Verify latest run: **Build → Test → Deploy** all passing
- If red, see failure details before starting local development

**Pipeline steps:**

1. Install dependencies (`pnpm install`)
2. Generate Prisma client
3. Build project (`pnpm build`)
4. Run tests (`pnpm test`)

If CI is passing, your local environment should also work smoothly.

## Testing

```bash
# Unit tests
make test

# Tests in watch mode
cd api && pnpm test:watch
```

## Endpoints Reference

### Tools

- `GET /api/tools` - List all (with filters: department, status, min_cost, max_cost, sort, pagination)
- `GET /api/tools/:id` - Get by ID
- `POST /api/tools` - Create (returns 201)
- `PUT /api/tools/:id` - Update (returns 200)

### Categories

- `GET /api/categories` - List all
- `POST /api/categories` - Create

### UsageMetrics

- `GET /api/usage-metrics?toolId=1` - List (filterable)
- `POST /api/usage-metrics` - Record
