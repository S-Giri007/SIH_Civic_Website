@echo off
echo 🔍 Diagnosing Civic Portal Issues...
echo =====================================
echo.

echo 📋 System Information:
echo Node.js version:
node --version
echo npm version:
npm --version
echo.

echo 📁 Project Structure:
echo Checking if key files exist...
if exist "frontend\package.json" (echo ✅ frontend\package.json) else (echo ❌ frontend\package.json MISSING)
if exist "backend\package.json" (echo ✅ backend\package.json) else (echo ❌ backend\package.json MISSING)
if exist "frontend\src\App.tsx" (echo ✅ frontend\src\App.tsx) else (echo ❌ frontend\src\App.tsx MISSING)
if exist "backend\server.js" (echo ✅ backend\server.js) else (echo ❌ backend\server.js MISSING)
if exist "backend\.env" (echo ✅ backend\.env) else (echo ❌ backend\.env MISSING)
echo.

echo 📦 Dependencies Status:
echo Checking frontend dependencies...
if exist "frontend\node_modules" (echo ✅ Frontend dependencies installed) else (echo ❌ Frontend dependencies NOT installed - Run: cd frontend && npm install)

echo Checking backend dependencies...
if exist "backend\node_modules" (echo ✅ Backend dependencies installed) else (echo ❌ Backend dependencies NOT installed - Run: cd backend && npm install)
echo.

echo 🔌 Port Status:
echo Checking if ports are in use...
netstat -an | findstr :3001 >nul
if errorlevel 1 (echo ✅ Port 3001 available) else (echo ⚠️  Port 3001 in use)

netstat -an | findstr :5173 >nul
if errorlevel 1 (echo ✅ Port 5173 available) else (echo ⚠️  Port 5173 in use)
echo.

echo 🧪 Quick Tests:
echo Testing Node.js setup...
node -e "console.log('✅ Node.js is working')"

echo Testing npm...
npm --version >nul 2>&1
if errorlevel 1 (echo ❌ npm not working) else (echo ✅ npm is working)
echo.

echo 📝 Common Solutions:
echo ==================
echo.
echo If website won't open, try these steps:
echo.
echo 1. Install dependencies:
echo    cd frontend
echo    npm install
echo    cd ../backend  
echo    npm install
echo.
echo 2. Start backend server:
echo    cd backend
echo    npm start
echo    (Should show: Backend server running on port 3001)
echo.
echo 3. Start frontend server (in new terminal):
echo    cd frontend
echo    npm run dev
echo    (Should show: Local: http://localhost:5173/)
echo.
echo 4. Open browser to: http://localhost:5173
echo.
echo 5. If still not working, check browser console (F12) for errors
echo.
echo 🆘 If you see specific error messages, please share them!
echo.
pause