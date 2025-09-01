import { format } from 'date-fns';

const STORAGE_KEY = 'security_threat_history';

// Save a new threat analysis to history
export const saveThreatAnalysis = (analysis, logInput) => {
  try {
    const existingHistory = getThreatHistory();
    
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      logInput: logInput.substring(0, 500), // Limit log input size for storage
      analysis: {
        ...analysis,
        mock: false // Mark as real analysis from n8n
      }
    };
    
    const updatedHistory = [newEntry, ...existingHistory];
    
    // Keep only the last 100 entries to prevent storage bloat
    const limitedHistory = updatedHistory.slice(0, 100);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    
    return newEntry;
  } catch (error) {
    console.error('Error saving threat analysis:', error);
    return null;
  }
};

// Get all threat analysis history
export const getThreatHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading threat history:', error);
    return [];
  }
};

// Delete a specific threat analysis
export const deleteThreatAnalysis = (id) => {
  try {
    const history = getThreatHistory();
    const filteredHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
    return true;
  } catch (error) {
    console.error('Error deleting threat analysis:', error);
    return false;
  }
};

// Clear all threat history
export const clearThreatHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing threat history:', error);
    return false;
  }
};

// Sort threat history by various criteria
export const sortThreatHistory = (history, sortBy = 'timestamp', order = 'desc') => {
  const sorted = [...history].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'threat_score':
        aValue = a.analysis.threat_score;
        bValue = b.analysis.threat_score;
        break;
      case 'timestamp':
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
        break;
      case 'technique':
        aValue = a.analysis.mitre_technique || '';
        bValue = b.analysis.mitre_technique || '';
        break;
      default:
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
    }
    
    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  return sorted;
};

// Filter threat history by threat level
export const filterThreatHistory = (history, minScore = 0, maxScore = 100) => {
  return history.filter(item => {
    const score = item.analysis.threat_score;
    return score >= minScore && score <= maxScore;
  });
};

// Get threat statistics
export const getThreatStatistics = (history) => {
  if (history.length === 0) {
    return {
      total: 0,
      averageScore: 0,
      highThreats: 0,
      mediumThreats: 0,
      lowThreats: 0,
      topTechniques: []
    };
  }
  
  const scores = history.map(item => item.analysis.threat_score);
  const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  
  const highThreats = history.filter(item => item.analysis.threat_score > 60).length;
  const mediumThreats = history.filter(item => item.analysis.threat_score > 30 && item.analysis.threat_score <= 60).length;
  const lowThreats = history.filter(item => item.analysis.threat_score <= 30).length;
  
  // Count MITRE techniques
  const techniqueCount = {};
  history.forEach(item => {
    const technique = item.analysis.mitre_technique;
    if (technique) {
      techniqueCount[technique] = (techniqueCount[technique] || 0) + 1;
    }
  });
  
  const topTechniques = Object.entries(techniqueCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([technique, count]) => ({ technique, count }));
  
  return {
    total: history.length,
    averageScore,
    highThreats,
    mediumThreats,
    lowThreats,
    topTechniques
  };
};

// Format timestamp for display
export const formatTimestamp = (timestamp) => {
  return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
};
