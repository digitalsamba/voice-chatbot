#!/bin/bash

# This script deploys the voice-chatbot application on the server

# Exit immediately if a command exits with a non-zero status
set -e

# Ensure we're in the correct directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Ensure .env file exists or create from example
if [ ! -f .env ]; then
  echo "Warning: .env file not found. Creating from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Created .env file. Please edit it with your actual values."
    echo "For now, deployment will continue, but you must update OPENAI_API_KEY."
  else
    echo "Error: Neither .env nor .env.example files found. Cannot continue."
    exit 1
  fi
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Pull the latest Docker image from GitHub Container Registry
echo "Pulling latest Docker image..."
docker-compose -f docker-compose.prod.yml pull

# Restart the containers
echo "Restarting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Check the logs
echo "Checking logs..."
docker-compose -f docker-compose.prod.yml logs --tail=20 voice-chatbot

echo "Deployment completed successfully!"
echo "To view logs in real-time, use: docker-compose -f docker-compose.prod.yml logs -f voice-chatbot"