#!/bin/bash

set -e
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🔹 Detected Linux..."
    POSTGRES_START_CMD="sudo service postgresql start"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🔹 Detected macOS..."
    POSTGRES_START_CMD="brew services start postgresql"
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi
$POSTGRES_START_CMD
cd "$(dirname "$0")"
npx prisma generate
npm run dev

