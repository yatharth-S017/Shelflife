import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, History, PlusCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-brand">
          <BookOpen className="brand-icon" size={28} />
          <span className="brand-text">ShelfLife</span>
        </NavLink>

        {isAuthenticated && (
          <nav className="navbar-nav">
            <NavLink
              to="/books"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              <span>Book Catalog</span>
            </NavLink>

            <NavLink
              to="/issue"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <PlusCircle size={18} />
              <span>Issue Book</span>
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <History size={18} />
              <span>Member History</span>
            </NavLink>
          </nav>
        )}

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-profile-widget">
              <div className="avatar-chip">
                <UserCheck size={16} />
                <span>{user?.name || 'Librarian'}</span>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Logout">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn-login-nav">
              Librarian Login
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};
