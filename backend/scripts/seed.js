const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Issue = require('../models/Issue');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://giri:Sgiri%40123@giridb.ruxfhu5.mongodb.net/SIH");
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Issue.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const users = [
      // Officers
      {
        username: 'admin',
        password: 'admin123',
        role: 'officer',
        name: 'Admin Officer',
        email: 'admin@municipality.gov',
        phone: '555-0100',
        officerId: 'ADM001',
        department: 'Administration',
        designation: 'Chief Administrator',
        isVerified: true,
        verifiedAt: new Date()
      },
      {
        username: 'officer1',
        password: 'password123',
        role: 'officer',
        name: 'John Officer',
        email: 'john.officer@municipality.gov',
        phone: '555-0101',
        officerId: 'OFF001',
        department: 'Public Works',
        designation: 'Field Officer',
        isVerified: true,
        verifiedAt: new Date()
      },
      {
        username: 'officer2',
        password: 'password123',
        role: 'officer',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@municipality.gov',
        phone: '555-0102',
        officerId: 'OFF002',
        department: 'Utilities',
        designation: 'Senior Officer',
        isVerified: true,
        verifiedAt: new Date()
      },
      {
        username: 'supervisor',
        password: 'super123',
        role: 'officer',
        name: 'David Supervisor',
        email: 'david.supervisor@municipality.gov',
        phone: '555-0103',
        officerId: 'SUP001',
        department: 'Operations',
        designation: 'Supervisor',
        isVerified: true,
        verifiedAt: new Date()
      },
      {
        username: 'inspector',
        password: 'inspect123',
        role: 'officer',
        name: 'Maria Inspector',
        email: 'maria.inspector@municipality.gov',
        phone: '555-0104',
        officerId: 'INS001',
        department: 'Quality Control',
        designation: 'Inspector',
        isVerified: false // This officer needs verification
      },
      // Citizens
      {
        username: 'citizen1',
        password: 'password123',
        role: 'citizen',
        name: 'Mike Smith',
        email: 'mike.smith@email.com',
        phone: '555-0201'
      },
      {
        username: 'citizen2',
        password: 'password123',
        role: 'citizen',
        name: 'Lisa Johnson',
        email: 'lisa.johnson@email.com',
        phone: '555-0202'
      }
    ];

    const createdUsers = await User.create(users);
    console.log('Created sample users');

    // Get officer and citizen IDs
    const officer1 = createdUsers.find(u => u.username === 'officer1');
    const officer2 = createdUsers.find(u => u.username === 'officer2');
    const citizen1 = createdUsers.find(u => u.username === 'citizen1');
    const citizen2 = createdUsers.find(u => u.username === 'citizen2');

    // Create sample issues
    const issues = [
      {
        title: 'Large Pothole on Main Street',
        description: 'There is a large pothole on Main Street near the intersection with Oak Avenue. It\'s causing damage to vehicles and creating a safety hazard for drivers.',
        category: 'road',
        priority: 'high',
        status: 'pending',
        location: 'Main Street & Oak Avenue, Downtown',
        images: ['https://images.pexels.com/photos/268018/pexels-photo-268018.jpeg?auto=compress&cs=tinysrgb&w=800'],
        citizenId: citizen1._id,
        citizenName: citizen1.name,
        citizenContact: citizen1.email
      },
      {
        title: 'Broken Street Light',
        description: 'The street light on Elm Street has been flickering for weeks and is now completely out. This area is very dark at night and poses a safety risk.',
        category: 'electricity',
        priority: 'medium',
        status: 'in-progress',
        location: 'Elm Street near Central Park',
        images: ['https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800'],
        citizenId: citizen2._id,
        citizenName: citizen2.name,
        citizenContact: citizen2.email,
        assignedOfficer: officer1._id,
        notes: 'Contacted electrical department, repair scheduled for next week.'
      },
      {
        title: 'Garbage Collection Missed',
        description: 'Our neighborhood garbage bins have not been emptied for over a week. The bins are overflowing and attracting pests.',
        category: 'garbage',
        priority: 'medium',
        status: 'resolved',
        location: 'Maple Street Residential Area',
        images: [],
        citizenId: citizen1._id,
        citizenName: citizen1.name,
        citizenContact: citizen1.email,
        assignedOfficer: officer2._id,
        notes: 'Contacted waste management. Extra collection scheduled and completed.'
      },
      {
        title: 'Water Leak in Park',
        description: 'There is a significant water leak in Central Park near the playground. Water is pooling and creating muddy conditions.',
        category: 'water',
        priority: 'high',
        status: 'pending',
        location: 'Central Park Playground Area',
        images: ['https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=800'],
        citizenName: 'Anonymous Citizen',
        citizenContact: 'anonymous@report.com'
      },
      {
        title: 'Damaged Park Bench',
        description: 'Several park benches in Riverside Park are damaged and need repair or replacement. Some have broken slats and others are unstable.',
        category: 'park',
        priority: 'low',
        status: 'pending',
        location: 'Riverside Park',
        images: [],
        citizenId: citizen2._id,
        citizenName: citizen2.name,
        citizenContact: citizen2.email
      },
      {
        title: 'Noise Complaint - Construction',
        description: 'Construction work is starting very early (5 AM) and continuing late into the evening, violating noise ordinances.',
        category: 'other',
        priority: 'medium',
        status: 'in-progress',
        location: '123 Industrial Avenue',
        images: [],
        citizenName: 'Concerned Resident',
        citizenContact: '555-0999',
        assignedOfficer: officer1._id,
        notes: 'Contacted construction company about noise ordinance compliance.'
      }
    ];

    await Issue.create(issues);
    console.log('Created sample issues');

    console.log('\n=== SEED DATA SUMMARY ===');
    console.log('Users created:');
    console.log('📋 OFFICERS:');
    console.log('  - admin/admin123 (Admin Officer)');
    console.log('  - officer1/password123 (John Officer)');
    console.log('  - officer2/password123 (Sarah Wilson)');
    console.log('  - supervisor/super123 (David Supervisor)');
    console.log('  - inspector/inspect123 (Maria Inspector)');
    console.log('\n👥 CITIZENS:');
    console.log('  - citizen1/password123 (Mike Smith)');
    console.log('  - citizen2/password123 (Lisa Johnson)');
    console.log('\n📊 Issues created: 6 sample issues with various statuses');
    console.log('\n✅ Database seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedData();