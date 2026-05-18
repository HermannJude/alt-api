.PHONY: help start stop restart logs install build test docs

help:
	@echo "Internal Tools API - Available commands:"
	@echo ""
	@echo "  make start      Start all services (database + API)"
	@echo "  make stop       Stop all services"
	@echo "  make restart    Restart all services"
	@echo "  make logs       View service logs"
	@echo ""
	@echo "  make install    Install dependencies"
	@echo "  make build      Build API"
	@echo "  make test       Run unit tests"
	@echo ""
	@echo "  make docs       Open Swagger documentation"
	@echo ""
	@echo "Quick Start:"
	@echo "  make start && make install && cd api && pnpm start:dev"

start:
	@docker compose up -d
	@echo "✅ Services started!"
	@echo "   🔗 API: http://localhost:3000"
	@echo "   📊 Database: localhost:5432"
	@echo "   🎯 pgAdmin: http://localhost:8081"

stop:
	@docker compose down
	@echo "✅ Services stopped"

restart: stop start
	@echo "✅ Services restarted"

logs:
	@docker compose logs -f

install:
	@cd api && pnpm install

build:
	@cd api && pnpm build

test:
	@cd api && pnpm test

docs:
	@echo "Opening Swagger at http://localhost:3000/api"
	@open http://localhost:3000/api 2>/dev/null || xdg-open http://localhost:3000/api 2>/dev/null || echo "Visit http://localhost:3000/api manually"