import React from 'react';
import '../../styles/charts.css';

const BarChart = ({ data, label, color = '#4CAF50', unit = '' }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bar-chart">
      <h3 className="chart-title">{label}</h3>
      <div className="bar-container">
        {data.map((item, index) => (
          <div key={index} className="bar-wrapper">
            <div className="bar-value">{item.value.toFixed(1)}{unit}</div>
            <div className="bar-outer">
              <div
                className="bar-inner"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                }}
              ></div>
            </div>
            <div className="bar-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
