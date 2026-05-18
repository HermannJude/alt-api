#!/bin/bash

echo "🧪 Testing database connections..."

# Test PostgreSQL if running  
if docker ps | grep -q "internal-tools-postgres"; then
    echo "📡 Testing PostgreSQL connection..."
    if docker exec internal-tools-postgres psql -U ${POSTGRES_USER:-dev} -d ${POSTGRES_DATABASE:-internal_tools} -c "SELECT 'PostgreSQL OK' as status;" 2>/dev/null; then
        echo "✅ PostgreSQL connection successful"
        echo "🔗 pgAdmin: http://localhost:${PGADMIN_PORT:-8081}"
    else
        echo "❌ PostgreSQL connection failed"
    fi
else
    echo "⚫ PostgreSQL not running"
fi

echo ""
echo "📋 Current running containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
