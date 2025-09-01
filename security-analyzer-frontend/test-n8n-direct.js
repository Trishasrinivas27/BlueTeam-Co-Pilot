// Direct test to n8n webhook (bypassing proxy)
// Run with: node test-n8n-direct.js

const fetch = require('node-fetch');

const testSecurityLog = `2024-01-15 14:23:45 [AUTH] Failed login attempt for user 'admin' from IP 192.168.1.100. Password authentication failed. Attempt count: 5 within 2 minutes.`;

async function testDirectN8nWebhook() {
  try {
    console.log('🔍 Testing direct connection to n8n webhook...');
    console.log('📝 Test log:', testSecurityLog);
    console.log('');

    console.log('📡 Attempting to connect to: http://localhost:5678/webhook-test/log');

    const response = await fetch('http://localhost:5678/webhook-test/log', {
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
    console.log('✅ Success! n8n webhook is working!');
    console.log('📄 Analysis result:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Direct n8n test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\\n🔧 Connection refused - n8n is not running or not accessible');
      console.log('   Make sure:');
      console.log('   1. n8n is running (check with: npx n8n start)');
      console.log('   2. n8n is running on port 5678');
      console.log('   3. Your webhook workflow is activated');
    } else if (error.message.includes('fetch failed')) {
      console.log('\\n🔧 Network connection failed');
      console.log('   This usually means n8n is not running or not accessible');
    } else {
      console.log('\\n🔧 Troubleshooting steps:');
      console.log('1. Start n8n: npx n8n start');
      console.log('2. Open n8n UI: http://localhost:5678');
      console.log('3. Activate your webhook workflow');
      console.log('4. Make sure webhook URL ends with: /webhook-test/log');
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDirectN8nWebhook();
}
