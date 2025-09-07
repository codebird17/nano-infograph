#!/bin/bash

# 🚀 Deployment Helper Script for Infograph Generator
# This script helps prepare your application for deployment

echo "🎯 Infograph Generator - Deployment Preparation"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "python-api" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Check for required files
echo "📋 Checking deployment requirements..."

if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Copy env.example to .env.local and add your API keys"
else
    echo "✅ Environment file found"
fi

if [ ! -f "python-api/requirements.txt" ]; then
    echo "❌ Error: python-api/requirements.txt not found"
    exit 1
else
    echo "✅ Python requirements file found"
fi

# Test build locally
echo "🔨 Testing Next.js build..."
npm install > /dev/null 2>&1
if npm run build > /dev/null 2>&1; then
    echo "✅ Next.js build successful"
else
    echo "❌ Error: Next.js build failed. Fix build errors before deploying"
    exit 1
fi

# Test Python API dependencies
echo "🐍 Testing Python dependencies..."
cd python-api
if python3 -c "import youtube_transcript_api, yt_dlp, pytube, fastapi" > /dev/null 2>&1; then
    echo "✅ Python dependencies available"
else
    echo "⚠️  Warning: Some Python dependencies missing. Install with: pip install -r requirements.txt"
fi
cd ..

echo ""
echo "🚀 Deployment Options:"
echo "======================"
echo "1. Railway (Recommended): https://railway.app"
echo "   - Deploy both frontend and backend from same repo"
echo "   - Auto-detects and builds both services"
echo "   - Free tier with $5 monthly credit"
echo ""
echo "2. Render: https://render.com"
echo "   - Deploy frontend and backend separately"
echo "   - Free tier with some limitations"
echo ""
echo "3. Vercel + Railway Split:"
echo "   - Frontend on Vercel (fastest)"
echo "   - Backend on Railway"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "🔑 Remember to set these environment variables:"
echo "   - GEMINI_API_KEY=your_api_key"
echo "   - PYTHON_API_URL=your_backend_url"
echo ""
echo "🎊 Ready for deployment! Good luck with your hackathon! 🏆"
