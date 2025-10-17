import { api } from "../api";
 import React, { useState, ChangeEvent, FormEvent } from "react";
import { UserRound } from "lucide-react";
import "./SignUp.css";

type SignUpValues = {
  email: string;
  username: string;
  password: string;
};

interface SignUpResponse {
  success: boolean;
  message: string;
  user?: {
    username: string;
    email: string;
    role: string;
  };
}

interface SignUpProps {
  onSubmit?: (values: SignUpValues) => void;
  onSignUpSuccess?: (user: any) => void;
  onSwitchToLogin?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSubmit, onSignUpSuccess, onSwitchToLogin }) => {
  const [form, setForm] = useState<SignUpValues>({
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.email || !form.username || !form.password) {
      setError("à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹ƒà¸«à¹‰à¸„à¸£à¸šà¸–à¹‰à¸§à¸™");
      return;
    }

    if (form.password.length < 6) {
      setError("à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™à¸•à¹‰à¸­à¸‡à¸¡à¸µà¸­à¸¢à¹ˆà¸²à¸‡à¸™à¹‰à¸­à¸¢ 6 à¸•à¸±à¸§à¸­à¸±à¸à¸©à¸£");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Since your backend doesn't have signup endpoint yet, 
      // we'll simulate it or call the custom onSubmit function
      if (onSubmit) {
        onSubmit(form);
        return;
      }

      // If you want to add signup to your backend, you would call:
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
        }),
      });

      const data: SignUpResponse = await response.json();
      
      if (data.success && data.user) {
        // Store user data
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call success callback
        if (onSignUpSuccess) {
          onSignUpSuccess(data.user);
        } else {
          // Or redirect to dashboard
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.message || 'à¸à¸²à¸£à¸ªà¸¡à¸±à¸„à¸£à¸ªà¸¡à¸²à¸Šà¸´à¸à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('à¹€à¸Šà¸·à¹ˆà¸­à¸¡à¸•à¹ˆà¸­à¹€à¸‹à¸´à¸£à¹Œà¸Ÿà¹€à¸§à¸­à¸£à¹Œà¹„à¸¡à¹ˆà¹„à¸”à¹‰ à¸à¸£à¸¸à¸“à¸²à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆà¸­à¸µà¸à¸„à¸£à¸±à¹‰à¸‡');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="su-page">
      <div className="su-wrapper">
        <div className="su-avatar" aria-hidden="true">
          <UserRound size={36} />
        </div>

        <h1 className="su-title">Sign up</h1>

        <form className="su-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email" className="su-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="su-input"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />

          <label htmlFor="username" className="su-label">
            Username
          </label>
          <input
            id="username"
            name="username"
            className="su-input"
            placeholder="à¸Šà¸·à¹ˆà¸­à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰"
            autoComplete="username"
            required
            value={form.username}
            onChange={handleChange}
            disabled={loading}
          />

          <label htmlFor="password" className="su-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="su-input"
            placeholder="à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™ (à¸­à¸¢à¹ˆà¸²à¸‡à¸™à¹‰à¸­à¸¢ 6 à¸•à¸±à¸§à¸­à¸±à¸à¸©à¸£)"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />

          {error && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '14px', 
              textAlign: 'center',
              margin: '8px 0',
              padding: '8px',
              background: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="su-submit" disabled={loading}>
            {loading ? 'à¸à¸³à¸¥à¸±à¸‡à¸ªà¸¡à¸±à¸„à¸£à¸ªà¸¡à¸²à¸Šà¸´à¸...' : 'Create account'}
          </button>
        </form>

        <p className="su-footer">
          Already have an account?{" "}
          <a 
            className="su-link" 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (onSwitchToLogin) {
                onSwitchToLogin();
              }
            }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

.Value + $prefix + "`r`n" import { UserRound } from "lucide-react";
import "./SignUp.css";

type SignUpValues = {
  email: string;
  username: string;
  password: string;
};

interface SignUpResponse {
  success: boolean;
  message: string;
  user?: {
    username: string;
    email: string;
    role: string;
  };
}

interface SignUpProps {
  onSubmit?: (values: SignUpValues) => void;
  onSignUpSuccess?: (user: any) => void;
  onSwitchToLogin?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSubmit, onSignUpSuccess, onSwitchToLogin }) => {
  const [form, setForm] = useState<SignUpValues>({
    email: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.email || !form.username || !form.password) {
      setError("à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹ƒà¸«à¹‰à¸„à¸£à¸šà¸–à¹‰à¸§à¸™");
      return;
    }

    if (form.password.length < 6) {
      setError("à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™à¸•à¹‰à¸­à¸‡à¸¡à¸µà¸­à¸¢à¹ˆà¸²à¸‡à¸™à¹‰à¸­à¸¢ 6 à¸•à¸±à¸§à¸­à¸±à¸à¸©à¸£");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Since your backend doesn't have signup endpoint yet, 
      // we'll simulate it or call the custom onSubmit function
      if (onSubmit) {
        onSubmit(form);
        return;
      }

      // If you want to add signup to your backend, you would call:
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
        }),
      });

      const data: SignUpResponse = await response.json();
      
      if (data.success && data.user) {
        // Store user data
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call success callback
        if (onSignUpSuccess) {
          onSignUpSuccess(data.user);
        } else {
          // Or redirect to dashboard
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.message || 'à¸à¸²à¸£à¸ªà¸¡à¸±à¸„à¸£à¸ªà¸¡à¸²à¸Šà¸´à¸à¸¥à¹‰à¸¡à¹€à¸«à¸¥à¸§');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('à¹€à¸Šà¸·à¹ˆà¸­à¸¡à¸•à¹ˆà¸­à¹€à¸‹à¸´à¸£à¹Œà¸Ÿà¹€à¸§à¸­à¸£à¹Œà¹„à¸¡à¹ˆà¹„à¸”à¹‰ à¸à¸£à¸¸à¸“à¸²à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆà¸­à¸µà¸à¸„à¸£à¸±à¹‰à¸‡');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="su-page">
      <div className="su-wrapper">
        <div className="su-avatar" aria-hidden="true">
          <UserRound size={36} />
        </div>

        <h1 className="su-title">Sign up</h1>

        <form className="su-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email" className="su-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="su-input"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />

          <label htmlFor="username" className="su-label">
            Username
          </label>
          <input
            id="username"
            name="username"
            className="su-input"
            placeholder="à¸Šà¸·à¹ˆà¸­à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰"
            autoComplete="username"
            required
            value={form.username}
            onChange={handleChange}
            disabled={loading}
          />

          <label htmlFor="password" className="su-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="su-input"
            placeholder="à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™ (à¸­à¸¢à¹ˆà¸²à¸‡à¸™à¹‰à¸­à¸¢ 6 à¸•à¸±à¸§à¸­à¸±à¸à¸©à¸£)"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />

          {error && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '14px', 
              textAlign: 'center',
              margin: '8px 0',
              padding: '8px',
              background: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="su-submit" disabled={loading}>
            {loading ? 'à¸à¸³à¸¥à¸±à¸‡à¸ªà¸¡à¸±à¸„à¸£à¸ªà¸¡à¸²à¸Šà¸´à¸...' : 'Create account'}
          </button>
        </form>

        <p className="su-footer">
          Already have an account?{" "}
          <a 
            className="su-link" 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (onSwitchToLogin) {
                onSwitchToLogin();
              }
            }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;




