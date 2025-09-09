const mongoose = require('mongoose');

const checkDatabase = async () => {
    try {
        const uri = 'mongodb+srv://giri:Sgiri%40123@giridb.ruxfhu5.mongodb.net/SIH';
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
            console.error('  - Check your MongoDB Atlas credentials');
        } else if (error.message.includes('serverSelectionTimeoutMS')) {
            console.error('  - Cannot reach MongoDB server');
            console.error('  - Check if MongoDB is running and accessible');
        } else {
            console.error('  - Error:', error.message);
        }

        console.error('\n💡 Quick fixes:');
        console.error('  1. Check your internet connection');
        console.error('  2. Verify MongoDB Atlas cluster is running');
        console.error('  3. Check if your IP is whitelisted in MongoDB Atlas');

        return false;
    }
};

module.exports = { checkDatabase };