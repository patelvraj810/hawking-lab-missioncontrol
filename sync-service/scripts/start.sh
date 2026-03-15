#!/bin/bash

# OpenClaw Sync Service Startup Script
# Usage: ./scripts/start.sh [--dev]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Check for .env file
if [ ! -f ".env" ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "Please edit .env with your configuration before running again."
  exit 1
fi

# Run in dev or production mode
if [ "$1" == "--dev" ]; then
  echo "Starting in development mode..."
  npm run dev
else
  echo "Building and starting in production mode..."
  npm run build
  npm start
fi