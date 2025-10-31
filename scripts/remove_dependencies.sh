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

if [ -f "AdminPanel/node_modules" ]; then
    echo "Removing AdminPanel/node_modules..."
    rm -rf AdminPanel/node_modules
fi

if [ -f "AdminPanel/package-lock.json" ]; then
    echo "Removing AdminPanel/package-lock.json..."
    rm -f AdminPanel/package-lock.json
fi

echo "Dependencies removed successfully!"
