#!/bin/bash

cd "$(dirname "$0")/.."

if [ -d "Backend/api/node_modules" ]; then
    echo "Removing Backend/api/node_modules..."
    rm -rf Backend/api/node_modules
fi

if [ -f "Backend/api/package-lock.json" ]; then
    echo "Removing Backend/api/package-lock.json..."
    rm -f Backend/api/package-lock.json
fi

if [ -d "TaskRunner/api/node_modules" ]; then
    echo "Removing TaskRunner/api/node_modules..."
    rm -rf TaskRunner/api/node_modules
fi

if [ -f "TaskRunner/api/package-lock.json" ]; then
    echo "Removing TaskRunner/api/package-lock.json..."
    rm -f TaskRunner/api/package-lock.json
fi

if [ -d "Frontend/node_modules" ]; then
    echo "Removing Frontend/node_modules..."
    rm -rf Frontend/node_modules
fi

if [ -f "Frontend/package-lock.json" ]; then
    echo "Removing Frontend/package-lock.json..."
    rm -f Frontend/package-lock.json
fi

echo "Dependencies removed successfully!"