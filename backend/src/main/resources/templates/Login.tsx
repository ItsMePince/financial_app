import { api } from "../api";
 import React, { useState } from "react";
import "./Login.css";

// Types for API responses
interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    username: string;
    role: string;
  };
}

interface LoginProps {
  onLoginSuccess?: (user: { username: string; role: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // à¸ªà¸³à¸«à¸£à¸±à¸š cookies/session
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();
      
      if (data.success && data.user) {
        // à¹€à¸à¹‡à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥ user à¹ƒà¸™ localStorage à¸ªà¸³à¸«à¸£à¸±à¸šà¹ƒà¸Šà¹‰à¹ƒà¸™à¸«à¸™à¹‰à¸²à¸­à¸·à¹ˆà¸™
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // à¹€à¸£à¸µà¸¢à¸ callback function à¸–à¹‰à¸²à¸¡à¸µ
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        } else {
          // à¸«à¸£à¸·à¸­ redirect à¹„à¸›à¸«à¸™à¹‰à¸² home
          window.location.href = '/home';
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('à¹€à¸Šà¸·à¹ˆà¸­à¸¡à¸•à¹ˆà¸­à¹€à¸‹à¸´à¸£à¹Œà¸Ÿà¹€à¸§à¸­à¸£à¹Œà¹„à¸¡à¹ˆà¹„à¸”à¹‰ à¸à¸£à¸¸à¸“à¸²à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆà¸­à¸µà¸à¸„à¸£à¸±à¹‰à¸‡');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card">
        <div className="avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="42" height="42" role="img" aria-label="user">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20a8 8 0 0116 0" />
          </svg>
        </div>

        <h1 className="title">login</h1>

        <form className="form" onSubmit={onSubmit}>
          <label className="label">
            Username
            <input
              type="text"
              className="input"
              placeholder="user à¸«à¸£à¸·à¸­ admin"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label className="label">
            Password
            <input
              type="password"
              className="input"
              placeholder="password à¸«à¸£à¸·à¸­ admin"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          {error && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '14px', 
              textAlign: 'center',
              margin: '8px 0'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'à¸à¸³à¸¥à¸±à¸‡à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š...' : 'login'}
          </button>
        </form>

        <div style={{ 
          fontSize: '12px', 
          color: '#6b7280', 
          marginTop: '12px',
          textAlign: 'center'
        }}>
          <div>à¸—à¸”à¸ªà¸­à¸š: user / password</div>
          <div>à¹à¸­à¸”à¸¡à¸´à¸™: admin / admin</div>
        </div>

        <p className="footnote">
          Don't have an account?
          <a className="link" href="#signup" onClick={(e) => e.preventDefault()}>
            {" "}Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

.Value + $prefix + "`r`n" import "./Login.css";

// Types for API responses
interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    username: string;
    role: string;
  };
}

interface LoginProps {
  onLoginSuccess?: (user: { username: string; role: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // à¸ªà¸³à¸«à¸£à¸±à¸š cookies/session
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();
      
      if (data.success && data.user) {
        // à¹€à¸à¹‡à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥ user à¹ƒà¸™ localStorage à¸ªà¸³à¸«à¸£à¸±à¸šà¹ƒà¸Šà¹‰à¹ƒà¸™à¸«à¸™à¹‰à¸²à¸­à¸·à¹ˆà¸™
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // à¹€à¸£à¸µà¸¢à¸ callback function à¸–à¹‰à¸²à¸¡à¸µ
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        } else {
          // à¸«à¸£à¸·à¸­ redirect à¹„à¸›à¸«à¸™à¹‰à¸² home
          window.location.href = '/home';
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('à¹€à¸Šà¸·à¹ˆà¸­à¸¡à¸•à¹ˆà¸­à¹€à¸‹à¸´à¸£à¹Œà¸Ÿà¹€à¸§à¸­à¸£à¹Œà¹„à¸¡à¹ˆà¹„à¸”à¹‰ à¸à¸£à¸¸à¸“à¸²à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆà¸­à¸µà¸à¸„à¸£à¸±à¹‰à¸‡');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card">
        <div className="avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="42" height="42" role="img" aria-label="user">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20a8 8 0 0116 0" />
          </svg>
        </div>

        <h1 className="title">login</h1>

        <form className="form" onSubmit={onSubmit}>
          <label className="label">
            Username
            <input
              type="text"
              className="input"
              placeholder="user à¸«à¸£à¸·à¸­ admin"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label className="label">
            Password
            <input
              type="password"
              className="input"
              placeholder="password à¸«à¸£à¸·à¸­ admin"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          {error && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '14px', 
              textAlign: 'center',
              margin: '8px 0'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'à¸à¸³à¸¥à¸±à¸‡à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š...' : 'login'}
          </button>
        </form>

        <div style={{ 
          fontSize: '12px', 
          color: '#6b7280', 
          marginTop: '12px',
          textAlign: 'center'
        }}>
          <div>à¸—à¸”à¸ªà¸­à¸š: user / password</div>
          <div>à¹à¸­à¸”à¸¡à¸´à¸™: admin / admin</div>
        </div>

        <p className="footnote">
          Don't have an account?
          <a className="link" href="#signup" onClick={(e) => e.preventDefault()}>
            {" "}Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;




