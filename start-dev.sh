#!/bin/bash
# Agora Development Startup Script
# Starts both frontend (Angular) and backend (.NET) for local development

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$SCRIPT_DIR/../agora-api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Agora Development Environment ===${NC}"
echo ""

# Check if agora-api directory exists
if [ ! -d "$API_DIR" ]; then
    echo -e "${RED}Error: agora-api directory not found at $API_DIR${NC}"
    echo "Make sure the agora-api repo is cloned alongside this repo."
    exit 1
fi

# Check if .env exists in backend
if [ ! -f "$API_DIR/.env" ]; then
    echo -e "${YELLOW}Warning: No .env file found in agora-api${NC}"
    echo "Backend requires ACCESS_KEY, SECRET_KEY, JWT_KEY, PASSWORD_SALT"
    echo ""
fi

# Reminder about API URL
echo -e "${YELLOW}Reminder: Make sure to toggle the API URL in src/app/utils/constants.ts${NC}"
echo "  - Comment out the Lambda URL"
echo "  - Uncomment: http://localhost:5191"
echo ""

# Start backend in background
echo -e "${GREEN}Starting backend (dotnet run)...${NC}"
cd "$API_DIR"
dotnet run &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down...${NC}"
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID 2>/dev/null
        echo "Backend stopped."
    fi
    exit 0
}

# Set trap for cleanup on exit
trap cleanup SIGINT SIGTERM EXIT

# Start frontend in foreground
echo -e "${GREEN}Starting frontend (npm start)...${NC}"
echo ""
cd "$SCRIPT_DIR"
npm start
