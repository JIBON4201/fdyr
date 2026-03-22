#!/bin/bash

# ============================================
# MALL PLATFORM - DEPLOYMENT SCRIPT
# ============================================

echo "🚀 Starting Mall Platform Deployment..."
echo ""

# Check if .env exists with real values
if grep -q "username:password" .env 2>/dev/null; then
    echo "❌ ERROR: Please update .env with your real PostgreSQL connection string!"
    echo ""
    echo "1. Go to https://neon.tech and create a FREE database"
    echo "2. Copy the connection string"
    echo "3. Update DATABASE_URL and DIRECT_URL in .env file"
    echo ""
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
bun install

echo ""
echo "🔧 Step 2: Generating Prisma client..."
bun run db:generate

echo ""
echo "🗄️ Step 3: Pushing database schema..."
bun run db:push

echo ""
echo "🌱 Step 4: Seeding database with initial data..."
bun run db:seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🚀 Step 5: Ready to deploy!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git add . && git commit -m 'Ready for deploy' && git push"
echo "2. Connect to Vercel: https://vercel.com"
echo "3. Add environment variables: DATABASE_URL and DIRECT_URL"
echo "4. Deploy!"
echo ""
