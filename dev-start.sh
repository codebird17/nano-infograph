#!/bin/bash

# Development startup script for Infographic Generator
# Starts both Python API and Next.js app

echo "🚀 Starting Infographic Generator Development Environment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required but not installed${NC}"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    exit 1
fi

# Function to kill background processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    jobs -p | xargs -r kill
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Python API in background
echo -e "${BLUE}📡 Starting Python API server...${NC}"
cd python-api

# Install Python dependencies if needed
if [ ! -d "venv" ] || [ ! -f ".deps_installed" ]; then
    echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
    python3 -m pip install -r requirements.txt > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        touch .deps_installed
        echo -e "${GREEN}✅ Python dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install Python dependencies${NC}"
        exit 1
    fi
fi

# Start Python server
python3 main.py &
PYTHON_PID=$!

# Wait a moment for Python server to start
sleep 2

# Check if Python server started successfully
if ps -p $PYTHON_PID > /dev/null; then
    echo -e "${GREEN}✅ Python API server started on http://localhost:8001${NC}"
else
    echo -e "${RED}❌ Failed to start Python API server${NC}"
    exit 1
fi

# Go back to root directory
cd ..

# Install Node.js dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    if command -v bun &> /dev/null; then
        bun install > /dev/null 2>&1
    else
        npm install > /dev/null 2>&1
    fi
    echo -e "${GREEN}✅ Node.js dependencies installed${NC}"
fi

# Start Next.js development server
echo -e "${BLUE}⚡ Starting Next.js development server...${NC}"
if command -v bun &> /dev/null; then
    bun dev &
else
    npm run dev &
fi
NEXTJS_PID=$!

# Wait a moment for Next.js server to start
sleep 3

echo -e "\n${GREEN}🎉 Both servers are running!${NC}"
echo -e "${GREEN}📡 Python API: http://localhost:8001${NC}"
echo -e "${GREEN}🌐 Next.js App: http://localhost:3000${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Wait for user to stop
wait
