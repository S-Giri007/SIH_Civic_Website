// Simple test for the new login system
const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing simple login...');
    
    // Test with admin credentials
    const response = await axios.post('http://localhost:3001/api/auth/simple-login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('User:', response.data.user.name);
    console.log('Role:', response.data.user.role);
    console.log('Verified:', response.data.user.isVerified);
    
    // Test fetching users without auth
    const usersResponse = await axios.get('http://localhost:3001/api/users');
    console.log('✅ Users fetched successfully!');
    console.log('Total users:', usersResponse.data.users.length);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
};

testLogin();