import React, { useState, useEffect } from 'react';
import './App.css';
import ThreatHistory from './components/ThreatHistory';
import ThreatChart from './components/ThreatChart';
import { saveThreatAnalysis, getThreatHistory, formatTimestamp } from './utils/threatHistory';
import { generateCurrentAnalysisPDF, generateFullReportPDF } from './utils/pdfGenerator';

// Mock analysis generator for when n8n workflow is not complete
const generateMockAnalysis = (logData) => {
  const log = logData.toLowerCase();
  
  // Simple keyword-based analysis
  let analysis = {
    threat_score: 25,
    cause: 'General security event detected',
    remedy: 'Monitor and investigate further',
    mitre_technique: 'T1001 - Data Obfuscation',
    mitre_attck_url: 'https://attack.mitre.org/techniques/T1001/',
    approach: [
      'Review security logs',
      'Implement monitoring',
      'Update security policies'
    ],
    mock: true
  };

  // Keyword-based threat detection
  if (log.includes('failed') || log.includes('login') || log.includes('auth')) {
    analysis = {
      threat_score: 75,
      cause: 'Multiple failed authentication attempts detected - potential brute force attack',
      remedy: 'Implement account lockout policies and monitor for suspicious IP addresses',
      mitre_technique: 'T1110.001 - Password Spraying',
      mitre_attck_url: 'https://attack.mitre.org/techniques/T1110/001/',
      approach: [
        'Enable account lockout after failed attempts',
        'Implement multi-factor authentication',
        'Monitor and block suspicious IP addresses',
        'Review password policies'
      ],
      mock: true
    };
  } else if (log.includes('malware') || log.includes('virus') || log.includes('trojan')) {
    analysis = {
      threat_score: 95,
      cause: 'Malware detected on system - immediate containment required',
      remedy: 'Isolate affected system and run full antimalware scan',
      mitre_technique: 'T1204.002 - Malicious File',
      mitre_attck_url: 'https://attack.mitre.org/techniques/T1204/002/',
      approach: [
        'Immediately isolate infected system',
        'Run comprehensive malware scan',
        'Check for lateral movement',
        'Update antimalware signatures'
      ],
      mock: true
    };
  } else if (log.includes('unauthorized') || log.includes('access') || log.includes('privilege')) {
    analysis = {
      threat_score: 65,
      cause: 'Unauthorized access attempt or privilege escalation detected',
      remedy: 'Review access controls and user permissions',
      mitre_technique: 'T1078 - Valid Accounts',
      mitre_attck_url: 'https://attack.mitre.org/techniques/T1078/',
      approach: [
        'Audit user permissions and access logs',
        'Implement principle of least privilege',
        'Review and update access controls',
        'Monitor for suspicious account activity'
      ],
      mock: true
    };
  } else if (log.includes('network') || log.includes('connection') || log.includes('traffic')) {
    analysis = {
      threat_score: 45,
      cause: 'Suspicious network activity detected',
      remedy: 'Monitor network traffic and check for anomalies',
      mitre_technique: 'T1071 - Application Layer Protocol',
      mitre_attck_url: 'https://attack.mitre.org/techniques/T1071/',
      approach: [
        'Monitor network traffic patterns',
        'Implement network segmentation',
        'Review firewall rules',
        'Check for data exfiltration'
      ],
      mock: true
    };
  }

  return analysis;
};

