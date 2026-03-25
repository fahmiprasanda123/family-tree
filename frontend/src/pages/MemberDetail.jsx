import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { membersAPI } from '../api/client';
import useAuthStore from '../store/authStore';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
        setError('Anggota tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Hapus ${data.data.full_name}?`)) return;
    try {
      await membersAPI.delete(id);
      navigate('/dashboard');
    } catch {
      alert('Gagal menghapus');
    }
  };

  if (loading) return <div className="page loading-state"><div className="spinner"></div></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div><Link to="/dashboard">← Kembali</Link></div>;

  const { data: member, parents, children, spouses } = data;

  const canEdit = isAdmin || user?.id === member.created_by;

  return (
    <div className="page member-detail">
      <div className="detail-back">
        <Link to="/dashboard">← Semua Anggota</Link>
      </div>

      <div className="detail-layout">
        {/* Left: Photo & Quick Info */}
        <div className="detail-sidebar">
          <div className="detail-photo">
            {member.photo_url ? (
              <img src={member.photo_url} alt={member.full_name} />
            ) : (
              <div className="detail-photo-placeholder">
                {member.gender === 'female' ? '👩' : '👨'}
              </div>
            )}
          </div>

          <div className="detail-status">
            {!member.is_alive && <span className="deceased-badge large">Almarhum/ah</span>}
            <span className={`gender-badge ${member.gender}`}>
              {member.gender === 'female' ? '♀ Perempuan' : '♂ Laki-laki'}
            </span>
          </div>

          {canEdit && (
            <div className="detail-actions">
              <Link to={`/members/${id}/edit`} className="btn btn-primary btn-full">✏️ Edit Profil</Link>
              {isAdmin && (
                <button onClick={handleDelete} className="btn btn-danger btn-full">🗑️ Hapus</button>
              )}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="detail-content">
          <div className="detail-header">
            <h1>{member.full_name}</h1>
            {member.nickname && <p className="detail-nickname">"{member.nickname}"</p>}
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Tanggal Lahir</span>
              <span className="detail-value">{formatDate(member.birth_date)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tempat Lahir</span>
              <span className="detail-value">{member.birth_place || '-'}</span>
            </div>
            {!member.is_alive && (
              <div className="detail-item">
                <span className="detail-label">Tanggal Wafat</span>
                <span className="detail-value">{formatDate(member.death_date)}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Pekerjaan</span>
              <span className="detail-value">{member.occupation || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">No. HP</span>
              <span className="detail-value">{member.phone || '-'}</span>
            </div>
            <div className="detail-item detail-item-full">
              <span className="detail-label">Alamat</span>
              <span className="detail-value">{member.address || '-'}</span>
            </div>
          </div>

          {member.bio && (
            <div className="detail-bio">
              <h3>Biografi</h3>
              <p>{member.bio}</p>
            </div>
          )}

          {/* Family Relations */}
          {spouses && spouses.length > 0 && (
            <div className="detail-relations">
              <h3>Suami / Istri</h3>
              <div className="relation-chips">
                {spouses.map(s => (
                  <Link key={s.id} to={`/members/${s.id}`} className="relation-chip">
                    {s.gender === 'female' ? '👩' : '👨'} {s.full_name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {parents && parents.length > 0 && (
            <div className="detail-relations">
              <h3>Orang Tua</h3>
              <div className="relation-chips">
                {parents.map(p => p.parent && (
                  <Link key={p.id} to={`/members/${p.parent?.id}`} className="relation-chip">
                    {p.parent?.gender === 'female' ? '👩' : '👨'} {p.parent?.full_name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {children && children.length > 0 && (
            <div className="detail-relations">
              <h3>Anak-anak</h3>
              <div className="relation-chips">
                {children.map(c => c.child && (
                  <Link key={c.id} to={`/members/${c.child?.id}`} className="relation-chip">
                    {c.child?.gender === 'female' ? '👧' : '👦'} {c.child?.full_name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
