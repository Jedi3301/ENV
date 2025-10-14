import React, { useState, useEffect } from 'react';
import {
  getWeatherHistory,
  getAirQualityHistory,
  getWaterQualityHistory,
  updateWeatherData,
  updateAirQualityData,
  updateWaterQualityData,
  deleteWeatherData,
  deleteAirQualityData,
  deleteWaterQualityData,
  insertWeatherData,
  insertAirQualityData,
  insertWaterQualityData,
} from '../../services/dataService';
import '../../styles/admin.css';

const DataEditor = () => {
  const [activeTab, setActiveTab] = useState('weather');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    let result;
    
    switch (activeTab) {
      case 'weather':
        result = await getWeatherHistory(50);
        break;
      case 'air':
        result = await getAirQualityHistory(50);
        break;
      case 'water':
        result = await getWaterQualityHistory(50);
        break;
      default:
        result = { data: [] };
    }
    
    setData(result.data || []);
    setLoading(false);
  };

  const handleUpdate = async (id, updates) => {
    let result;
    
    switch (activeTab) {
      case 'weather':
        result = await updateWeatherData(id, updates);
        break;
      case 'air':
        result = await updateAirQualityData(id, updates);
        break;
      case 'water':
        result = await updateWaterQualityData(id, updates);
        break;
      default:
        return;
    }
    
    if (result.error) {
      alert('Failed to update: ' + result.error);
    } else {
      alert('Data updated successfully!');
      setEditingItem(null);
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }
    
    let result;
    
    switch (activeTab) {
      case 'weather':
        result = await deleteWeatherData(id);
        break;
      case 'air':
        result = await deleteAirQualityData(id);
        break;
      case 'water':
        result = await deleteWaterQualityData(id);
        break;
      default:
        return;
    }
    
    if (result.error) {
      alert('Failed to delete: ' + result.error);
    } else {
      alert('Data deleted successfully!');
      fetchData();
    }
  };

  const handleAdd = async (newData) => {
    let result;
    
    switch (activeTab) {
      case 'weather':
        result = await insertWeatherData(newData);
        break;
      case 'air':
        result = await insertAirQualityData(newData);
        break;
      case 'water':
        result = await insertWaterQualityData(newData);
        break;
      default:
        return;
    }
    
    if (result.error) {
      alert('Failed to add: ' + result.error);
    } else {
      alert('Data added successfully!');
      setShowAddForm(false);
      fetchData();
    }
  };

  const renderWeatherTable = () => (
    <table className="sensor-data-table">
      <thead>
        <tr>
          <th>🌡️ Temperature</th>
          <th>💧 Humidity</th>
          <th>🎚️ Pressure</th>
          <th>⛰️ Altitude</th>
          <th>🕐 Timestamp</th>
          <th>⚙️ Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td><span className="data-value">{item.temperature_dht?.toFixed(1)}°C</span></td>
            <td><span className="data-value">{item.humidity?.toFixed(1)}%</span></td>
            <td><span className="data-value">{item.pressure?.toFixed(1)} hPa</span></td>
            <td><span className="data-value">{item.altitude?.toFixed(1)} m</span></td>
            <td className="timestamp-cell">{new Date(item.timestamp).toLocaleString()}</td>
            <td className="action-cell">
              <button
                onClick={() => setEditingItem(item)}
                className="btn-edit"
                title="Edit record"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="btn-delete"
                title="Delete record"
              >
                🗑️
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderAirQualityTable = () => (
    <table className="sensor-data-table">
      <thead>
        <tr>
          <th>🔊 Noise</th>
          <th>🌫️ PM2.5</th>
          <th>🌫️ PM10</th>
          <th>💨 CO2</th>
          <th>☁️ CO</th>
          <th>🕐 Timestamp</th>
          <th>⚙️ Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td><span className="data-value">{item.noise_level?.toFixed(1)} dB</span></td>
            <td><span className="data-value">{item.pm25?.toFixed(1)}</span></td>
            <td><span className="data-value">{item.pm10?.toFixed(1)}</span></td>
            <td><span className="data-value">{item.co2?.toFixed(0)} ppm</span></td>
            <td><span className="data-value">{item.co?.toFixed(0)} ppm</span></td>
            <td className="timestamp-cell">{new Date(item.timestamp).toLocaleString()}</td>
            <td className="action-cell">
              <button
                onClick={() => setEditingItem(item)}
                className="btn-edit"
                title="Edit record"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="btn-delete"
                title="Delete record"
              >
                🗑️
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderWaterQualityTable = () => (
    <table className="sensor-data-table">
      <thead>
        <tr>
          <th>💧 TDS</th>
          <th>🌊 Turbidity</th>
          <th>⚗️ pH Level</th>
          <th>⚡ Conductivity</th>
          <th>🕐 Timestamp</th>
          <th>⚙️ Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td><span className="data-value">{item.tds?.toFixed(1)} ppm</span></td>
            <td><span className="data-value">{item.turbidity?.toFixed(1)} NTU</span></td>
            <td><span className="data-value">{item.ph_level?.toFixed(1)}</span></td>
            <td><span className="data-value">{item.conductivity?.toFixed(1)} µS/cm</span></td>
            <td className="timestamp-cell">{new Date(item.timestamp).toLocaleString()}</td>
            <td className="action-cell">
              <button
                onClick={() => setEditingItem(item)}
                className="btn-edit"
                title="Edit record"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="btn-delete"
                title="Delete record"
              >
                🗑️
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="admin-section">
      <div className="section-header">
        <div className="admin-title-section">
          <h2>📊 Sensor Data Management</h2>
          <p className="subtitle">View, edit, and manage all sensor readings</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-add"
          >
            + Add Record
          </button>
          <button
            onClick={fetchData}
            className="btn-refresh"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="data-tabs">
        <button
          className={`data-tab ${activeTab === 'weather' ? 'active' : ''}`}
          onClick={() => setActiveTab('weather')}
        >
          <span className="tab-icon">🌤️</span>
          <span className="tab-label">Weather</span>
        </button>
        <button
          className={`data-tab ${activeTab === 'air' ? 'active' : ''}`}
          onClick={() => setActiveTab('air')}
        >
          <span className="tab-icon">💨</span>
          <span className="tab-label">Air Quality</span>
        </button>
        <button
          className={`data-tab ${activeTab === 'water' ? 'active' : ''}`}
          onClick={() => setActiveTab('water')}
        >
          <span className="tab-icon">💧</span>
          <span className="tab-label">Water Quality</span>
        </button>
      </div>

      <div className="data-table-wrapper">
        {loading ? (
          <div className="loading">Loading data...</div>
        ) : data.length === 0 ? (
          <div className="no-data">No data available</div>
        ) : (
          <>
            {activeTab === 'weather' && renderWeatherTable()}
            {activeTab === 'air' && renderAirQualityTable()}
            {activeTab === 'water' && renderWaterQualityTable()}
          </>
        )}
      </div>

      {editingItem && (
        <EditModal
          item={editingItem}
          type={activeTab}
          onSave={handleUpdate}
          onClose={() => setEditingItem(null)}
        />
      )}

      {showAddForm && (
        <AddModal
          type={activeTab}
          onSave={handleAdd}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

// Edit Modal Component
const EditModal = ({ item, type, onSave, onClose }) => {
  const [formData, setFormData] = useState({ ...item });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item.id, formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Edit {type.charAt(0).toUpperCase() + type.slice(1)} Data</h3>
        <form onSubmit={handleSubmit}>
          {type === 'weather' && (
            <>
              <input
                type="number"
                step="0.1"
                placeholder="Temperature"
                value={formData.temperature_dht || ''}
                onChange={(e) => setFormData({ ...formData, temperature_dht: parseFloat(e.target.value) })}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Humidity"
                value={formData.humidity || ''}
                onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) })}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Pressure"
                value={formData.pressure || ''}
                onChange={(e) => setFormData({ ...formData, pressure: parseFloat(e.target.value) })}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Altitude"
                value={formData.altitude || ''}
                onChange={(e) => setFormData({ ...formData, altitude: parseFloat(e.target.value) })}
              />
            </>
          )}
          <div className="modal-actions">
            <button type="submit" className="btn-save">Save</button>
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Modal Component
const AddModal = ({ type, onSave, onClose }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Add New {type.charAt(0).toUpperCase() + type.slice(1)} Data</h3>
        <form onSubmit={handleSubmit}>
          {type === 'weather' && (
            <>
              <input
                type="number"
                step="0.1"
                placeholder="Temperature (°C)"
                onChange={(e) => setFormData({ ...formData, temperature_dht: parseFloat(e.target.value) })}
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="Humidity (%)"
                onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) })}
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="Pressure (hPa)"
                onChange={(e) => setFormData({ ...formData, pressure: parseFloat(e.target.value) })}
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="Altitude (m)"
                onChange={(e) => setFormData({ ...formData, altitude: parseFloat(e.target.value) })}
                required
              />
            </>
          )}
          {type === 'air' && (
            <>
              <input
                type="number"
                step="0.1"
                placeholder="Noise Level (dB)"
                onChange={(e) => setFormData({ ...formData, noise_level: parseFloat(e.target.value) })}
                required
              />
              <input
                type="text"
                placeholder="NQI (e.g., Low, Medium, High)"
                onChange={(e) => setFormData({ ...formData, nqi: e.target.value })}
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="PM2.5 (µg/m³)"
                onChange={(e) => setFormData({ ...formData, pm25: parseFloat(e.target.value) })}
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="PM10 (µg/m³)"
                onChange={(e) => setFormData({ ...formData, pm10: parseFloat(e.target.value) })}
                required
              />
              <input
                type="number"
                step="1"
                placeholder="CO2 (ppm)"
                onChange={(e) => setFormData({ ...formData, co2: parseFloat(e.target.value) })}
                required
              />
              <input
                type="number"
                step="1"
                placeholder="CO (ppm)"
                onChange={(e) => setFormData({ ...formData, co: parseFloat(e.target.value) })}
                required
              />
              <input
                type="number"
                step="1"
                placeholder="MQ7 Value"
                onChange={(e) => setFormData({ ...formData, mq7: parseInt(e.target.value) })}
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="Smoke Level"
                onChange={(e) => setFormData({ ...formData, smoke: parseFloat(e.target.value) })}
                required
              />
            </>
          )}
          {type === 'water' && (
            <>
              <input
                type="number"
                step="0.1"
                placeholder="TDS (ppm)"
                onChange={(e) => setFormData({ ...formData, tds: parseFloat(e.target.value) })}
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="Turbidity (NTU)"
                onChange={(e) => setFormData({ ...formData, turbidity: parseFloat(e.target.value) })}
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="pH Level (0-14)"
                onChange={(e) => setFormData({ ...formData, ph_level: parseFloat(e.target.value) })}
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="Conductivity (µS/cm)"
                onChange={(e) => setFormData({ ...formData, conductivity: parseFloat(e.target.value) })}
                required
              />
            </>
          )}
          <div className="modal-actions">
            <button type="submit" className="btn-save">Add</button>
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DataEditor;
