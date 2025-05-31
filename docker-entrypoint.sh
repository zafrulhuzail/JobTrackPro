#!/bin/sh
set -e

# Create necessary directories for uploads
mkdir -p /var/uploads/mara-claims
mkdir -p /app/attached_assets

# Run database migrations
echo "🔄 Running database migration..."
echo "=== MyJobTracker Database Migration ===="
echo "Checking database connection..."
echo "Running database migration..."
npm run db:push

echo "Database migration completed successfully!"
echo "🚀 Starting app..."

# Run the application
exec node dist/index.js