import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="navbar-icon">🌳</span>
          <span className="navbar-title">Silsilah Keluarga</span>
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/tree" className="nav-link">Pohon Keluarga</Link>
        <Link to="/dashboard" className="nav-link">Anggota</Link>
      </div>

      <div className="navbar-actions">
        {user ? (
          <div className="user-menu">
            <span className="user-name">
              {user.role === 'admin' && <span className="admin-badge">Admin</span>}
              {user.name}
            </span>
            <div className="user-dropdown">
              <Link to="/members/new" className="dropdown-item">+ Tambah Anggota</Link>
              <button onClick={handleLogout} className="dropdown-item logout-btn">Keluar</button>
            </div>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="btn btn-primary">Masuk</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
