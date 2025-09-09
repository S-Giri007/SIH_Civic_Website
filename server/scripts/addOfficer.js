const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const addOfficer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-portal');
    console.log('Connected to MongoDB');

    // Officer data - you can modify this
    const officerData = {
      username: 'newofficer',
      password: 'officer123',
      role: 'officer',
      name: 'New Officer Name',
      email: 'newofficer@municipality.gov',
      phone: '555-0999',
      officerId: 'NEW001',
      department: 'General',
      designation: 'Officer',
      isVerified: true, // Set to false if manual verification is needed
      verifiedAt: new Date()
    };

    // Check if officer already exists
    const existingOfficer = await User.findOne({
      $or: [
        { username: officerData.username },
        { email: officerData.email },
        { officerId: officerData.officerId }
      ]
    });

    if (existingOfficer) {
      console.log('❌ Officer already exists with this username, email, or officer ID');
      return;
    }

    // Create new officer
    const officer = new User(officerData);
    await officer.save();

    console.log('✅ Officer created successfully!');
    console.log('📋 Officer Details:');
    console.log(`   Username: ${officer.username}`);
    console.log(`   Password: ${officerData.password}`);
    console.log(`   Name: ${officer.name}`);
    console.log(`   Email: ${officer.email}`);
    console.log(`   Officer ID: ${officer.officerId}`);
    console.log(`   Department: ${officer.department}`);
    console.log(`   Designation: ${officer.designation}`);
    console.log(`   Verified: ${officer.isVerified ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Error creating officer:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the function
addOfficer();