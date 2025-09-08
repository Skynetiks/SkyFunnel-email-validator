#!/bin/bash
set -e

REPO_PATH="/root/SkyFunnel-email-validator"
DOCKER_COMPOSE_FILE="$REPO_PATH/docker-compose.yml"

# Export image names from workflow env
export APP_IMAGE_NAME=${APP_IMAGE_NAME}
export GO_IMAGE_NAME=${GO_IMAGE_NAME}

if [ -f "$DOCKER_COMPOSE_FILE" ]; then
    echo "🚀 Starting services with docker-compose..."
    docker compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans
    docker compose -f "$DOCKER_COMPOSE_FILE" up -d
else
    echo "❌ docker-compose.yml not found!"
    exit 1
fi

echo "✅ Reload complete!"
