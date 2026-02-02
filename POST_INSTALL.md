# Post-MongoDB Installation Guide

## After Installing MongoDB on Windows

### Step 1: Verify MongoDB Installation

1. Open Command Prompt or PowerShell as Administrator
2. Check if MongoDB service is running:
   ```powershell
   Get-Service MongoDB
   ```
   Or check in Services:
   - Press `Win + R`, type `services.msc`, press Enter
   - Look for "MongoDB" service
   - It should be "Running"

### Step 2: Start MongoDB Service (if not running)

**Option A: Using Services**
1. Open Services (`Win + R` → `services.msc`)
2. Find "MongoDB" service
3. Right-click → Start (if it's stopped)

**Option B: Using Command Prompt (as Administrator)**
```cmd
net start MongoDB
```

**Option C: Using PowerShell (as Administrator)**
```powershell
Start-Service MongoDB
```

### Step 3: Create .env File

Create a `.env` file in the `char-dham-yatra` folder with the following content:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/char-dham-yatra
JWT_SECRET=your-secret-key-change-this-in-production
```

**Note:** The `.env` file is already in `.gitignore`, so it won't be committed to git.

### Step 4: Test MongoDB Connection

1. Open a new terminal in the `char-dham-yatra` folder
2. Start the server:
   ```bash
   npm run server
   ```
3. You should see:
   ```
   Server is running on port 5000
   MongoDB Connected successfully
   ```
   ✅ If you see this, MongoDB is working!

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### Troubleshooting

#### "MongoDB Connection Error" or "MongoDB Connection not established"

**Check 1: Is MongoDB service running?**
- Open Services (`services.msc`)
- Find "MongoDB" and ensure it's "Running"
- If not, start it

**Check 2: Test MongoDB connection manually**
```bash
mongosh
```
If this opens MongoDB shell, MongoDB is working. Type `exit` to leave.

**Check 3: Check MongoDB default port**
- MongoDB uses port 27017 by default
- Make sure nothing else is using this port

**Check 4: Verify connection string**
- Open `.env` file
- Ensure `MONGODB_URI=mongodb://localhost:27017/char-dham-yatra`

#### "Port 5000 already in use"
- Change `PORT=5001` in `.env` file
- Or stop the process using port 5000

#### MongoDB service won't start
1. Check MongoDB logs (usually in `C:\Program Files\MongoDB\Server\[version]\log\mongod.log`)
2. Make sure MongoDB data directory exists (usually `C:\data\db`)
3. Try reinstalling MongoDB or use MongoDB Atlas (cloud) instead

### Alternative: Use MongoDB Atlas (Cloud)

If you're having trouble with local MongoDB, you can use MongoDB Atlas (free):

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster
4. Get your connection string
5. Update `MONGODB_URI` in `.env` with your Atlas connection string
6. No local installation needed!

### Quick Test

Once everything is running:
1. Open http://localhost:3000/register
2. Fill in the registration form
3. Click Register
4. You should be redirected to the dashboard (no more "Server error"!)

If you still see errors, check the server terminal for specific error messages.

