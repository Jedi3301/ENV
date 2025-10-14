import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, getCurrentUser, getUserProfile } from '../../services/authService';
import {
  getLatestWeatherData,
  getLatestAirQualityData,
  getLatestWaterQualityData,
  getWeatherHistory,
  getAirQualityHistory,
  getWaterQualityHistory,
  subscribeToWeatherData,
  subscribeToAirQualityData,
  subscribeToWaterQualityData,
} from '../../services/dataService';
import SystemCard from './SystemCard';
import ExpandedCard from './ExpandedCard';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [waterQualityData, setWaterQualityData] = useState(null);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [airHistory, setAirHistory] = useState([]);
  const [waterHistory, setWaterHistory] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    checkUser();
    fetchInitialData();
    
    // Setup polling every 5 seconds
    const pollInterval = setInterval(() => {
      fetchLatestData();
    }, 5000);

    // Setup real-time subscriptions
    const cleanupSubs = setupRealtimeSubscriptions();

    return () => {
      clearInterval(pollInterval);
      if (cleanupSubs) cleanupSubs();
    };
  }, []);

  const checkUser = async () => {
    const { user } = await getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    const { profile } = await getUserProfile(user.id);
    setUser({ ...user, ...profile });
  };

  const fetchInitialData = async () => {
    setLoading(true);

    // Fetch latest data
    const weatherResult = await getLatestWeatherData();
    const airResult = await getLatestAirQualityData();
    const waterResult = await getLatestWaterQualityData();

    setWeatherData(weatherResult?.data || weatherResult);
    setAirQualityData(airResult?.data || airResult);
    setWaterQualityData(waterResult?.data || waterResult);

    // Fetch history
    const weatherHistResult = await getWeatherHistory(20);
    const airHistResult = await getAirQualityHistory(20);
    const waterHistResult = await getWaterQualityHistory(20);

    setWeatherHistory(weatherHistResult?.data || weatherHistResult || []);
    setAirHistory(airHistResult?.data || airHistResult || []);
    setWaterHistory(waterHistResult?.data || waterHistResult || []);

    setLoading(false);
  };

  const fetchLatestData = async () => {
    // Fetch only latest data without loading state (for polling)
    const weatherResult = await getLatestWeatherData();
    const airResult = await getLatestAirQualityData();
    const waterResult = await getLatestWaterQualityData();

    setWeatherData(weatherResult?.data || weatherResult);
    setAirQualityData(airResult?.data || airResult);
    setWaterQualityData(waterResult?.data || waterResult);

    // Also update history
    const weatherHistResult = await getWeatherHistory(20);
    const airHistResult = await getAirQualityHistory(20);
    const waterHistResult = await getWaterQualityHistory(20);

    setWeatherHistory(weatherHistResult?.data || weatherHistResult || []);
    setAirHistory(airHistResult?.data || airHistResult || []);
    setWaterHistory(waterHistResult?.data || waterHistResult || []);
    
    setLastUpdate(new Date());
  };

  const setupRealtimeSubscriptions = () => {
    const weatherSub = subscribeToWeatherData((payload) => {
      console.log('Weather update received:', payload);
      if (payload.new) {
        setWeatherData(payload.new);
        fetchLatestData(); // Refresh all data including history
      }
    });

    const airSub = subscribeToAirQualityData((payload) => {
      console.log('Air quality update received:', payload);
      if (payload.new) {
        setAirQualityData(payload.new);
        fetchLatestData(); // Refresh all data including history
      }
    });

    const waterSub = subscribeToWaterQualityData((payload) => {
      console.log('Water quality update received:', payload);
      if (payload.new) {
        setWaterQualityData(payload.new);
        fetchLatestData(); // Refresh all data including history
      }
    });

    return () => {
      weatherSub.unsubscribe();
      airSub.unsubscribe();
      waterSub.unsubscribe();
    };
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getWeatherStatus = () => {
    if (!weatherData) return 'normal';
    if (weatherData.temperature_dht > 35) return 'danger';
    if (weatherData.temperature_dht > 30) return 'warning';
    return 'good';
  };

  const getAirQualityStatus = () => {
    if (!airQualityData) return 'normal';
    if (airQualityData.co2 > 1500 || airQualityData.pm25 > 35) return 'danger';
    if (airQualityData.co2 > 1000 || airQualityData.pm25 > 12) return 'warning';
    return 'good';
  };

  const getWaterQualityStatus = () => {
    if (!waterQualityData) return 'normal';
    const ph = waterQualityData.ph_level;
    if (ph < 6 || ph > 9 || waterQualityData.turbidity > 75) return 'danger';
    if (ph < 6.5 || ph > 8.5 || waterQualityData.turbidity > 50) return 'warning';
    return 'good';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🌍 Environmental Monitoring Dashboard</h1>
          <div className="header-actions">
            <span className="live-indicator">
              <span className="pulse-dot"></span>
              Live • Updated {lastUpdate.toLocaleTimeString()}
            </span>
            <span className="user-info">
              Welcome, {user?.email}
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="systems-grid">
          <SystemCard
            title="Weather Monitoring"
            icon="🌤️"
            primaryMetric={{
              value: weatherData?.temperature_dht?.toFixed(1) || 'N/A',
              unit: '°C',
              label: 'Temperature',
            }}
            secondaryMetrics={[
              { label: 'Humidity', value: weatherData?.humidity?.toFixed(1) || 'N/A', unit: '%' },
              { label: 'Pressure', value: weatherData?.pressure?.toFixed(1) || 'N/A', unit: 'hPa' },
              { label: 'Altitude', value: weatherData?.altitude?.toFixed(1) || 'N/A', unit: 'm' },
            ]}
            status={getWeatherStatus()}
            onClick={() => setExpandedCard('weather')}
            isExpanded={expandedCard === 'weather'}
          />

          <SystemCard
            title="Air & Noise Quality"
            icon="🌬️"
            primaryMetric={{
              value: airQualityData?.noise_level?.toFixed(1) || 'N/A',
              unit: 'dB',
              label: 'Noise Level',
            }}
            secondaryMetrics={[
              { label: 'PM2.5', value: airQualityData?.pm25?.toFixed(1) || 'N/A', unit: 'µg/m³' },
              { label: 'PM10', value: airQualityData?.pm10?.toFixed(1) || 'N/A', unit: 'µg/m³' },
              { label: 'CO2', value: airQualityData?.co2?.toFixed(0) || 'N/A', unit: 'ppm' },
            ]}
            status={getAirQualityStatus()}
            onClick={() => setExpandedCard('air')}
            isExpanded={expandedCard === 'air'}
          />

          <SystemCard
            title="Water Quality"
            icon="💧"
            primaryMetric={{
              value: waterQualityData?.ph_level?.toFixed(1) || 'N/A',
              unit: '',
              label: 'pH Level',
            }}
            secondaryMetrics={[
              { label: 'TDS', value: waterQualityData?.tds?.toFixed(1) || 'N/A', unit: 'ppm' },
              { label: 'Turbidity', value: waterQualityData?.turbidity?.toFixed(1) || 'N/A', unit: 'NTU' },
              { label: 'Conductivity', value: waterQualityData?.conductivity?.toFixed(1) || 'N/A', unit: 'µS/cm' },
            ]}
            status={getWaterQualityStatus()}
            onClick={() => setExpandedCard('water')}
            isExpanded={expandedCard === 'water'}
          />
        </div>
      </main>

      {expandedCard && (
        <ExpandedCard
          type={expandedCard}
          data={
            expandedCard === 'weather' ? weatherData :
            expandedCard === 'air' ? airQualityData :
            waterQualityData
          }
          history={
            expandedCard === 'weather' ? weatherHistory :
            expandedCard === 'air' ? airHistory :
            waterHistory
          }
          onClose={() => setExpandedCard(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
