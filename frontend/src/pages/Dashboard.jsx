import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { membersAPI } from '../api/client';
import useAuthStore from '../store/authStore';
import Avatar from '../components/Avatar';
import {
  SearchIcon,
  PlusIcon,
  UsersIcon,
  BriefcaseIcon,
  CalendarIcon,
  LocationIcon,
  EditIcon,
  TrashIcon,
} from '../components/Icons';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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
      setError('Gagal memuat data anggota keluarga. Silakan segarkan halaman.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus data ${name}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await membersAPI.delete(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch {
      alert('Gagal menghapus data anggota');
    }
  };

  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (m.nickname || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <div>
          <h1>Daftar Anggota Keluarga</h1>
          <p>Tercatat {members.length} anggota keluarga dalam arsip silsilah</p>
        </div>
        <Link to="/members/new" className="btn btn-primary">
          <PlusIcon size={18} />
          <span>Tambah Anggota</span>
        </Link>
      </div>

      <div className="search-bar">
        <span className="search-icon-wrapper">
          <SearchIcon size={18} />
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="Cari berdasarkan nama atau panggilan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Cari nama anggota keluarga"
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Memuat daftar anggota keluarga...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <UsersIcon size={28} />
          </div>
          <h3>{search ? 'Anggota Tidak Ditemukan' : 'Belum Ada Anggota Terdaftar'}</h3>
          <p>
            {search
              ? `Tidak ditemukan anggota dengan kata kunci "${search}". Silakan periksa ejaan nama.`
              : 'Mulai dokumentasi silsilah dengan mencatat data anggota keluarga generasi pertama (kakek/buyut).'}
          </p>
          {!search && (
            <Link to="/members/new" className="btn btn-primary">
              <PlusIcon size={18} />
              <span>Tambah Anggota Pertama</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="members-grid">
          {filtered.map((m) => (
            <article key={m.id} className="member-card">
              <div className="member-card-photo">
                {m.photo_url ? (
                  <img src={m.photo_url} alt={`Foto profil ${m.full_name}`} />
                ) : (
                  <Avatar name={m.full_name} gender={m.gender} size="xl" />
                )}
                {!m.is_alive && <span className="deceased-tag">Almarhum/ah</span>}
              </div>

              <div className="member-card-body">
                <h2 className="member-card-name">{m.full_name}</h2>
                {m.nickname && (
                  <p className="member-card-nickname">Panggilan: {m.nickname}</p>
                )}

                {m.occupation && (
                  <div className="meta-line">
                    <BriefcaseIcon size={15} />
                    <span>{m.occupation}</span>
                  </div>
                )}
                {m.birth_date && (
                  <div className="meta-line">
                    <CalendarIcon size={15} />
                    <span>Lahir: {formatDate(m.birth_date)}</span>
                  </div>
                )}
                {m.birth_place && (
                  <div className="meta-line">
                    <LocationIcon size={15} />
                    <span>Asal: {m.birth_place}</span>
                  </div>
                )}
              </div>

              <div className="member-card-actions">
                <Link to={`/members/${m.id}`} className="btn btn-sm btn-ghost" style={{ flex: 1 }}>
                  Lihat Profil
                </Link>
                <Link to={`/members/${m.id}/edit`} className="btn btn-sm btn-secondary" aria-label={`Ubah profil ${m.full_name}`}>
                  <EditIcon size={15} />
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(m.id, m.full_name)}
                    className="btn btn-sm btn-danger"
                    aria-label={`Hapus data ${m.full_name}`}
                  >
                    <TrashIcon size={15} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
