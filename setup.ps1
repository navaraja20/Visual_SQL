# VisualSQL Setup Script
# This script helps you set up the VisualSQL project quickly

Write-Host "================================" -ForegroundColor Cyan
Write-Host "   VisualSQL Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18 or higher." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Please run this script from the VisualSQL root directory." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✓ Created backend/.env from .env.example" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "   Setup Complete! 🎉" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will start:" -ForegroundColor Gray
Write-Host "  • Backend API at http://localhost:3001" -ForegroundColor Gray
Write-Host "  • Frontend at http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "Then open your browser to:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more information, see:" -ForegroundColor Gray
Write-Host "  • README.md - Full documentation" -ForegroundColor Gray
Write-Host "  • QUICKSTART.md - Quick start guide" -ForegroundColor Gray
Write-Host "  • CONTRIBUTING.md - Development guide" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy learning! 🎓" -ForegroundColor Green
