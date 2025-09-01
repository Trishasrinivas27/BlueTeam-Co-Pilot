import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getThreatStatistics } from '../utils/threatHistory';
import { format, parseISO } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ThreatChart = ({ history }) => {
  const stats = getThreatStatistics(history);

  const timelineData = {
    labels: history.slice(0, 20).reverse().map(item => 
      format(parseISO(item.timestamp), 'MMM dd HH:mm')
    ),
    datasets: [
      {
        label: 'Threat Score',
        data: history.slice(0, 20).reverse().map(item => item.analysis.threat_score),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        pointBackgroundColor: history.slice(0, 20).reverse().map(item => {
          const score = item.analysis.threat_score;
          if (score <= 30) return '#10b981';
          if (score <= 60) return '#f59e0b';
          return '#ef4444';
        }),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  const distributionData = {
    labels: ['Low (0-30)', 'Medium (31-60)', 'High (61-100)'],
    datasets: [
      {
        data: [stats.lowThreats, stats.mediumThreats, stats.highThreats],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderColor: ['#059669', '#d97706', '#dc2626'],
        borderWidth: 2
      }
    ]
  };

  const techniqueData = {
    labels: stats.topTechniques.map(t => t.technique.split(' - ')[0] || t.technique),
    datasets: [
      {
        label: 'Occurrences',
        data: stats.topTechniques.map(t => t.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Threat Analysis Visualization' }
    },
    scales: { y: { beginAtZero: true, max: 100 } }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top MITRE ATT&CK Techniques' }
    },
    scales: { y: { beginAtZero: true } }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Threat Level Distribution' }
    }
  };

  if (history.length === 0) {
    return (
      <div className="threat-chart">
        <div className="chart-header">
          <h2>📈 Threat Analytics</h2>
        </div>
        <div className="empty-chart">
          <p>No data available for visualization. Analyze some security events to see charts here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="threat-chart">
      <div className="chart-header">
        <h2>📈 Threat Analytics</h2>
        
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Analyses</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.averageScore}</span>
            <span className="stat-label">Avg. Score</span>
          </div>
          <div className="stat-card high">
            <span className="stat-number">{stats.highThreats}</span>
            <span className="stat-label">High Threats</span>
          </div>
          <div className="stat-card medium">
            <span className="stat-number">{stats.mediumThreats}</span>
            <span className="stat-label">Medium Threats</span>
          </div>
          <div className="stat-card low">
            <span className="stat-number">{stats.lowThreats}</span>
            <span className="stat-label">Low Threats</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Threat Score Timeline</h3>
          <div className="chart-wrapper">
            <Line data={timelineData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3>Threat Level Distribution</h3>
          <div className="chart-wrapper">
            <Doughnut data={distributionData} options={doughnutOptions} />
          </div>
        </div>

        {stats.topTechniques.length > 0 && (
          <div className="chart-container full-width">
            <h3>Most Common MITRE ATT&CK Techniques</h3>
            <div className="chart-wrapper">
              <Bar data={techniqueData} options={barChartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreatChart;
