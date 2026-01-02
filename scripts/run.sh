#!/usr/bin/bash

set -e

echo "Starting OlimpCTF Platform..."

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Error: docker-compose is not installed"
    exit 1
fi

if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

cd "$(dirname "$0")/.."

echo "Building and starting services..."
$DOCKER_COMPOSE up --build

# Access URLs:
# - Frontend:         http://localhost:4200
# - Admin Panel:      http://localhost:4201
# - Backend API:      http://localhost:5000
# - Task Runner API:  http://localhost:5001
# - PgAdmin:          http://localhost:5050
