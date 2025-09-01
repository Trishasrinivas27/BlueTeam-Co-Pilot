# 🛡️ Security Analyzer Setup Guide

This guide will help you set up the n8n webhook integration with your React frontend.

## 🔧 Quick Setup Steps

### 1. Start n8n (if not already running)
```bash
npx n8n start
```
This will start n8n on `http://localhost:5678`

### 2. Configure your n8n workflow
1. Open n8n UI at `http://localhost:5678`
2. Create or open your security analysis workflow
3. Make sure your webhook node has the path: `webhook-test/log`
4. **IMPORTANT**: Click the "Execute workflow" button to activate the test webhook

### 3. Start the application
Option A - Use the simple startup script:
```bash
.\start-all.bat
```

Option B - Manual startup:
```bash
# Terminal 1: Start proxy server
npm run proxy

# Terminal 2: Start React app  
npm start
```

## 🧪 Testing the Connection

Test direct n8n connection:
```bash
node test-n8n-direct.js
```

Test full proxy connection:
```bash
node test-connection.js
```

## 🚀 Application URLs
- React App: http://localhost:3000
- Proxy Server: http://localhost:3001
- n8n UI: http://localhost:5678

## ❗ Common Issues

### Issue: "webhook not registered" (404 error)
**Solution**: In n8n UI, click the "Execute workflow" button to activate the test webhook

### Issue: "Connection refused" 
**Solution**: Make sure n8n is running on port 5678

### Issue: CORS errors
**Solution**: The proxy server handles CORS - make sure it's running on port 3001

### Issue: "Key parameter is empty" in n8n
**Solution**: Check your n8n workflow memory nodes for missing configuration

## 🔄 Workflow Architecture

```
React App (port 3000) 
    ↓
Proxy Server (port 3001)
    ↓  
n8n Webhook (port 5678)
    ↓
AI Analysis Workflow
    ↓
Response back to React
```

## 📝 Expected n8n Webhook Response Format

Your n8n workflow should return JSON in this format:
```json
{
  "threat_score": 8,
  "cause": "Multiple failed login attempts detected",
  "remedy": "Implement account lockout policies",
  "mitre_technique": "T1110.001 - Password Spraying", 
  "mitre_attck_url": "https://attack.mitre.org/techniques/T1110/001/",
  "approach": [
    "Monitor failed login patterns",
    "Implement rate limiting",
    "Enable MFA"
  ]
}
```
