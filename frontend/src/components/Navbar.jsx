import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { TreeIcon, SunIcon, MoonIcon, MenuIcon, CloseIcon, PlusIcon, UserIcon } from './Icons';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Close menus on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside to close user menu
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/" aria-label="Beranda Silsilah Keluarga">
          <span className="brand-icon-wrapper">
            <TreeIcon size={20} />
          </span>
          <span>Silsilah Keluarga</span>
        </Link>
      </div>

      <nav className="navbar-links" aria-label="Navigasi Utama">
        <Link
          to="/tree"
          className={`nav-link ${location.pathname === '/tree' ? 'active' : ''}`}
        >
          Pohon Silsilah
        </Link>
        {user ? (
          <Link
            to="/dashboard"
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Daftar Anggota
          </Link>
        ) : null}
      </nav>

      <div className="navbar-actions">
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}
          title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
        >
          {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
        </button>

        {user ? (
          <div className="user-menu-wrapper" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(prev => !prev)}
              className="user-menu-trigger"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <UserIcon size={16} />
              <span>{user.name}</span>
              {user.role === 'admin' && <span className="role-badge">Admin</span>}
            </button>

            {userMenuOpen && (
              <div className="dropdown-menu" role="menu">
                <Link to="/members/new" className="dropdown-item" role="menuitem">
                  <PlusIcon size={16} />
                  <span>Tambah Anggota</span>
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout" role="menuitem">
                  <span>Keluar Akun</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Masuk Akun
          </Link>
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="mobile-nav-toggle"
          aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav className="mobile-nav-drawer" aria-label="Navigasi Mobile">
          <Link to="/tree" className="nav-link">
            Pohon Silsilah
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Daftar Anggota
              </Link>
              <Link to="/members/new" className="nav-link">
                + Tambah Anggota
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
                Keluar ({user.name})
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: '8px' }}>
              Masuk Akun
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
