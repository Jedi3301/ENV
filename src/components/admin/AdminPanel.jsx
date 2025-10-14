import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, getCurrentUser, isAdmin } from '../../services/authService';
import UserList from './UserList';
import DataEditor from './DataEditor';
import DeviceMonitor from './DeviceMonitor';
import '../../styles/admin.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('devices');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { user } = await getCurrentUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    const adminStatus = await isAdmin(user.id);
    
    if (!adminStatus) {
      alert('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }

    setUser(user);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Verifying admin access...</div>
      </div>
    );
  }
  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title-section">
            <h1>🔧 Admin Panel</h1>
            <span className="admin-badge">ADMIN</span>
          </div>
          <div className="header-actions">
            <button onClick={goToDashboard} className="btn-dashboard">
              📊 View Dashboard
            </button>
            <span className="user-info">
              {user?.email}
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-main">
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveTab('devices')}
          >
            <span className="tab-icon">📡</span>
            <span className="tab-text">Device Status</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="tab-icon">👥</span>
            <span className="tab-text">User Management</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-text">Data Management</span>
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'devices' && <DeviceMonitor />}
          {activeTab === 'users' && <UserList />}
          {activeTab === 'data' && <DataEditor />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
