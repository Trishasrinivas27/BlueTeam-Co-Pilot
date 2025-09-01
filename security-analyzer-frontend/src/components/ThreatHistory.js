import React, { useState, useEffect } from 'react';
import { getThreatHistory, deleteThreatAnalysis, clearThreatHistory, sortThreatHistory, filterThreatHistory, formatTimestamp } from '../utils/threatHistory';

const ThreatHistory = ({ onSelectAnalysis }) => {
  const [history, setHistory] = useState([]);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const rawHistory = getThreatHistory();
    setHistory(rawHistory);
  };

  const handleDelete = (id) => {
    if (deleteThreatAnalysis(id)) {
      loadHistory();
      setShowDeleteConfirm(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all threat history? This action cannot be undone.')) {
      clearThreatHistory();
      loadHistory();
    }
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const getFilteredAndSortedHistory = () => {
    let filtered = history;
    
    switch (filterLevel) {
      case 'high':
        filtered = filterThreatHistory(history, 61, 100);
        break;
      case 'medium':
        filtered = filterThreatHistory(history, 31, 60);
        break;
      case 'low':
        filtered = filterThreatHistory(history, 0, 30);
        break;
      default:
        filtered = history;
    }
    
    return sortThreatHistory(filtered, sortBy, sortOrder);
  };

  const getThreatLevelClass = (score) => {
    if (score <= 30) return 'threat-low';
    if (score <= 60) return 'threat-medium';
    return 'threat-high';
  };

  const getThreatLevel = (score) => {
    if (score <= 30) return 'Low';
    if (score <= 60) return 'Medium';
    return 'High';
  };

  const filteredHistory = getFilteredAndSortedHistory();

  if (history.length === 0) {
    return (
      <div className="threat-history">
        <div className="history-header">
          <h2>📊 Threat Analysis History</h2>
        </div>
        <div className="empty-history">
          <p>No threat analyses yet. Analyze some security events to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="threat-history">
      <div className="history-header">
        <h2>📊 Threat Analysis History ({history.length} total)</h2>
        
        <div className="history-controls">
          <div className="filter-controls">
            <label>Filter by level:</label>
            <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
              <option value="all">All Levels</option>
              <option value="high">High (61-100)</option>
              <option value="medium">Medium (31-60)</option>
              <option value="low">Low (0-30)</option>
            </select>
          </div>
          
          <div className="sort-controls">
            <label>Sort by:</label>
            <button 
              className={`sort-btn ${sortBy === 'timestamp' ? 'active' : ''}`}
              onClick={() => handleSort('timestamp')}
            >
              Date {sortBy === 'timestamp' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={`sort-btn ${sortBy === 'threat_score' ? 'active' : ''}`}
              onClick={() => handleSort('threat_score')}
            >
              Score {sortBy === 'threat_score' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              className={`sort-btn ${sortBy === 'technique' ? 'active' : ''}`}
              onClick={() => handleSort('technique')}
            >
              Technique {sortBy === 'technique' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
          
          <button onClick={handleClearAll} className="clear-history-btn">
            🗑️ Clear All
          </button>
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.map((item) => (
          <div key={item.id} className="history-item">
            <div className="history-item-header">
              <div className="history-meta">
                <span className="timestamp">{formatTimestamp(item.timestamp)}</span>
                <span className={`threat-badge ${getThreatLevelClass(item.analysis.threat_score)}`}>
                  {item.analysis.threat_score}/100 ({getThreatLevel(item.analysis.threat_score)})
                </span>
              </div>
              <div className="history-actions">
                <button 
                  onClick={() => onSelectAnalysis(item)}
                  className="view-btn"
                >
                  👁️ View
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(item.id)}
                  className="delete-btn"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="history-content">
              <div className="log-preview">
                <strong>Log:</strong> {item.logInput.substring(0, 100)}{item.logInput.length > 100 ? '...' : ''}
              </div>
              <div className="analysis-preview">
                <strong>Cause:</strong> {item.analysis.cause.substring(0, 80)}{item.analysis.cause.length > 80 ? '...' : ''}
              </div>
              <div className="technique-preview">
                <strong>MITRE:</strong> {item.analysis.mitre_technique}
              </div>
            </div>
            
            {showDeleteConfirm === item.id && (
              <div className="delete-confirm">
                <p>Delete this analysis?</p>
                <button onClick={() => handleDelete(item.id)} className="confirm-delete">
                  Yes, Delete
                </button>
                <button onClick={() => setShowDeleteConfirm(null)} className="cancel-delete">
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredHistory.length === 0 && history.length > 0 && (
        <div className="no-results">
          <p>No analyses match the current filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ThreatHistory;
