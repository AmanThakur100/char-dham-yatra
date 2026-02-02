# How to Run Char Dham Yatra Project on Windows PowerShell

## Step-by-Step Commands

### 1. Navigate to Project Directory
```powershell
cd "C:\Users\rawat\OneDrive\Desktop\Phase 1 cdya\char-dham-yatra"
```

### 2. Install Dependencies (First Time Only)
```powershell
npm install
```

### 3. Set Up Environment Variables (Optional)
If you want to customize the configuration, create a `.env` file in the project root:
```powershell
# Create .env file (if it doesn't exist)
New-Item -Path .env -ItemType File -Force
```

Add these lines to `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/char-dham-yatra
JWT_SECRET=char-dham-yatra-secret-key-2024
```

**Note:** The project will work with default values if `.env` is not created.

### 4. Start MongoDB (If Using Local MongoDB)
If you have MongoDB installed locally, start it:
```powershell
# Option 1: If MongoDB is installed as a Windows service (usually auto-starts)
# Just verify it's running

# Option 2: If you need to start MongoDB manually
mongod
```

**OR** if you're using MongoDB Atlas (cloud), skip this step and update `MONGODB_URI` in `.env` with your Atlas connection string.

### 5. Start Backend Server
Open a **new PowerShell window** and run:
```powershell
cd "C:\Users\rawat\OneDrive\Desktop\Phase 1 cdya\char-dham-yatra"
npm run server
```

The backend will start on `http://localhost:5000`

### 6. Start Frontend (React App)
Open **another new PowerShell window** and run:
```powershell
cd "C:\Users\rawat\OneDrive\Desktop\Phase 1 cdya\char-dham-yatra"
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

---

## Quick Start (All Commands in Sequence)

### Terminal 1 - Backend Server:
```powershell
cd "C:\Users\rawat\OneDrive\Desktop\Phase 1 cdya\char-dham-yatra"
npm run server
```

### Terminal 2 - Frontend:
```powershell
cd "C:\Users\rawat\OneDrive\Desktop\Phase 1 cdya\char-dham-yatra"
npm start
```

---

## Complete Setup (First Time Only)

```powershell
# Navigate to project
cd "C:\Users\rawat\OneDrive\Desktop\Phase 1 cdya\char-dham-yatra"

# Install all dependencies
npm install

# (Optional) Create .env file with custom settings
# New-Item -Path .env -ItemType File -Force
# Then edit .env and add: PORT=5000, MONGODB_URI=..., JWT_SECRET=...

# Start MongoDB (if using local MongoDB)
# mongod

# Then open two separate terminals:
# Terminal 1: npm run server
# Terminal 2: npm start
```

---

## Verify Everything is Running

1. **Backend Server**: Check `http://localhost:5000/api/health` in browser - should return JSON with server status
2. **Frontend**: Should automatically open at `http://localhost:3000`
3. **MongoDB**: Backend logs will show "MongoDB Connected successfully" if connected

---

## Troubleshooting

### If MongoDB connection fails:
- Make sure MongoDB is running (local) or your Atlas connection string is correct
- Check the `.env` file has the correct `MONGODB_URI`

### If port 5000 is already in use:
- Change `PORT=5001` (or another port) in `.env`
- Update the proxy in `package.json` to match

### If port 3000 is already in use:
- React will ask if you want to use a different port (press Y)

### To stop the servers:
- Press `Ctrl + C` in each terminal window

---

## Project URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Users Page**: http://localhost:3000/users (requires login)

---

## Quick Launch Script (Recommended)

For easy startup, use the provided PowerShell script:

```powershell
# Navigate to project directory
cd "C:\Users\rawat\OneDrive\Desktop\Phase 1 cdya\char-dham-yatra"

# Run the launcher script
.\start-project.ps1
```

**Or run directly:**
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\rawat\OneDrive\Desktop\Phase 1 cdya\char-dham-yatra\start-project.ps1"
```

This script will:
- ✓ Check if dependencies are installed
- ✓ Start MongoDB (if available)
- ✓ Launch Backend Server in a new window
- ✓ Launch Frontend App in a new window
- ✓ Display all service URLs

**Manual Launch (Alternative):**

If you prefer to start services manually, you can use this PowerShell script:

```powershell
# --- SET PROJECT PATH ---
$proj = "C:\Users\rawat\OneDrive\Desktop\Phase 1 cdya\char-dham-yatra"

# --- START MONGODB (new PowerShell window) ---
if (Get-Command mongod -ErrorAction SilentlyContinue) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$proj'; mongod"
} else {
    Write-Host "Skipping MongoDB because 'mongod' is not installed." -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

# --- START BACKEND SERVER (new PowerShell window) ---
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$proj'; npm run server"

Start-Sleep -Seconds 2

# --- START FRONTEND REACT APP (new PowerShell window) ---
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$proj'; npm start"

Write-Host ""
Write-Host "All services launched!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:5000"
Write-Host "Frontend: http://localhost:3000"
```

