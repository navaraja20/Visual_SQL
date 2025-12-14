#!/bin/bash

# VisualSQL Setup Script (Unix/Linux/Mac)
# This script helps you set up the VisualSQL project quickly

echo "================================"
echo "   VisualSQL Setup Script"
echo "================================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✓ Node.js $NODE_VERSION detected"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the VisualSQL root directory."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
echo "This may take a few minutes..."
echo ""

npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo ""
echo "✓ Dependencies installed successfully!"
echo ""

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cp "backend/.env.example" "backend/.env"
    echo "✓ Created backend/.env from .env.example"
fi

echo ""
echo "================================"
echo "   Setup Complete! 🎉"
echo "================================"
echo ""
echo "To start the application:"
echo ""
echo "  npm run dev"
echo ""
echo "This will start:"
echo "  • Backend API at http://localhost:3001"
echo "  • Frontend at http://localhost:3000"
echo ""
echo "Then open your browser to:"
echo "  http://localhost:3000"
echo ""
echo "For more information, see:"
echo "  • README.md - Full documentation"
echo "  • QUICKSTART.md - Quick start guide"
echo "  • CONTRIBUTING.md - Development guide"
echo ""
echo "Happy learning! 🎓"
