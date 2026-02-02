# Quick Setup Guide

## Step 1: Install MongoDB

### Option A: MongoDB Local Installation
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install MongoDB Community Edition
3. Start MongoDB service:
   - Windows: MongoDB should start automatically as a service
   - Mac/Linux: Run `mongod` in terminal

### Option B: MongoDB Atlas (Cloud - Recommended for Beginners) ⭐
**See detailed step-by-step guide: [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)**

Quick steps:
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0 Sandbox)
4. Create database user and configure network access
5. Get your connection string
6. Create `.env` file with your connection string (see MONGODB_ATLAS_SETUP.md for details)

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Configure Environment

The `.env` file is already created with default values. If using MongoDB Atlas, update the `MONGODB_URI`.

## Step 4: Run the Application

### Terminal 1 - Start Backend Server:
```bash
npm run server
```

You should see: "Server is running on port 5000" and "MongoDB Connected"

### Terminal 2 - Start Frontend:
```bash
npm start
```

The browser should automatically open to `http://localhost:3000`

## Step 5: Test the Application

1. Click "Register" to create a new account
2. Fill in your details and register
3. You'll be automatically logged in and redirected to dashboard
4. Go to "Packages" to view available tours
5. Click "Book Now" on any package to make a booking

## Troubleshooting

### "MongoDB Connection Error"
- Make sure MongoDB is running
- Check if MongoDB service is started (Windows: Services, Mac/Linux: `mongod`)
- Verify connection string in `.env`

### "Port 5000 already in use"
- Change PORT in `.env` to another port (e.g., 5001)
- Update the proxy in `package.json` if needed

### "Cannot find module"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

## Default Test Account

You can register with any email and password. The system will create a new account for you.

## Next Steps

- Explore the packages
- Make a booking
- View your bookings in the dashboard
- Logout and login again to test authentication

