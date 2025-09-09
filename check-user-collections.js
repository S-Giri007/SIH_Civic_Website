// Script to check user ID storage in MongoDB collections
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://giri:Sgiri%40123@giridb.ruxfhu5.mongodb.net/SIH';

async function checkUserCollections() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(); // Will use default database
    
    // Check users collection
    console.log('\n📋 USERS COLLECTION:');
    console.log('=' .repeat(50));
    
    const users = await db.collection('users').find({}).limit(3).toArray();
    
    if (users.length > 0) {
      console.log('Sample user document structure:');
      console.log(JSON.stringify(users[0], null, 2));
      
      console.log('\n👥 All User IDs and Usernames:');
      const allUsers = await db.collection('users').find({})
        .project({ _id: 1, username: 1, name: 1, role: 1 })
        .toArray();
      
      allUsers.forEach(user => {
        console.log(`  - ID: ${user._id} | Username: ${user.username} | Name: ${user.name} | Role: ${user.role}`);
      });
    }
    
    // Check issues collection for user references
    console.log('\n\n📋 ISSUES COLLECTION (User References):');
    console.log('=' .repeat(50));
    
    const issues = await db.collection('issues').find({}).limit(2).toArray();
    
    if (issues.length > 0) {
      console.log('Sample issue document structure:');
      console.log(JSON.stringify(issues[0], null, 2));
      
      console.log('\n📊 User ID References in Issues:');
      const allIssues = await db.collection('issues').find({})
        .project({ 
          _id: 1, 
          title: 1, 
          citizenId: 1, 
          citizenName: 1, 
          assignedOfficer: 1 
        })
        .toArray();
      
      allIssues.forEach(issue => {
        console.log(`\n  Issue: ${issue.title}`);
        console.log(`    - Issue ID: ${issue._id}`);
        console.log(`    - Citizen ID: ${issue.citizenId || 'Not set'}`);
        console.log(`    - Citizen Name: ${issue.citizenName || 'Not set'}`);
        console.log(`    - Assigned Officer ID: ${issue.assignedOfficer || 'Not assigned'}`);
      });
    }
    
    // Check for any other collections that might store user references
    console.log('\n\n📁 ALL COLLECTIONS:');
    console.log('=' .repeat(50));
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
      
      // Check if collection has user-related fields
      if (count > 0) {
        const sample = await db.collection(collection.name).findOne({});
        const hasUserId = JSON.stringify(sample).includes('userId') || 
                         JSON.stringify(sample).includes('user_id') ||
                         JSON.stringify(sample).includes('citizenId') ||
                         JSON.stringify(sample).includes('assignedOfficer');
        
        if (hasUserId) {
          console.log(`    ↳ Contains user references`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

checkUserCollections();