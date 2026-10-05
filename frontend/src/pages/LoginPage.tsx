import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, Mail, KeyRound, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useToast } from '../components/common/Toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('librarian@shelflife.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/books';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await api.login({ email, password });
      if (response.success && response.data) {
        login(response.data.token, response.data.user);
        showToast('Welcome back, Librarian!', 'success', 'Login Successful');
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Login failed. Please check credentials.';
      setErrorMsg(msg);
      showToast(msg, 'error', 'Authentication Error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('librarian@shelflife.com');
    setPassword('password123');
  };

  return (
    <div className="login-page-container">
      <div className="login-card glass-panel shadow-2xl">
        <div className="login-header text-center">
          <div className="login-icon-badge">
            <Lock size={32} />
          </div>
          <h2 className="login-title">Librarian Portal</h2>
          <p className="login-subtitle">Sign in to manage ShelfLife library resources</p>
        </div>

        {errorMsg && (
          <div className="alert-box alert-error mb-4">
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                required
                className="form-input"
                placeholder="librarian@shelflife.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label">Password</label>
            <div className="input-group">
              <KeyRound className="input-icon" size={18} />
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block py-3 shadow-glow"
          >
            {loading ? (
              <span className="spinner-inline"></span>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleFillDemo}
            className="btn btn-outline btn-block mt-3 py-2 text-xs"
          >
            Fill Demo Credentials
          </button>
        </form>

        <div className="login-footer text-center mt-6">
          <p className="text-muted text-xs">
            Demo Credentials: <code>librarian@shelflife.com</code> / <code>password123</code>
          </p>
        </div>
      </div>
    </div>
  );
};
