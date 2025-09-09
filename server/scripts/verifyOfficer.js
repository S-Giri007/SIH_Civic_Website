const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const verifyOfficer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI );
    console.log('Connected to MongoDB');

    // Get command line arguments
    const args = process.argv.slice(2);
    const officerUsername = args[0];

    if (!officerUsername) {
      console.log('❌ Please provide officer username');
      console.log('Usage: node server/scripts/verifyOfficer.js <username>');
      return;
    }

    // Find the officer
    const officer = await User.findOne({ 
      username: officerUsername, 
      role: 'officer' 
    });

    if (!officer) {
      console.log(`❌ Officer with username '${officerUsername}' not found`);
      return;
    }

    if (officer.isVerified) {
      console.log(`✅ Officer '${officerUsername}' is already verified`);
      return;
    }

    // Find an admin to verify (use the first verified officer as verifier)
    const admin = await User.findOne({ 
      role: 'officer', 
      isVerified: true 
    });

    if (!admin) {
      console.log('❌ No verified officer found to perform verification');
      return;
    }

    // Verify the officer
    await officer.verifyOfficer(admin._id);

    console.log('✅ Officer verified successfully!');
    console.log(`📋 Officer: ${officer.name} (${officer.username})`);
    console.log(`📋 Verified by: ${admin.name} (${admin.username})`);
    console.log(`📋 Verified at: ${officer.verifiedAt}`);

  } catch (error) {
    console.error('❌ Error verifying officer:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the function
verifyOfficer();