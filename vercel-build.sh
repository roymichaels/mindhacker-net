#!/usr/bin/env bash

# Exit on any error
set -e

echo "Installing dependencies (including workspaces)..."
npm install

# Install dependencies for the evolve app workspace
echo "Installing @evolve/app dependencies..."
npm install --workspace @evolve/app

echo "Running Vite build for evolve app..."
npx vite build --config apps/evolve/vite.config.ts

echo "Build completed."