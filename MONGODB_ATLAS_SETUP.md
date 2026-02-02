# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Click "Try Free" or "Sign Up"
3. Fill in your details:
   - Email address
   - Password
   - First and Last name
4. Click "Create your Atlas account"
5. Verify your email if prompted

## Step 2: Create a Free Cluster

1. After logging in, you'll see "Deploy a cloud database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select a Cloud Provider:
   - **AWS** (recommended)
   - **Google Cloud**
   - **Azure**
4. Choose a Region closest to you (e.g., `N. Virginia (us-east-1)` for US)
5. Click **"Create"** (this may take 3-5 minutes)

## Step 3: Create Database User

1. While cluster is creating, you'll see "Create Database User"
2. Choose "Username and Password" authentication
3. Enter:
   - **Username**: `chardhamuser` (or any username you prefer)
   - **Password**: Create a strong password (save this!)
4. Click **"Create Database User"**

## Step 4: Configure Network Access

1. You'll see "Where would you like to connect from?"
2. Click **"Add My Current IP Address"** (for development)
3. For production, you can add `0.0.0.0/0` to allow from anywhere (less secure)
4. Click **"Finish and Close"**

## Step 5: Get Your Connection String

1. Once cluster is ready, click **"Connect"** button
2. Choose **"Connect your application"**
3. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
4. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Important**: Replace `<username>` with your database username and `<password>` with your database password
6. Add your database name at the end (before `?`):
   ```
   mongodb+srv://chardhamuser:yourpassword@cluster0.xxxxx.mongodb.net/char-dham-yatra?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File

1. Open the `char-dham-yatra` folder
2. Create a `.env` file (if it doesn't exist)
3. Add your connection string:

```
PORT=5000
MONGODB_URI=mongodb+srv://chardhamuser:yourpassword@cluster0.xxxxx.mongodb.net/char-dham-yatra?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-this-in-production
```

**Replace:**
- `chardhamuser` with your actual username
- `yourpassword` with your actual password
- `cluster0.xxxxx` with your actual cluster address

## Step 7: Test the Connection

1. Start your server:
   ```bash
   npm run server
   ```

2. You should see:
   ```
   Server is running on port 5000
   MongoDB Connected successfully
   ```

3. If you see "MongoDB Connected successfully", you're all set! ✅

## Troubleshooting

### "Authentication failed"
- Double-check your username and password in the connection string
- Make sure you replaced `<username>` and `<password>` in the connection string

### "IP not whitelisted"
- Go to Atlas → Network Access
- Click "Add IP Address"
- Add your current IP or `0.0.0.0/0` for development

### "Connection timeout"
- Check your internet connection
- Verify the connection string is correct
- Make sure the cluster is running (not paused)

### Connection string format
Make sure your connection string looks like this:
```
mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

## Security Notes

- Never commit your `.env` file to git (it's already in `.gitignore`)
- Don't share your connection string publicly
- For production, use environment variables on your hosting platform
- Consider using IP whitelisting for better security

## Next Steps

Once connected:
1. Start the frontend: `npm start`
2. Go to http://localhost:3000/register
3. Try registering - it should work now! 🎉

