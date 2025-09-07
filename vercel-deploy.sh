#!/bin/bash

# 🚀 Vercel Deployment Script for Infograph Generator
echo "🚀 Deploying to Vercel..."
echo "=========================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check for environment variables
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: Create .env.local with your GEMINI_API_KEY"
    echo "   Copy from env.example and add your API key"
fi

# Build and test locally first
echo "🔨 Testing build locally..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎊 Deployment Complete!"
echo "========================"
echo ""
echo "📝 Next Steps:"
echo "1. Add GEMINI_API_KEY in Vercel Dashboard:"
echo "   https://vercel.com/dashboard → Project → Settings → Environment Variables"
echo ""
echo "2. Test your deployment:"
echo "   - Try YouTube transcript fetching"
echo "   - Test infograph generation"
echo "   - Verify all features work"
echo ""
echo "⚠️  Remember: Vercel has 10-second timeout limits"
echo "   If you experience issues, consider Railway deployment"
echo ""
echo "🏆 Ready for hackathon judging!"
