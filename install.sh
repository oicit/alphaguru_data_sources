#!/bin/bash

echo "🚀 Installing AlphaGuru Data Sources Dashboard..."
echo ""

# Install root dependencies (concurrently)
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start the application, run:"
echo "  npm run dev"
echo ""
echo "Or manually in two terminals:"
echo "  Terminal 1: cd backend && npm start"
echo "  Terminal 2: cd frontend && npm start"
