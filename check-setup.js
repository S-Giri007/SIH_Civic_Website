const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Civic Complaint Portal Setup...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  
  // Read and check env variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName} configured`);
    } else {
      console.log(`❌ ${varName} missing in .env`);
    }
  });
} else {
  console.log('❌ .env file not found');
  console.log('   Create .env file with required variables');
}

// Check if node_modules exists
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('✅ Dependencies installed');
} else {
  console.log('❌ Dependencies not installed');
  console.log('   Run: npm install');
}

// Check if server directory exists
if (fs.existsSync(path.join(__dirname, 'server'))) {
  console.log('✅ Server files present');
} else {
  console.log('❌ Server files missing');
}

console.log('\n📋 Next Steps:');
console.log('1. Make sure MongoDB is running (local or Atlas)');
console.log('2. Run: npm run seed (optional - adds sample data)');
console.log('3. Run: npm run dev (starts both frontend and backend)');
console.log('4. Visit: http://localhost:5173');

console.log('\n🔐 Demo Credentials (after seeding):');
console.log('Officer: officer1 / password123');
console.log('Officer: officer2 / password123');