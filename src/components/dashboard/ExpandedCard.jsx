import React from 'react';
import DialGauge from '../charts/DialGauge';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import '../../styles/dashboard.css';

const ExpandedCard = ({ type, data, history, onClose }) => {
  const renderWeatherContent = () => (
    <div className="expanded-content">
      <div className="gauges-row">
        <DialGauge
          value={data.temperature_dht || 0}
          min={-10}
          max={50}
          label="Temperature"
          unit="°C"
          thresholds={{ warning: 35, danger: 40 }}
        />
        <DialGauge
          value={data.humidity || 0}
          min={0}
          max={100}
          label="Humidity"
          unit="%"
          thresholds={{ warning: 70, danger: 85 }}
        />
      </div>

      <div className="charts-row">
        <LineChart
          data={history.map((h, i) => ({ 
            label: i.toString(), 
            value: h.temperature_dht || 0 
          }))}
          label="Temperature History"
          color="#ff6b6b"
          unit="°C"
        />
      </div>

      <div className="data-grid">
        <div className="data-item">
          <span className="data-label">Pressure</span>
          <span className="data-value">{data.pressure?.toFixed(2) || 0} hPa</span>
        </div>
        <div className="data-item">
          <span className="data-label">Altitude</span>
          <span className="data-value">{data.altitude?.toFixed(2) || 0} m</span>
        </div>
        <div className="data-item">
          <span className="data-label">Last Update</span>
          <span className="data-value">
            {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderAirQualityContent = () => (
    <div className="expanded-content">
      <div className="gauges-row">
        <DialGauge
          value={data.noise_level || 0}
          min={0}
          max={120}
          label="Noise Level"
          unit="dB"
          thresholds={{ warning: 70, danger: 90 }}
        />
        <DialGauge
          value={data.co2 || 0}
          min={0}
          max={2000}
          label="CO2"
          unit="ppm"
          thresholds={{ warning: 1000, danger: 1500 }}
        />
        <DialGauge
          value={data.co || 0}
          min={0}
          max={100}
          label="CO"
          unit="ppm"
          thresholds={{ warning: 50, danger: 70 }}
        />
      </div>

      <div className="charts-row">
        <BarChart
          data={[
            { label: 'PM2.5', value: data.pm25 || 0 },
            { label: 'PM10', value: data.pm10 || 0 },
          ]}
          label="Particulate Matter"
          color="#9c27b0"
          unit=" µg/m³"
        />
      </div>

      <div className="data-grid">
        <div className="data-item">
          <span className="data-label">Noise Quality Index</span>
          <span className="data-value">{data.nqi || 'N/A'}</span>
        </div>
        <div className="data-item">
          <span className="data-label">MQ7 Sensor</span>
          <span className="data-value">{data.mq7 || 0}</span>
        </div>
        <div className="data-item">
          <span className="data-label">Smoke Level</span>
          <span className="data-value">{data.smoke?.toFixed(1) || 0}</span>
        </div>
        <div className="data-item">
          <span className="data-label">Last Update</span>
          <span className="data-value">
            {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderWaterQualityContent = () => (
    <div className="expanded-content">
      <div className="gauges-row">
        <DialGauge
          value={data.ph_level || 7}
          min={0}
          max={14}
          label="pH Level"
          unit=""
          thresholds={{ warning: 8.5, danger: 9.5 }}
        />
        <DialGauge
          value={data.tds || 0}
          min={0}
          max={1000}
          label="TDS"
          unit="ppm"
          thresholds={{ warning: 500, danger: 800 }}
        />
        <DialGauge
          value={data.turbidity || 0}
          min={0}
          max={100}
          label="Turbidity"
          unit="NTU"
          thresholds={{ warning: 50, danger: 75 }}
        />
      </div>

      <div className="charts-row">
        <LineChart
          data={history.map((h, i) => ({ 
            label: i.toString(), 
            value: h.ph_level || 7 
          }))}
          label="pH Level History"
          color="#00bcd4"
          unit=""
        />
      </div>

      <div className="data-grid">
        <div className="data-item">
          <span className="data-label">Conductivity</span>
          <span className="data-value">{data.conductivity?.toFixed(1) || 0} µS/cm</span>
        </div>
        <div className="data-item">
          <span className="data-label">Water Quality</span>
          <span className="data-value">
            {data.ph_level >= 6.5 && data.ph_level <= 8.5 ? 'Good' : 'Poor'}
          </span>
        </div>
        <div className="data-item">
          <span className="data-label">Last Update</span>
          <span className="data-value">
            {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );

  const getTitle = () => {
    switch (type) {
      case 'weather': return '🌤️ Weather Monitoring';
      case 'air': return '🌬️ Air & Noise Quality';
      case 'water': return '💧 Water Quality';
      default: return 'System Data';
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'weather': return renderWeatherContent();
      case 'air': return renderAirQualityContent();
      case 'water': return renderWaterQualityContent();
      default: return null;
    }
  };

  return (
    <div className="expanded-card-overlay" onClick={onClose}>
      <div className="expanded-card" onClick={(e) => e.stopPropagation()}>
        <div className="expanded-header">
          <h2>{getTitle()}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default ExpandedCard;
