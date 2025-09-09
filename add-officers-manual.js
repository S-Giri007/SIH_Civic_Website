// Manual script to add officers to MongoDB
// Run this with: node add-officers-manual.js

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://giri:Sgiri%40123@giridb.ruxfhu5.mongodb.net/SIH';
const dbName = 'civic-portal'; // or your database name

async function addOfficers() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    
    // Hash passwords
    const hashPassword = async (password) => {
      return await bcrypt.hash(password, 10);
    };
    
    const officers = [
      {
        username: 'admin',
        password: await hashPassword('admin123'),
        role: 'officer',
        name: 'Admin Officer',
        email: 'admin@municipality.gov',
        phone: '555-0100',
        officerId: 'ADM001',
        department: 'Administration',
        designation: 'Chief Administrator',
        isVerified: true,
        isActive: true,
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'officer1',
        password: await hashPassword('password123'),
        role: 'officer',
        name: 'John Officer',
        email: 'john.officer@municipality.gov',
        phone: '555-0101',
        officerId: 'OFF001',
        department: 'Public Works',
        designation: 'Field Officer',
        isVerified: true,
        isActive: true,
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'officer2',
        password: await hashPassword('password123'),
        role: 'officer',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@municipality.gov',
        phone: '555-0102',
        officerId: 'OFF002',
        department: 'Utilities',
        designation: 'Senior Officer',
        isVerified: true,
        isActive: true,
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'supervisor',
        password: await hashPassword('super123'),
        role: 'officer',
        name: 'David Supervisor',
        email: 'david.supervisor@municipality.gov',
        phone: '555-0103',
        officerId: 'SUP001',
        department: 'Operations',
        designation: 'Supervisor',
        isVerified: true,
        isActive: true,
        verifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insert officers
    const result = await usersCollection.insertMany(officers);
    console.log(`${result.insertedCount} officers added successfully`);
    
    // Display added officers
    console.log('\nAdded Officers:');
    officers.forEach(officer => {
      console.log(`- ${officer.username} (${officer.name}) - ${officer.designation}`);
    });
    
  } catch (error) {
    console.error('Error adding officers:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

addOfficers();