// Test script to verify n8n webhook connection
// Run with: node test-connection.js

const fetch = require('node-fetch');

const testSecurityLog = `2024-01-15 14:23:45 [AUTH] Failed login attempt for user 'admin' from IP 192.168.1.100. Password authentication failed. Attempt count: 5 within 2 minutes.`;

async function testWebhookConnection() {
  try {
    console.log('🔍 Testing connection to n8n webhook...');
    console.log('📝 Test log:', testSecurityLog);
    console.log('');

    const response = await fetch('http://localhost:3001/api/webhook-test/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        log: testSecurityLog
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Success! Analysis result:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure n8n is running on localhost:5678');
    console.log('2. Click "Execute workflow" button in n8n to activate the test webhook');
    console.log('3. Or activate the workflow for production mode');
    console.log('4. Fix the Simple Memory node "Key parameter is empty" error');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWebhookConnection();
}
