#!/bin/bash

# TODO: Need test

cd "$(dirname "$0")/.."

echo "Reinstalling all project dependencies..."
echo ""

echo "Step 1: Removing existing dependencies..."
echo ""

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

echo ""
echo "Dependencies removed successfully!"
echo ""

echo "Step 2: Installing fresh dependencies..."
echo ""

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

echo ""
echo "All dependencies reinstalled successfully!"
