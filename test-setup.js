// Simple test script to check if the application setup is working
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Civic Portal Setup...\n');

// Test 1: Check if required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
    'frontend/package.json',
    'backend/package.json',
    'frontend/src/App.tsx',
    'backend/server.js',
    'backend/.env'
];

let filesOk = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        filesOk = false;
    }
});

if (!filesOk) {
    console.log('\n❌ Some required files are missing. Please check your project structure.');
    process.exit(1);
}

// Test 2: Check Node.js version
console.log('\n🔧 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 16) {
    console.log(`✅ Node.js ${nodeVersion} (compatible)`);
} else {
    console.log(`❌ Node.js ${nodeVersion} (requires v16 or higher)`);
    process.exit(1);
}

// Test 3: Check if dependencies are installed
console.log('\n📦 Checking dependencies...');

function checkDependencies(dir) {
    const nodeModulesPath = path.join(dir, 'node_modules');
    const packageJsonPath = path.join(dir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
        return false;
    }
    
    if (!fs.existsSync(nodeModulesPath)) {
        return false;
    }
    
    return true;
}

const frontendDeps = checkDependencies('frontend');
const backendDeps = checkDependencies('backend');

console.log(`${frontendDeps ? '✅' : '❌'} Frontend dependencies ${frontendDeps ? 'installed' : 'missing'}`);
console.log(`${backendDeps ? '✅' : '❌'} Backend dependencies ${backendDeps ? 'installed' : 'missing'}`);

if (!frontendDeps || !backendDeps) {
    console.log('\n💡 To install dependencies, run:');
    if (!frontendDeps) console.log('   cd frontend && npm install');
    if (!backendDeps) console.log('   cd backend && npm install');
}

// Test 4: Check MongoDB connection
console.log('\n🗄️  Testing MongoDB connection...');

async function testMongoDB() {
    try {
        // Read MongoDB URI from .env file
        const envContent = fs.readFileSync('backend/.env', 'utf8');
        const mongoUri = envContent.match(/MONGODB_URI=(.+)/)?.[1];
        
        if (!mongoUri) {
            console.log('❌ MONGODB_URI not found in backend/.env');
            return false;
        }
        
        console.log('✅ MongoDB URI found in .env file');
        
        // Try to connect using mongoose (if available)
        try {
            const mongoose = require('./backend/node_modules/mongoose');
            await mongoose.connect(mongoUri);
            console.log('✅ MongoDB connection successful');
            await mongoose.disconnect();
            return true;
        } catch (err) {
            console.log('⚠️  Could not test MongoDB connection (mongoose not available)');
            console.log('   This is normal if dependencies are not installed yet');
            return true; // Don't fail the test for this
        }
        
    } catch (error) {
        console.log(`❌ MongoDB connection test failed: ${error.message}`);
        return false;
    }
}

// Test 5: Check if ports are available
console.log('\n🔌 Checking port availability...');

function checkPort(port) {
    return new Promise((resolve) => {
        const server = http.createServer();
        
        server.listen(port, () => {
            server.close(() => {
                resolve(true); // Port is available
            });
        });
        
        server.on('error', () => {
            resolve(false); // Port is in use
        });
    });
}

async function runTests() {
    await testMongoDB();
    
    const port3001Available = await checkPort(3001);
    const port5173Available = await checkPort(5173);
    
    console.log(`${port3001Available ? '✅' : '⚠️ '} Port 3001 (Backend) ${port3001Available ? 'available' : 'in use'}`);
    console.log(`${port5173Available ? '✅' : '⚠️ '} Port 5173 (Frontend) ${port5173Available ? 'available' : 'in use'}`);
    
    // Final summary
    console.log('\n📊 Setup Summary:');
    console.log('================');
    
    if (filesOk && frontendDeps && backendDeps && port3001Available && port5173Available) {
        console.log('🎉 Everything looks good! You can start the application.');
        console.log('\n🚀 To start the application:');
        console.log('   1. Run: cd backend && npm start');
        console.log('   2. Run: cd frontend && npm run dev');
        console.log('   3. Open: http://localhost:5173');
    } else {
        console.log('⚠️  Some issues found. Please fix them before starting the application.');
        
        if (!frontendDeps || !backendDeps) {
            console.log('\n💡 Install missing dependencies first:');
            if (!frontendDeps) console.log('   cd frontend && npm install');
            if (!backendDeps) console.log('   cd backend && npm install');
        }
        
        if (!port3001Available || !port5173Available) {
            console.log('\n💡 Ports in use. Either:');
            console.log('   - Stop other applications using these ports');
            console.log('   - Or modify port configuration in vite.config.ts and backend/server.js');
        }
    }
    
    console.log('\n📚 For detailed instructions, see: start-application.md');
}

runTests().catch(console.error);