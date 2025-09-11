# 🚀 How to Start the Civic Portal Application

## 📋 Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js (version 16 or higher)
- ✅ npm or yarn package manager
- ✅ MongoDB running (local or Atlas)

## 🔧 Step-by-Step Startup Guide

### 1. **Install Dependencies**

#### Frontend Dependencies:
```bash
cd frontend
npm install
```

#### Backend Dependencies:
```bash
cd backend
npm install
```

### 2. **Start MongoDB**

#### Option A - Local MongoDB:
```bash
# Make sure MongoDB service is running
mongod
```

#### Option B - MongoDB Atlas:
- Your connection string is already configured in `backend/.env`
- No additional setup needed

### 3. **Seed the Database (First Time Only)**
```bash
cd backend
npm run seed
```

### 4. **Start the Backend Server**
```bash
cd backend
npm start
# OR for development with auto-reload:
npm run dev
```

**Expected Output:**
```
🚀 Backend server running on port 3001
🌍 Environment: development
🔗 Frontend URL: http://localhost:5173
✅ MongoDB connection successful
```

### 5. **Start the Frontend Development Server**
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.4.2  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 6. **Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

## 🐛 Common Issues & Solutions

### Issue 1: "Port already in use"
```bash
# Kill processes on ports
npx kill-port 3001 5173
# OR change ports in configuration
```

### Issue 2: "MongoDB connection failed"
```bash
# Check if MongoDB is running
mongod --version
# OR check your connection string in backend/.env
```

### Issue 3: "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: "White screen" or "Page not loading"
```bash
# Clear browser cache and hard refresh
# Check browser console for errors (F12)
# Make sure both frontend and backend are running
```

## 🧪 Quick Test

1. **Backend Test**: Visit http://localhost:3001/health
   - Should return: `{"status":"OK","timestamp":"...","environment":"development"}`

2. **Frontend Test**: Visit http://localhost:5173
   - Should show the Civic Portal complaint form

3. **API Test**: Visit http://localhost:5173/api/users
   - Should return user data (if backend is connected)

## 📱 Demo Credentials

After running `npm run seed`, you can use:

**Officers:**
- `admin/admin123` - Admin Officer
- `officer1/password123` - Field Officer
- `officer2/password123` - Senior Officer
- `supervisor/super123` - Supervisor

**Citizens:**
- `citizen1/password123` - Mike Smith
- `citizen2/password123` - Lisa Johnson

## 🔄 Development Workflow

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Make Changes**: Edit files and see live reload
4. **Test Features**: Use demo credentials to test functionality

## 📊 Port Configuration

- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3001 (Express server)
- **MongoDB**: mongodb://localhost:27017 (if local) or Atlas URL

## 🚨 Troubleshooting Commands

```bash
# Check if ports are in use
netstat -an | findstr :3001
netstat -an | findstr :5173

# Check Node.js version
node --version
npm --version

# Check if MongoDB is accessible
mongosh "mongodb+srv://giri:Sgiri%40123@giridb.ruxfhu5.mongodb.net/SIH"

# Clear all caches
npm cache clean --force
```

## 🎯 Success Indicators

✅ **Backend Started Successfully:**
- Console shows "Backend server running on port 3001"
- MongoDB connection successful message
- No error messages in console

✅ **Frontend Started Successfully:**
- Browser opens to http://localhost:5173
- Civic Portal form is visible
- No console errors in browser (F12)

✅ **Full Application Working:**
- Can submit complaints from public form
- Can login as officer and see dashboard
- Can manage users and issues

If you're still having issues, please share the specific error messages you're seeing!