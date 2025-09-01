const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Custom proxy route for n8n webhook with detailed logging
app.post('/api/webhook-test/log', async (req, res) => {
  try {
    console.log('\n🔄 [' + new Date().toISOString() + '] Received request from frontend');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📡 Forwarding to n8n webhook at: http://localhost:5678/webhook-test/log');
    
    const n8nResponse = await fetch('http://localhost:5678/webhook-test/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
      timeout: 30000 // 30 second timeout
    });
    
    console.log(`📊 n8n Response status: ${n8nResponse.status}`);
    console.log(`📊 n8n Response headers:`, Object.fromEntries(n8nResponse.headers.entries()));
    
    const responseText = await n8nResponse.text();
    console.log(`📄 n8n Response body (${responseText.length} chars):`, responseText);
    
    if (!n8nResponse.ok) {
      console.error('❌ n8n returned error:', responseText);
      
      // Parse n8n error for better user feedback
      let errorDetails;
      try {
        errorDetails = JSON.parse(responseText);
      } catch (e) {
        errorDetails = { message: responseText };
      }
      
      // Provide helpful error messages
      let userMessage = errorDetails.message || 'Unknown n8n error';
      if (errorDetails.message && errorDetails.message.includes('not registered')) {
        userMessage = 'Webhook not activated in n8n. Please click "Execute workflow" in your n8n UI to activate the webhook.';
      } else if (errorDetails.hint) {
        userMessage = errorDetails.hint;
      }
      
      return res.status(n8nResponse.status).json({
        error: 'n8n workflow error',
        status: n8nResponse.status,
        message: userMessage,
        technical_details: errorDetails
      });
    }
    
    // Try to parse JSON, fallback to text if it fails
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ Parsed JSON response successfully');
      
      // Handle case where n8n returns nested JSON string in 'output' field
      if (result.output && typeof result.output === 'string') {
        try {
          const parsedOutput = JSON.parse(result.output);
          console.log('🔄 Detected nested JSON, extracting analysis data');
          result = parsedOutput; // Replace with the actual analysis data
        } catch (nestedParseError) {
          console.log('⚠️ Could not parse nested JSON in output field');
        }
      }
    } catch (parseError) {
      console.log('⚠️ Response is not valid JSON, returning as text');
      result = { 
        raw_response: responseText,
        warning: 'n8n returned non-JSON response' 
      };
    }
    
    console.log('✅ Success! Sending result to frontend');
    res.json(result);
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    let userMessage = 'Could not connect to n8n server';
    if (error.code === 'ECONNREFUSED') {
      userMessage = 'n8n server is not running. Please start n8n with: npx n8n start';
    } else if (error.message.includes('timeout')) {
      userMessage = 'n8n workflow is taking too long to respond. Check your workflow for issues.';
    }
    
    res.status(500).json({
      error: 'Proxy connection error',
      message: userMessage,
      technical_details: error.message
    });
  }
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    proxy_target: 'http://localhost:5678'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to n8n at http://localhost:5678`);
  console.log(`🔗 Frontend should use: http://localhost:${PORT}/api/webhook-test/log`);
  console.log(`💡 Health check: http://localhost:${PORT}/health`);
});
