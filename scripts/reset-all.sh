#!/bin/bash

echo "🔄 Resetting all database data..."

read -p "⚠️  This will destroy ALL data. Continue? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 Stopping all containers..."
    docker compose down -v
    
    echo "✅ All data reset completed!"
    echo "💡 Run 'make start' to restart"
else
    echo "❌ Reset cancelled"
fi
