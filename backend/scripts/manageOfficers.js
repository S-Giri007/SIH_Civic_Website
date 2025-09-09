const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const showHelp = () => {
  console.log('\n📋 Officer Management Commands:');
  console.log('  list                    - List all officers');
  console.log('  unverified             - List unverified officers');
  console.log('  verify <username>      - Verify an officer');
  console.log('  add                    - Add a new officer (interactive)');
  console.log('  details <username>     - Show officer details');
  console.log('  help                   - Show this help');
  console.log('\nUsage: node scripts/manageOfficers.js <command> [args]');
};

const listOfficers = async () => {
  const officers = await User.find({ role: 'officer' })
    .select('username name email officerId department designation isVerified isActive')
    .sort({ createdAt: -1 });

  console.log('\n📋 All Officers:');
  console.log('─'.repeat(100));
  console.log('Username'.padEnd(15) + 'Name'.padEnd(20) + 'Officer ID'.padEnd(12) + 'Department'.padEnd(15) + 'Verified'.padEnd(10) + 'Active');
  console.log('─'.repeat(100));
  
  officers.forEach(officer => {
    console.log(
      officer.username.padEnd(15) +
      officer.name.padEnd(20) +
      (officer.officerId || 'N/A').padEnd(12) +
      (officer.department || 'N/A').padEnd(15) +
      (officer.isVerified ? '✅ Yes' : '❌ No').padEnd(10) +
      (officer.isActive ? '✅ Yes' : '❌ No')
    );
  });
  
  console.log(`\nTotal Officers: ${officers.length}`);
};

const listUnverified = async () => {
  const officers = await User.find({ 
    role: 'officer', 
    isVerified: false,
    isActive: true 
  }).select('username name email officerId department designation');

  console.log('\n⚠️  Unverified Officers:');
  if (officers.length === 0) {
    console.log('No unverified officers found.');
    return;
  }

  officers.forEach((officer, index) => {
    console.log(`\n${index + 1}. ${officer.name} (${officer.username})`);
    console.log(`   Email: ${officer.email}`);
    console.log(`   Officer ID: ${officer.officerId || 'Not set'}`);
    console.log(`   Department: ${officer.department || 'Not set'}`);
  });
};

const verifyOfficer = async (username) => {
  const officer = await User.findOne({ 
    username, 
    role: 'officer' 
  });

  if (!officer) {
    console.log(`❌ Officer '${username}' not found`);
    return;
  }

  if (officer.isVerified) {
    console.log(`✅ Officer '${username}' is already verified`);
    return;
  }

  const admin = await User.findOne({ 
    role: 'officer', 
    isVerified: true 
  });

  if (!admin) {
    console.log('❌ No verified officer found to perform verification');
    return;
  }

  await officer.verifyOfficer(admin._id);
  console.log(`✅ Officer '${username}' verified successfully!`);
};

const showOfficerDetails = async (username) => {
  const officer = await User.findOne({ 
    username, 
    role: 'officer' 
  }).populate('verifiedBy', 'name username');

  if (!officer) {
    console.log(`❌ Officer '${username}' not found`);
    return;
  }

  console.log('\n👤 Officer Details:');
  console.log('─'.repeat(50));
  console.log(`Name: ${officer.name}`);
  console.log(`Username: ${officer.username}`);
  console.log(`Email: ${officer.email}`);
  console.log(`Phone: ${officer.phone || 'Not provided'}`);
  console.log(`Officer ID: ${officer.officerId || 'Not set'}`);
  console.log(`Department: ${officer.department || 'Not set'}`);
  console.log(`Designation: ${officer.designation || 'Not set'}`);
  console.log(`Verified: ${officer.isVerified ? '✅ Yes' : '❌ No'}`);
  
  if (officer.isVerified && officer.verifiedBy) {
    console.log(`Verified by: ${officer.verifiedBy.name} (${officer.verifiedBy.username})`);
    console.log(`Verified at: ${officer.verifiedAt}`);
  }
  
  console.log(`Active: ${officer.isActive ? '✅ Yes' : '❌ No'}`);
  console.log(`Created: ${officer.createdAt}`);
  console.log(`Last Login: ${officer.lastLogin || 'Never'}`);
};

const main = async () => {
  try {
    await mongoose.connect('mongodb+srv://giri:Sgiri%40123@giridb.ruxfhu5.mongodb.net/SIH');
    
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'list':
        await listOfficers();
        break;
      case 'unverified':
        await listUnverified();
        break;
      case 'verify':
        if (!args[1]) {
          console.log('❌ Please provide username to verify');
          console.log('Usage: node scripts/manageOfficers.js verify <username>');
        } else {
          await verifyOfficer(args[1]);
        }
        break;
      case 'details':
        if (!args[1]) {
          console.log('❌ Please provide username');
          console.log('Usage: node scripts/manageOfficers.js details <username>');
        } else {
          await showOfficerDetails(args[1]);
        }
        break;
      case 'help':
      default:
        showHelp();
        break;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

main();