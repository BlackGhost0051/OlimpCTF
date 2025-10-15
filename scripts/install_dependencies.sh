#!/bin/bash

cd "$(dirname "$0")/.."

if [ -f "Backend/api/package.json" ]; then
    echo "Installing Backend/api dependencies..."
    cd Backend/api
    sudo npm install
    cd ../..
fi

if [ -f "TaskRunner/api/package.json" ]; then
    echo "Installing TaskRunner/api dependencies..."
    cd TaskRunner/api
    sudo npm install
    cd ../..
fi

if [ -f "Frontend/package.json" ]; then
    echo "Installing Frontend dependencies..."
    cd Frontend
    sudo npm install
    cd ..
fi

echo "All dependencies installed successfully!"
