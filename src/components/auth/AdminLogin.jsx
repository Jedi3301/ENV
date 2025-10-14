import React, { useState } from 'react';
import { signIn, isAdmin } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import '../../styles/auth.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    if (data?.user) {
      // Check if user is admin
      const adminStatus = await isAdmin(data.user.id);
      
      if (!adminStatus) {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      // Navigate to admin panel
      navigate('/admin');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container admin-container">
      <div className="auth-card admin-card">
        <div className="auth-header admin-header">
          <div className="admin-badge">🔒 ADMIN ACCESS</div>
          <h1>Environmental Monitoring System</h1>
          <h2>Administrator Login</h2>
        </div>

        <form onSubmit={handleAdminLogin} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Admin Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-admin" disabled={loading}>
            {loading ? 'Verifying...' : 'Admin Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p><a href="/login">← Back to User Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
