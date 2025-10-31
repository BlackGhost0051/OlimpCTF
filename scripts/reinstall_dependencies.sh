#!/bin/bash

echo "Reinstalling all project dependencies..."
echo ""

echo ""
echo "Step 1: Removing existing dependencies..."
echo ""

./remove_dependencies.sh

echo ""
echo "Step 2: Installing fresh dependencies..."
echo ""

./install_dependencies.sh

echo ""
echo "Done"