# Security Event Analyzer Frontend

A React-based frontend application that integrates with your n8n workflow to analyze security events using AI.

## Features

- 🛡️ **Security Event Analysis**: Submit security logs and get AI-powered threat analysis
- 🎯 **Threat Scoring**: Visual threat level indicators (1-10 scale)
- 🔍 **MITRE ATT&CK Integration**: Links to relevant MITRE techniques
- 💡 **Remediation Suggestions**: AI-generated remediation steps
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- npm
- Your n8n workflow running on `http://localhost:5678`

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open your browser to `http://localhost:3000`

## Usage

1. **Enter Security Log**: Paste your security event log data into the text area
2. **Analyze**: Click the "Analyze Security Event" button
3. **Review Results**: The AI will provide:
   - Threat score (1-10)
   - Root cause analysis
   - Recommended remediation steps
   - MITRE ATT&CK technique mapping
   - Detailed approach recommendations

## Backend Integration

This frontend connects to your n8n workflow endpoint:
- **URL**: `http://localhost:5678/webhook-test/log`
- **Method**: POST
- **Payload**: `{ "log": "your-security-event-data" }`

The expected response format from your n8n workflow:
```json
{
  "threat_score": 7,
  "cause": "Suspicious login attempt detected",
  "remedy": "Block IP address and reset user credentials",
  "mitre_att&ck_url": "https://attack.mitre.org/techniques/T1078/",
  "mitre_technique": "Valid Accounts",
  "approach": ["Monitor login patterns", "Implement MFA", "Review access logs"]
}
```

## Development Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run dev` - Start development server and open browser

## Troubleshooting

- **CORS Issues**: Make sure your n8n instance allows requests from `http://localhost:3000`
- **Connection Errors**: Verify your n8n workflow is running on port 5678
- **API Errors**: Check the browser console for detailed error messages
