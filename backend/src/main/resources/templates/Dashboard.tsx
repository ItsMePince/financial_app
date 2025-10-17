import { api } from "../api";
 import React, { useState, useEffect } from 'react';

// Types for API responses
interface User {
  username: string;
  role: string;
}

interface Profile {
  name: string;
  email: string;
  role: string;
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  revenue: number;
  activeUsers: number;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileResponse = await fetch('http://localhost:8080/api/user/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
      }

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:8080/api/dashboard/stats', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹‚à¸«à¸¥à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹„à¸”à¹‰');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear localStorage
      localStorage.removeItem('user');
      
      // Call logout callback
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout even if API call fails
      localStorage.removeItem('user');
      onLogout();
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#C4E7E0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#374151' }}>
          à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#C4E7E0',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '16px 24px',
        marginBottom: '24px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, .08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#111827'
        }}>
          Financial Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: '#374151' }}>
            {user.username} ({user.role})
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            à¸­à¸­à¸à¸ˆà¸²à¸à¸£à¸°à¸šà¸š
          </button>
        </div>
      </header>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Profile Section */}
      {profile && (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, .08)'
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#111827'
          }}>
            à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                à¸Šà¸·à¹ˆà¸­
              </div>
              <div style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                {profile.name}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                à¸­à¸µà¹€à¸¡à¸¥
              </div>
              <div style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                {profile.email}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                à¸šà¸—à¸šà¸²à¸—
              </div>
              <div style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                {profile.role}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px' 
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, .08)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
              {stats.totalUsers.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, .08)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              à¸„à¸³à¸ªà¸±à¹ˆà¸‡à¸‹à¸·à¹‰à¸­à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
              {stats.totalOrders.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, .08)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              à¸£à¸²à¸¢à¹„à¸”à¹‰
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
              à¸¿{stats.revenue.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, .08)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸—à¸µà¹ˆà¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¸­à¸¢à¸¹à¹ˆ
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>
              {stats.activeUsers.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

.Value + $prefix + "`r`n" 
// Types for API responses
interface User {
  username: string;
  role: string;
}

interface Profile {
  name: string;
  email: string;
  role: string;
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  revenue: number;
  activeUsers: number;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileResponse = await fetch('http://localhost:8080/api/user/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
      }

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:8080/api/dashboard/stats', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹‚à¸«à¸¥à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹„à¸”à¹‰');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear localStorage
      localStorage.removeItem('user');
      
      // Call logout callback
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout even if API call fails
      localStorage.removeItem('user');
      onLogout();
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#C4E7E0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#374151' }}>
          à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#C4E7E0',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '16px 24px',
        marginBottom: '24px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, .08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#111827'
        }}>
          Financial Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: '#374151' }}>
            {user.username} ({user.role})
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            à¸­à¸­à¸à¸ˆà¸²à¸à¸£à¸°à¸šà¸š
          </button>
        </div>
      </header>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Profile Section */}
      {profile && (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, .08)'
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#111827'
          }}>
            à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                à¸Šà¸·à¹ˆà¸­
              </div>
              <div style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                {profile.name}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                à¸­à¸µà¹€à¸¡à¸¥
              </div>
              <div style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                {profile.email}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                à¸šà¸—à¸šà¸²à¸—
              </div>
              <div style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                {profile.role}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px' 
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, .08)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
              {stats.totalUsers.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, .08)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              à¸„à¸³à¸ªà¸±à¹ˆà¸‡à¸‹à¸·à¹‰à¸­à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
              {stats.totalOrders.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, .08)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              à¸£à¸²à¸¢à¹„à¸”à¹‰
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
              à¸¿{stats.revenue.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, .08)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸—à¸µà¹ˆà¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¸­à¸¢à¸¹à¹ˆ
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>
              {stats.activeUsers.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;




