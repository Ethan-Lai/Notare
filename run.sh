#!/bin/bash

set -e
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    POSTGRES_START_CMD="sudo service postgresql start"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    POSTGRES_START_CMD="brew services start postgresql"
else
    echo "currently unsupported OS: $OSTYPE"
    exit 1
fi
$POSTGRES_START_CMD
cd "$(dirname "$0")"

# Check for required environment variables
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please run setup.sh first."
    exit 1
fi

source .env
if [ -z "$IRON_KEY" ] || [ "$IRON_KEY" = "REPLACE_WITH_YOUR_IRON_KEY" ]; then
    echo "Error: IRON_KEY not set. Please update your .env file with a valid IRON_KEY."
    exit 1
fi

if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "REPLACE_WITH_YOUR_GEMINI_API_KEY" ]; then
    echo "Error: GEMINI_API_KEY not set. Please update your .env file with a valid GEMINI_API_KEY."
    exit 1
fi

npx prisma generate
npm run dev

