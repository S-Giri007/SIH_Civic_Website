const mongoose = require('mongoose');

const checkDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-portal';
    console.log('Attempting to connect to MongoDB...');
    console.log('URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    
    console.log('✅ MongoDB connection successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('  - MongoDB server is not running');
      console.error('  - Start MongoDB locally or check your MongoDB Atlas connection');
    } else if (error.message.includes('authentication failed')) {
      console.error('  - Invalid MongoDB credentials');
      console.error('  - Check your MONGODB_URI in .env file');
    } else if (error.message.includes('serverSelectionTimeoutMS')) {
      console.error('  - Cannot reach MongoDB server');
      console.error('  - Check if MongoDB is running and accessible');
    } else {
      console.error('  - Error:', error.message);
    }
    
    console.error('\n💡 Quick fixes:');
    console.error('  1. Make sure MongoDB is installed and running locally');
    console.error('  2. Or use MongoDB Atlas (cloud) and update MONGODB_URI in .env');
    console.error('  3. Check your .env file exists and has correct MONGODB_URI');
    
    return false;
  }
};

module.exports = { checkDatabase };