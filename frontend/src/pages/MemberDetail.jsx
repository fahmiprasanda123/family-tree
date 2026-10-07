import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { membersAPI } from '../api/client';
import useAuthStore from '../store/authStore';
import Avatar from '../components/Avatar';
import {
  ArrowLeftIcon,
  EditIcon,
  TrashIcon,
  CalendarIcon,
  LocationIcon,
  BriefcaseIcon,
  PhoneIcon,
  UsersIcon,
} from '../components/Icons';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function MemberDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await membersAPI.get(id);
        setData(res.data);
      } catch {
        setError('Data anggota keluarga tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Hapus data ${data?.data?.full_name}?`)) return;
    try {
      await membersAPI.delete(id);
      navigate('/dashboard');
    } catch {
      alert('Gagal menghapus data anggota keluarga');
    }
  };

  if (loading) {
    return (
      <div className="page loading-container">
        <div className="spinner"></div>
        <p>Memuat profil anggota keluarga...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page">
        <div className="alert alert-error">{error || 'Data tidak ditemukan'}</div>
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          <ArrowLeftIcon size={16} />
          <span>Kembali ke Daftar</span>
        </Link>
      </div>
    );
  }

  const { data: member, parents = [], children = [], spouses = [] } = data;
  const canEdit = isAdmin || user?.id === member.created_by;

  return (
    <div className="page member-detail-page">
      <div style={{ marginBottom: '24px' }}>
        <Link to="/dashboard" className="btn btn-ghost btn-sm">
          <ArrowLeftIcon size={16} />
          <span>Kembali ke Daftar Anggota</span>
        </Link>
      </div>

      <div className="detail-layout">
        {/* Left Column: Photo & Actions */}
        <aside className="detail-sidebar">
          <div className="detail-photo-card">
            <div className="detail-photo-frame">
              {member.photo_url ? (
                <img src={member.photo_url} alt={`Foto ${member.full_name}`} />
              ) : (
                <Avatar name={member.full_name} gender={member.gender} size="xl" />
              )}
            </div>

            <div className="detail-status-bar">
              <span className={`status-chip gender-${member.gender}`}>
                {member.gender === 'female' ? 'Perempuan' : 'Laki-laki'}
              </span>
              {!member.is_alive && (
                <span className="status-chip deceased">
                  Almarhum/ah
                </span>
              )}
            </div>
          </div>

          {canEdit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to={`/members/${id}/edit`} className="btn btn-primary btn-full">
                <EditIcon size={16} />
                <span>Ubah Data Profil</span>
              </Link>
              {isAdmin && (
                <button onClick={handleDelete} className="btn btn-danger btn-full">
                  <TrashIcon size={16} />
                  <span>Hapus Anggota</span>
                </button>
              )}
            </div>
          )}
        </aside>

        {/* Right Column: Full Information */}
        <main className="detail-main">
          <header className="detail-header">
            <h1>{member.full_name}</h1>
            {member.nickname && (
              <p className="detail-nickname">Nama Panggilan: {member.nickname}</p>
            )}
          </header>

          <section className="detail-card">
            <h3>Informasi Pribadi & Kelahiran</h3>
            <div className="detail-data-grid">
              <div className="data-item">
                <span className="data-label">Tanggal Lahir</span>
                <span className="data-value">{formatDate(member.birth_date)}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Tempat Lahir</span>
                <span className="data-value">{member.birth_place || '-'}</span>
              </div>
              {!member.is_alive && (
                <div className="data-item">
                  <span className="data-label">Tanggal Wafat</span>
                  <span className="data-value">{formatDate(member.death_date)}</span>
                </div>
              )}
              <div className="data-item">
                <span className="data-label">Pekerjaan / Profesi</span>
                <span className="data-value">{member.occupation || '-'}</span>
              </div>
              <div className="data-item">
                <span className="data-label">Nomor Kontak</span>
                <span className="data-value">{member.phone || '-'}</span>
              </div>
              <div className="data-item full">
                <span className="data-label">Alamat / Domisili</span>
                <span className="data-value">{member.address || '-'}</span>
              </div>
            </div>
          </section>

          {member.bio && (
            <section className="detail-card">
              <h3>Catatan Riwayat Hidup</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {member.bio}
              </p>
            </section>
          )}

          {/* Relationships */}
          <section className="detail-card">
            <h3>Tali Hubungan Keluarga</h3>

            {spouses.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <span className="data-label" style={{ display: 'block', marginBottom: '8px' }}>
                  Pasangan (Suami / Istri)
                </span>
                <div className="chips-row">
                  {spouses.map(s => (
                    <Link key={s.id} to={`/members/${s.id}`} className="relation-link-chip">
                      <Avatar name={s.full_name} gender={s.gender} size="sm" />
                      <span>{s.full_name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {parents.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <span className="data-label" style={{ display: 'block', marginBottom: '8px' }}>
                  Orang Tua
                </span>
                <div className="chips-row">
                  {parents.map(p => p.parent && (
                    <Link key={p.id} to={`/members/${p.parent.id}`} className="relation-link-chip">
                      <Avatar name={p.parent.full_name} gender={p.parent.gender} size="sm" />
                      <span>{p.parent.full_name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {children.length > 0 && (
              <div>
                <span className="data-label" style={{ display: 'block', marginBottom: '8px' }}>
                  Keturunan / Anak-anak
                </span>
                <div className="chips-row">
                  {children.map(c => c.child && (
                    <Link key={c.id} to={`/members/${c.child.id}`} className="relation-link-chip">
                      <Avatar name={c.child.full_name} gender={c.child.gender} size="sm" />
                      <span>{c.child.full_name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {spouses.length === 0 && parents.length === 0 && children.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Belum ada data relasi keluarga yang terhubung. Buka halaman Pohon Silsilah untuk menghubungkan.
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
