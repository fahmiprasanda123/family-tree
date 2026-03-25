import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { membersAPI } from '../api/client';
import useAuthStore from '../store/authStore';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await membersAPI.list();
      setMembers(res.data.data || []);
    } catch {
      setError('Gagal memuat data anggota');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus ${name}? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await membersAPI.delete(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch {
      alert('Gagal menghapus anggota');
    }
  };

  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (m.nickname || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page dashboard">
      <div className="page-header">
        <div>
          <h1>Anggota Keluarga</h1>
          <p>Total {members.length} anggota terdaftar</p>
        </div>
        <Link to="/members/new" className="btn btn-primary">+ Tambah Anggota</Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Cari anggota..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Memuat data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍👩‍👧‍👦</div>
          <h3>{search ? 'Tidak ada hasil' : 'Belum ada anggota'}</h3>
          <p>{search ? 'Coba kata kunci lain' : 'Mulai dengan menambahkan anggota keluarga pertama'}</p>
          {!search && <Link to="/members/new" className="btn btn-primary">Tambah Anggota Pertama</Link>}
        </div>
      ) : (
        <div className="members-grid">
          {filtered.map((m) => (
            <div key={m.id} className="member-card">
              <div className="member-photo">
                {m.photo_url ? (
                  <img src={m.photo_url} alt={m.full_name} />
                ) : (
                  <div className="photo-placeholder">
                    {m.gender === 'female' ? '👩' : '👨'}
                  </div>
                )}
                {!m.is_alive && <span className="deceased-badge">Alm.</span>}
              </div>
              <div className="member-info">
                <h3>{m.full_name}</h3>
                {m.nickname && <p className="nickname">"{m.nickname}"</p>}
                {m.occupation && <p className="occupation">💼 {m.occupation}</p>}
                {m.birth_date && <p className="birthdate">🎂 {formatDate(m.birth_date)}</p>}
                {m.birth_place && <p className="birthplace">📍 {m.birth_place}</p>}
              </div>
              <div className="member-actions">
                <Link to={`/members/${m.id}`} className="btn btn-sm btn-ghost">Lihat</Link>
                <Link to={`/members/${m.id}/edit`} className="btn btn-sm btn-secondary">Edit</Link>
                {isAdmin && (
                  <button onClick={() => handleDelete(m.id, m.full_name)} className="btn btn-sm btn-danger">Hapus</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
