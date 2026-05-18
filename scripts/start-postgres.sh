#!/bin/bash

echo "🐘 Starting PostgreSQL + pgAdmin..."
docker compose up -d postgres pgadmin

echo "⏳ Waiting for database to be ready..."
sleep 5

echo "✅ PostgreSQL stack is ready!"
echo ""
echo "📊 Access Information:"
echo "   PostgreSQL: localhost:5432"
echo "   pgAdmin: http://localhost:8081"
echo "   Database: internal_tools"
echo "   User: dev / Password: dev123"
