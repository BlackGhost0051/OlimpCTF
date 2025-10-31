#!/bin/bash

cd "$(dirname "$0")/.."

if [ -f "Backend/api/package.json" ]; then
    echo "Installing Backend/api dependencies..."
    cd Backend/api
    npm install
    cd ../..
fi

if [ -f "TaskRunner/api/package.json" ]; then
    echo "Installing TaskRunner/api dependencies..."
    cd TaskRunner/api
    npm install
    cd ../..
fi

if [ -f "Frontend/package.json" ]; then
    echo "Installing Frontend dependencies..."
    cd Frontend
    npm install
    cd ..
fi

if [ -f "AdminPanel/package.json" ]; then
    echo "Installing AdminPanel dependencies..."
    cd AdminPanel
    npm install
    cd ..
fi

echo "All dependencies installed successfully!"
