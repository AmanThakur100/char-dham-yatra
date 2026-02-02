# ============================================
# Char Dham Yatra - Project Launcher Script
# ============================================

# Set project path
$proj = "C:\Users\rawat\OneDrive\Desktop\Phase 1 cdya\char-dham-yatra"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Char Dham Yatra - Starting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if project directory exists
if (-not (Test-Path $proj)) {
    Write-Host "ERROR: Project directory not found!" -ForegroundColor Red
    Write-Host "Path: $proj" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check if node_modules exists (dependencies installed)
if (-not (Test-Path "$proj\node_modules")) {
    Write-Host "WARNING: node_modules not found!" -ForegroundColor Yellow
    Write-Host "Run 'npm install' first to install dependencies." -ForegroundColor Yellow
    Write-Host ""
    $install = Read-Host "Do you want to install dependencies now? (Y/N)"
    if ($install -eq "Y" -or $install -eq "y") {
        Write-Host "Installing dependencies..." -ForegroundColor Green
        Set-Location $proj
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: npm install failed!" -ForegroundColor Red
            exit 1
        }
        Write-Host "Dependencies installed successfully!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "Skipping dependency installation. Make sure to run 'npm install' before starting services." -ForegroundColor Yellow
        Write-Host ""
    }
}

# Check if MongoDB is already running
$mongoRunning = $false
try {
    $mongoProcess = Get-Process -Name mongod -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        $mongoRunning = $true
        Write-Host "✓ MongoDB is already running" -ForegroundColor Green
    }
} catch {
    # MongoDB not running
}

# Start MongoDB (if not running and mongod command is available)
if (-not $mongoRunning) {
    if (Get-Command mongod -ErrorAction SilentlyContinue) {
        Write-Host "Starting MongoDB in new window..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$proj'; Write-Host 'MongoDB Server' -ForegroundColor Cyan; Write-Host '================' -ForegroundColor Cyan; mongod"
        Start-Sleep -Seconds 3
        Write-Host "✓ MongoDB window opened" -ForegroundColor Green
    } else {
        Write-Host "⚠ MongoDB (mongod) not found in PATH" -ForegroundColor Yellow
        Write-Host "  If using MongoDB Atlas, this is OK." -ForegroundColor Yellow
        Write-Host "  If using local MongoDB, make sure it's installed and in PATH." -ForegroundColor Yellow
    }
} else {
    Write-Host "MongoDB is already running, skipping..." -ForegroundColor Green
}

Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$proj'; Write-Host 'Backend Server (Port 5000)' -ForegroundColor Cyan; Write-Host '===========================' -ForegroundColor Cyan; npm run server"
Start-Sleep -Seconds 2
Write-Host "✓ Backend server window opened" -ForegroundColor Green

# Start Frontend React App
Write-Host "Starting Frontend React App..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$proj'; Write-Host 'Frontend React App (Port 3000)' -ForegroundColor Cyan; Write-Host '===============================' -ForegroundColor Cyan; npm start"
Start-Sleep -Seconds 2
Write-Host "✓ Frontend app window opened" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All Services Launched Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor White
Write-Host "  • Backend API:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "  • Frontend App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  • Health Check: http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "  • Users Page:   http://localhost:3000/users (after login)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Each service runs in a separate PowerShell window." -ForegroundColor Yellow
Write-Host "      Close the windows or press Ctrl+C to stop each service." -ForegroundColor Yellow
Write-Host ""
Write-Host "Waiting for services to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 5
Write-Host ""
Write-Host "✓ Setup complete! Check the opened windows for service status." -ForegroundColor Green
Write-Host ""

