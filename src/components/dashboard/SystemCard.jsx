import React from 'react';
import '../../styles/dashboard.css';

const SystemCard = ({ 
  title, 
  icon, 
  primaryMetric, 
  secondaryMetrics, 
  status, 
  onClick, 
  isExpanded 
}) => {
  const getStatusClass = () => {
    switch (status) {
      case 'good': return 'status-good';
      case 'warning': return 'status-warning';
      case 'danger': return 'status-danger';
      default: return 'status-normal';
    }
  };

  return (
    <div 
      className={`system-card ${isExpanded ? 'expanded' : ''}`}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <h3 className="card-title">{title}</h3>
        <div className={`status-indicator ${getStatusClass()}`}></div>
      </div>

      <div className="card-content">
        <div className="primary-metric">
          <span className="metric-value">{primaryMetric.value}</span>
          <span className="metric-unit">{primaryMetric.unit}</span>
          <span className="metric-label">{primaryMetric.label}</span>
        </div>

        {!isExpanded && (
          <div className="secondary-metrics">
            {secondaryMetrics.map((metric, index) => (
              <div key={index} className="metric-item">
                <span className="metric-name">{metric.label}:</span>
                <span className="metric-data">{metric.value} {metric.unit}</span>
              </div>
            ))}
          </div>
        )}

        {!isExpanded && (
          <div className="card-footer">
            <span className="expand-hint">Click to expand →</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemCard;
