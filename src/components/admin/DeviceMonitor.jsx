import React, { useState, useEffect } from 'react';
import { getLatestWeatherData, getLatestAirQualityData, getLatestWaterQualityData } from '../../services/dataService';
import '../../styles/admin.css';

const DeviceMonitor = () => {
  const [devices, setDevices] = useState([
    {
      id: 'weather-station',
      name: 'Weather Station',
      type: 'Raspberry Pi',
      icon: '🌤️',
      status: 'checking',
      lastUpdate: null,
      data: null
    },
    {
      id: 'air-quality',
      name: 'Air Quality Monitor',
      type: 'ESP32',
      icon: '🌬️',
      status: 'checking',
      lastUpdate: null,
      data: null
    },
    {
      id: 'water-quality',
      name: 'Water Quality Monitor',
      type: 'ESP32',
      icon: '💧',
      status: 'checking',
      lastUpdate: null,
      data: null
    }
  ]);

  const [stats, setStats] = useState({
    active: 0,
    inactive: 0,
    total: 3
  });

  useEffect(() => {
    checkDeviceStatus();
    const interval = setInterval(checkDeviceStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkDeviceStatus = async () => {
    const updatedDevices = [...devices];
    let activeCount = 0;

    // Check Weather Station
    try {
      const result = await getLatestWeatherData();
      const weatherData = result?.data || result; // Handle both { data } and direct data
      if (weatherData && weatherData.timestamp) {
        const lastUpdate = new Date(weatherData.timestamp);
        const now = new Date();
        const diffMinutes = (now - lastUpdate) / 1000 / 60;
        
        updatedDevices[0].status = diffMinutes < 5 ? 'active' : 'inactive';
        updatedDevices[0].lastUpdate = lastUpdate;
        updatedDevices[0].data = weatherData;
        
        if (diffMinutes < 5) activeCount++;
      } else {
        updatedDevices[0].status = 'inactive';
      }
    } catch (error) {
      console.error('Weather check error:', error);
      updatedDevices[0].status = 'error';
    }

    // Check Air Quality Monitor
    try {
      const result = await getLatestAirQualityData();
      const airData = result?.data || result; // Handle both { data } and direct data
      if (airData && airData.timestamp) {
        const lastUpdate = new Date(airData.timestamp);
        const now = new Date();
        const diffMinutes = (now - lastUpdate) / 1000 / 60;
        
        updatedDevices[1].status = diffMinutes < 5 ? 'active' : 'inactive';
        updatedDevices[1].lastUpdate = lastUpdate;
        updatedDevices[1].data = airData;
        
        if (diffMinutes < 5) activeCount++;
      } else {
        updatedDevices[1].status = 'inactive';
      }
    } catch (error) {
      console.error('Air quality check error:', error);
      updatedDevices[1].status = 'error';
    }

    // Check Water Quality Monitor
    try {
      const result = await getLatestWaterQualityData();
      const waterData = result?.data || result; // Handle both { data } and direct data
      if (waterData && waterData.timestamp) {
        const lastUpdate = new Date(waterData.timestamp);
        const now = new Date();
        const diffMinutes = (now - lastUpdate) / 1000 / 60;
        
        updatedDevices[2].status = diffMinutes < 5 ? 'active' : 'inactive';
        updatedDevices[2].lastUpdate = lastUpdate;
        updatedDevices[2].data = waterData;
        
        if (diffMinutes < 5) activeCount++;
      } else {
        updatedDevices[2].status = 'inactive';
      }
    } catch (error) {
      console.error('Water quality check error:', error);
      updatedDevices[2].status = 'error';
    }

    setDevices(updatedDevices);
    setStats({
      active: activeCount,
      inactive: 3 - activeCount,
      total: 3
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-active">● Active</span>;
      case 'inactive':
        return <span className="status-badge status-inactive">● Inactive</span>;
      case 'error':
        return <span className="status-badge status-error">● Error</span>;
      case 'checking':
        return <span className="status-badge status-checking">● Checking...</span>;
      default:
        return <span className="status-badge status-unknown">● Unknown</span>;
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleString();
  };

  return (
    <div className="device-monitor">
      <div className="monitor-header">
        <h2>📡 Device Status Monitor</h2>
        <p className="monitor-description">Real-time monitoring of IoT sensors and data collection devices</p>
      </div>

      <div className="stats-overview">
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Devices</div>
          </div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card stat-inactive">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.inactive}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
      </div>

      <div className="devices-grid">
        {devices.map((device) => (
          <div key={device.id} className={`device-card device-${device.status}`}>
            <div className="device-header">
              <div className="device-icon">{device.icon}</div>
              <div className="device-info">
                <h3 className="device-name">{device.name}</h3>
                <p className="device-type">{device.type}</p>
              </div>
              {getStatusBadge(device.status)}
            </div>
            
            <div className="device-body">
              <div className="device-metric">
                <span className="metric-label">Last Update:</span>
                <span className="metric-value">{getTimeAgo(device.lastUpdate)}</span>
              </div>
              <div className="device-metric">
                <span className="metric-label">Timestamp:</span>
                <span className="metric-value timestamp">{formatDate(device.lastUpdate)}</span>
              </div>
              
              {device.data && (
                <div className="device-data-preview">
                  <div className="data-preview-title">Latest Data:</div>
                  <div className="data-preview-grid">
                    {device.id === 'weather-station' && (
                      <>
                        <div className="data-item">
                          <span>Temp:</span>
                          <strong>{device.data.temperature_dht?.toFixed(1)}°C</strong>
                        </div>
                        <div className="data-item">
                          <span>Humidity:</span>
                          <strong>{device.data.humidity?.toFixed(1)}%</strong>
                        </div>
                      </>
                    )}
                    {device.id === 'air-quality' && (
                      <>
                        <div className="data-item">
                          <span>Noise:</span>
                          <strong>{device.data.noise_level?.toFixed(1)} dB</strong>
                        </div>
                        <div className="data-item">
                          <span>CO2:</span>
                          <strong>{device.data.co2?.toFixed(0)} ppm</strong>
                        </div>
                      </>
                    )}
                    {device.id === 'water-quality' && (
                      <>
                        <div className="data-item">
                          <span>pH:</span>
                          <strong>{device.data.ph_level?.toFixed(2)}</strong>
                        </div>
                        <div className="data-item">
                          <span>TDS:</span>
                          <strong>{device.data.tds?.toFixed(1)} ppm</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="device-footer">
              <button className="btn-refresh" onClick={checkDeviceStatus}>
                🔄 Refresh
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceMonitor;
