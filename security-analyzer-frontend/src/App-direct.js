import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [logInput, setLogInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeSecurityEvent = async () => {
    if (!logInput.trim()) {
      setError('Please enter a security event log to analyze');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      console.log('🔄 Sending DIRECT request to n8n (will likely fail due to CORS)...');
      
      // Direct connection to n8n (will fail due to CORS)
      const response = await fetch('http://localhost:5678/webhook-test/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          log: logInput
        })
      });

      console.log('📡 Response status:', response.status);
      const result = await response.json();
      setAnalysis(result);
      
    } catch (err) {
      console.error('❌ Error details:', err);
      setError(`CORS Error (as expected): ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🛡️ Security Event Analyzer (Direct n8n - Will Show CORS Error)</h1>
        <p>This version tries to connect directly to n8n (will fail due to CORS)</p>
      </header>

      <main className="main-content">
        <div className="input-section">
          <textarea
            value={logInput}
            onChange={(e) => setLogInput(e.target.value)}
            placeholder="Enter security event log..."
            className="log-input"
            rows={4}
          />
          
          <button
            onClick={analyzeSecurityEvent}
            disabled={loading || !logInput.trim()}
            className="analyze-btn"
          >
            {loading ? '🔄 Analyzing...' : '🔍 Try Direct Connection (Will Fail)'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <strong>❌ Expected CORS Error:</strong> {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
