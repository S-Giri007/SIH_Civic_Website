// Script to check what's currently in MongoDB
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://giri:Sgiri%40123@giridb.ruxfhu5.mongodb.net/SIH';

async function checkData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(); // Will use default database
    
    // List all databases
    const databases = await client.db().admin().listDatabases();
    console.log('\n📁 Available Databases:');
    databases.databases.forEach(db => {
      console.log(`  - ${db.name}`);
    });
    
    // Check collections in the current database
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Count documents
    if (collections.find(c => c.name === 'users')) {
      const userCount = await db.collection('users').countDocuments();
      const officerCount = await db.collection('users').countDocuments({ role: 'officer' });
      console.log(`\n👥 Users: ${userCount} total, ${officerCount} officers`);
      
      // Show officers
      const officers = await db.collection('users')
        .find({ role: 'officer' })
        .project({ username: 1, name: 1, role: 1, isVerified: 1 })
        .toArray();
      
      console.log('\n👮 Officers in Database:');
      officers.forEach(officer => {
        console.log(`  - ${officer.username}: ${officer.name} (${officer.isVerified ? 'Verified' : 'Unverified'})`);
      });
    }
    
    if (collections.find(c => c.name === 'issues')) {
      const issueCount = await db.collection('issues').countDocuments();
      console.log(`\n📋 Issues: ${issueCount} total`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

checkData();