const App = () => {
  const [logInput, setLogInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analyzer');
  const [threatHistory, setThreatHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  useEffect(() => {
    loadThreatHistory();
  }, []);

  const loadThreatHistory = () => {
    const history = getThreatHistory();
    setThreatHistory(history);
  };

  const analyzeSecurityEvent = async () => {
    if (!logInput.trim()) {
      setError('Please enter a security event log to analyze');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      console.log('🔄 Sending request to proxy server...');
      const response = await fetch('/api/webhook-test/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          log: logInput
        })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Server error:', errorData);
        
        // Show user-friendly error messages
        if (errorData.message && errorData.message.includes('Execute workflow')) {
          throw new Error('Please activate your n8n webhook by clicking "Execute workflow" in the n8n UI first.');
        } else if (errorData.message && errorData.message.includes('not running')) {
          throw new Error('n8n server is not running. Please start n8n with: npx n8n start');
        } else {
          throw new Error(errorData.message || `Server error (${response.status})`);
        }
      }

      let result = await response.text(); // Get as text first
      console.log('✅ Raw n8n response (text):', result);
      
      // Parse the outer JSON wrapper first
      try {
        result = JSON.parse(result);
        console.log('✅ Parsed outer JSON:', result);
      } catch (outerParseError) {
        console.error('❌ Could not parse outer JSON:', outerParseError);
        throw new Error('n8n returned invalid JSON wrapper');
      }
      
      // Extract the actual analysis from the 'response' field
      if (result.response && typeof result.response === 'string') {
        console.log('🔍 Found nested JSON in response field:', result.response);
        
        try {
          // Clean up the nested JSON string
          let nestedJson = result.response
            .replace(/\\n/g, '')  // Remove literal \n
            .replace(/\\t/g, '')  // Remove literal \t
            .replace(/\\"/g, '"') // Fix escaped quotes
            .trim();
          
          console.log('🔧 Cleaned nested JSON:', nestedJson);
          
          // Parse the nested JSON
          result = JSON.parse(nestedJson);
          console.log('✅ Successfully parsed nested JSON:', result);
          
        } catch (nestedParseError) {
          console.error('❌ Could not parse nested JSON:', nestedParseError);
          console.log('📝 Failed nested JSON string:', result.response);
          throw new Error('n8n workflow returned invalid nested JSON format');
        }
      }
      
      // Check if this is a raw webhook response (not processed analysis)
      if (result.body && result.executionMode === 'test' && !result.threat_score) {
        console.log('🔍 Detected raw webhook response - using mock analysis');
        
        // Extract the actual log data from the webhook body
        const logData = result.body.log || result.body;
        console.log('📝 Log data received:', logData);
        
        // Generate mock analysis based on log content
        result = generateMockAnalysis(logData);
        console.log('🧪 Generated mock analysis:', result);
      }
      
      // Normalize field names from n8n workflow
      if (result['mitre_att&ck_url']) {
        result.mitre_attck_url = result['mitre_att&ck_url'];
        delete result['mitre_att&ck_url'];
      }
      
      // Validate that we have the expected analysis structure
      if (result.threat_score === undefined && result.cause === undefined) {
        console.log('❌ Missing analysis fields. Full response:', result);
        throw new Error(
          'n8n workflow is not returning analysis data. ' +
          'Please check that your workflow includes AI analysis nodes and returns: ' +
          'threat_score, cause, remedy, mitre_technique, approach fields.'
        );
      }
      
      console.log('✅ Final processed result:', result);
      
      setAnalysis(result);
      
      // Save to history if it's not a mock analysis
      if (!result.mock) {
        saveThreatAnalysis(result, logInput);
        loadThreatHistory();
      }
      
    } catch (err) {
      console.error('❌ Error details:', err);
      
      // Network/connection errors
      if (err.message.includes('fetch')) {
        setError('Cannot connect to proxy server. Make sure the proxy server is running on port 3001.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setSelectedHistoryItem(item);
    setAnalysis(item.analysis);
    setLogInput(item.logInput);
    setActiveTab('analyzer');
  };

  const handleDownloadCurrentPDF = async () => {
    if (!analysis) return;
    
    try {
      const analysisItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        logInput,
        analysis
      };
      await generateCurrentAnalysisPDF(analysisItem, logInput);
    } catch (error) {
      setError('Failed to generate PDF report: ' + error.message);
    }
  };

  const handleDownloadFullReport = async () => {
    if (threatHistory.length === 0) {
      setError('No threat history available for report generation');
      return;
    }
    
    try {
      await generateFullReportPDF(threatHistory);
    } catch (error) {
      setError('Failed to generate full report: ' + error.message);
    }
  };

  const getThreatScoreColor = (score) => {
    if (score <= 30) return '#10b981'; // Green
    if (score <= 60) return '#f59e0b'; // Yellow  
    return '#ef4444'; // Red
  };

  const getThreatLevel = (score) => {
    if (score <= 30) return 'Low';
    if (score <= 60) return 'Medium';
    return 'High';
  };

  const clearResults = () => {
    setLogInput('');
    setAnalysis(null);
    setError('');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🛡️ Security Event Analyzer</h1>
        <p>Analyze security events using AI-powered threat detection with Pinecone & Mistral AI</p>
      </header>

      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyzer')}
        >
          🔍 Analyzer
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📊 History ({threatHistory.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'analyzer' && (
          <div className="analyzer-tab">
            <div className="input-section">
              <label htmlFor="log-input" className="input-label">
                Security Event Log
              </label>
              <textarea
                id="log-input"
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                placeholder="Enter your security event log data here..."
                className="log-input"
                rows={8}
              />
              
              <div className="button-group">
                <button
                  onClick={analyzeSecurityEvent}
                  disabled={loading || !logInput.trim()}
                  className="analyze-btn"
                >
                  {loading ? '🔄 Analyzing...' : '🔍 Analyze Security Event'}
                </button>
                
                {analysis && (
                  <button onClick={handleDownloadCurrentPDF} className="pdf-btn">
                    📄 Download PDF
                  </button>
                )}
                
                {(analysis || error) && (
                  <button onClick={clearResults} className="clear-btn">
                    🗑️ Clear
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="error-message">
                <strong>❌ Error:</strong> {error}
              </div>
            )}

            {analysis && (
              <div className="results-section">
                <div className="results-header">
                  <h2>🎯 Analysis Results</h2>
                  {selectedHistoryItem && (
                    <span className="history-indicator">
                      📅 From History: {formatTimestamp(selectedHistoryItem.timestamp)}
                    </span>
                  )}
                </div>
                
                {analysis.mock && (
                  <div className="mock-notice">
                    🧪 <strong>Mock Analysis Mode:</strong> Using keyword-based analysis since n8n workflow is not complete. 
                    Connect AI analysis nodes in your n8n workflow for real AI-powered analysis.
                  </div>
                )}
                
                <div className="threat-score-card">
                  <div className="threat-score">
                    <span 
                      className="score-number"
                      style={{ color: getThreatScoreColor(analysis.threat_score) }}
                    >
                      {analysis.threat_score}/100
                    </span>
                    <span className="score-label">
                      Threat Level: {getThreatLevel(analysis.threat_score)}
                    </span>
                  </div>
                </div>

                <div className="analysis-grid">
                  <div className="analysis-card">
                    <h3>🔍 Cause</h3>
                    <p>{analysis.cause}</p>
                  </div>

                  <div className="analysis-card">
                    <h3>💡 Remedy</h3>
                    <p>{analysis.remedy}</p>
                  </div>

                  <div className="analysis-card">
                    <h3>🎯 MITRE ATT&CK Technique</h3>
                    <p>{analysis.mitre_technique}</p>
                    {(analysis.mitre_attck_url || analysis['mitre_att&ck_url']) && (
                      <a 
                        href={analysis.mitre_attck_url || analysis['mitre_att&ck_url']} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mitre-link"
                      >
                        📖 View MITRE ATT&CK Details
                      </a>
                    )}
                  </div>

                  <div className="analysis-card">
                    <h3>🛠️ Approach</h3>
                    <ul className="approach-list">
                      {Array.isArray(analysis.approach) ? 
                        analysis.approach.map((item, index) => (
                          <li key={index}>{item}</li>
                        )) : 
                        <li>{analysis.approach}</li>
                      }
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <div className="tab-header">
              <h2>📊 Threat Analysis History</h2>
              {threatHistory.length > 0 && (
                <button onClick={handleDownloadFullReport} className="pdf-btn">
                  📄 Download Full Report
                </button>
              )}
            </div>
            <ThreatHistory 
              onSelectAnalysis={handleSelectHistoryItem}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="tab-header">
              <h2>📈 Threat Analytics & Insights</h2>
              {threatHistory.length > 0 && (
                <button onClick={handleDownloadFullReport} className="pdf-btn">
                  📄 Download Analytics Report
                </button>
              )}
            </div>
            <ThreatChart history={threatHistory} />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Powered by n8n AI Workflow • Pinecone Vector Store • Mistral AI • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
