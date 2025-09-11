@echo off
echo 🚀 Starting Civic Portal Application...
echo.

echo 📋 Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

echo 📦 Installing dependencies...
echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo Installing frontend dependencies...
cd ../frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

echo 🌱 Seeding database (first time setup)...
cd ../backend
call npm run seed
echo.

echo 🚀 Starting servers...
echo Starting backend server...
start "Backend Server" cmd /k "cd /d %cd% && npm start"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting frontend server...
cd ../frontend
start "Frontend Server" cmd /k "cd /d %cd% && npm run dev"

echo.
echo ✅ Application is starting!
echo.
echo 📱 Access the application at:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3001
echo.
echo 🔑 Demo credentials:
echo    Officer: admin/admin123
echo    Citizen: citizen1/password123
echo.
echo Press any key to exit this window...
pause >nul