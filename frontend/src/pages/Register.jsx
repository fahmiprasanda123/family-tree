import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import useAuthStore from '../store/authStore';
import { TreeIcon, ArrowLeftIcon } from '../components/Icons';

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      const { user, token } = res.data;
      setAuth(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Pendaftaran belum berhasil. Silakan coba kembali.');
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
          <h1>Buat Akun Keluarga</h1>
          <p>Mulai mendata dan mengabadikan sejarah garis keturunan</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="alert" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', borderColor: 'var(--primary-light)' }}>
          <span>Catatan: Pendaftar pertama dalam sistem akan otomatis menjadi Administrator.</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              placeholder="Nama lengkap Anda"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

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
            <label htmlFor="password">Kata Sandi (Minimal 6 karakter)</label>
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
            {loading ? 'Mendaftarkan Akun...' : 'Daftarkan Akun'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Sudah memiliki akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
