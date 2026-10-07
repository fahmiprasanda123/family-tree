import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import useAuthStore from '../store/authStore';
import { TreeIcon, ArrowLeftIcon } from '../components/Icons';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { user, token } = res.data;
      setAuth(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Kombinasi email dan kata sandi belum sesuai.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div style={{ marginBottom: '16px' }}>
          <Link to="/" className="btn btn-ghost btn-sm">
            <ArrowLeftIcon size={16} />
            <span>Beranda</span>
          </Link>
        </div>

        <div className="auth-card-header">
          <div className="auth-brand-mark">
            <TreeIcon size={26} />
          </div>
          <h1>Masuk ke Akun</h1>
          <p>Akses arsip silsilah dan data keluarga Anda</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Kata Sandi</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Memeriksa Kredensial...' : 'Masuk ke Sistem'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Belum memiliki akun? <Link to="/register">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
