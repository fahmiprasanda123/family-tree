import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { membersAPI, uploadAPI } from '../api/client';
import useAuthStore from '../store/authStore';
import { ArrowLeftIcon, CameraIcon } from '../components/Icons';

export default function MemberForm({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileRef = useRef(null);
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    full_name: '',
    nickname: '',
    gender: 'male',
    birth_date: '',
    birth_place: '',
    death_date: '',
    photo_url: '',
    bio: '',
    phone: '',
    address: '',
    occupation: '',
    is_alive: true,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      membersAPI.get(id).then(res => {
        const m = res.data.data;
        setForm({
          full_name: m.full_name || '',
          nickname: m.nickname || '',
          gender: m.gender || 'male',
          birth_date: m.birth_date ? m.birth_date.substring(0, 10) : '',
          birth_place: m.birth_place || '',
          death_date: m.death_date ? m.death_date.substring(0, 10) : '',
          photo_url: m.photo_url || '',
          bio: m.bio || '',
          phone: m.phone || '',
          address: m.address || '',
          occupation: m.occupation || '',
          is_alive: m.is_alive !== undefined ? m.is_alive : true,
        });
        if (m.photo_url) setPreviewUrl(m.photo_url);
      }).catch(() => setError('Gagal memuat data anggota keluarga'));
    }
  }, [id, isEdit]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const res = await uploadAPI.photo(file);
      setForm(prev => ({ ...prev, photo_url: res.data.url }));
    } catch {
      setError('Gagal mengunggah foto. Silakan coba kembali.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.gender) {
      setError('Nama lengkap dan jenis kelamin wajib diisi.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        birth_date: form.birth_date || null,
        death_date: form.death_date || null,
      };
      if (isEdit) {
        await membersAPI.update(id, payload);
        navigate(`/members/${id}`);
      } else {
        const res = await membersAPI.create(payload);
        navigate(`/members/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data anggota keluarga.');
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="page" style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to={isEdit ? `/members/${id}` : '/dashboard'} className="btn btn-ghost btn-sm">
          <ArrowLeftIcon size={16} />
          <span>Kembali</span>
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Ubah Profil Anggota' : 'Tambah Anggota Keluarga Baru'}</h1>
          <p>Lengkapi biodata anggota untuk memperjelas rantai silsilah keluarga</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Photo Upload Section */}
        <div className="form-section">
          <h2>Foto Dokumen / Kenangan</h2>
          <div className="photo-upload-area">
            <div
              className="photo-upload-box"
              onClick={() => fileRef.current && fileRef.current.click()}
              role="button"
              tabIndex={0}
              aria-label="Pilih foto anggota keluarga"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileRef.current && fileRef.current.click();
                }
              }}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Pratinjau foto anggota" />
              ) : (
                <>
                  <CameraIcon size={32} />
                  <span className="photo-upload-label">Klik untuk unggah foto</span>
                </>
              )}
              {uploading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div className="spinner"></div>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Format JPG, PNG, atau WebP (maksimal 5 MB)
            </p>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="form-section">
          <h2>Identitas Pokok</h2>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label htmlFor="full_name">
                Nama Lengkap <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                id="full_name"
                type="text"
                value={form.full_name}
                onChange={set('full_name')}
                placeholder="Contoh: Raden Ahmad Dahlan"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="nickname">Nama Panggilan / Gelar</label>
              <input
                id="nickname"
                type="text"
                value={form.nickname}
                onChange={set('nickname')}
                placeholder="Contoh: Dahlan"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">
                Jenis Kelamin <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select id="gender" value={form.gender} onChange={set('gender')} required>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>

            <div className="form-group form-group-full" style={{ marginTop: '8px' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.is_alive}
                  onChange={set('is_alive')}
                />
                <span>Masih Hidup (Centang jika masih ada, hilangkan jika sudah wafat)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Birth & Origin Section */}
        <div className="form-section">
          <h2>Riwayat Lahir & Wafat</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="birth_date">Tanggal Lahir</label>
              <input
                id="birth_date"
                type="date"
                value={form.birth_date}
                onChange={set('birth_date')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="birth_place">Tempat Lahir</label>
              <input
                id="birth_place"
                type="text"
                value={form.birth_place}
                onChange={set('birth_place')}
                placeholder="Kota / Daerah kelahiran"
              />
            </div>

            {!form.is_alive && (
              <div className="form-group form-group-full">
                <label htmlFor="death_date">Tanggal Wafat</label>
                <input
                  id="death_date"
                  type="date"
                  value={form.death_date}
                  onChange={set('death_date')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Contact & Bio Section */}
        <div className="form-section">
          <h2>Kontak, Profesi & Catatan Hidup</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="occupation">Pekerjaan / Bidang Pengabdian</label>
              <input
                id="occupation"
                type="text"
                value={form.occupation}
                onChange={set('occupation')}
                placeholder="Contoh: Guru, Wirausaha, Dokter"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Nomor Telepon / WhatsApp</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="0812xxxxxxx"
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="address">Alamat / Domisili Terakhir</label>
              <input
                id="address"
                type="text"
                value={form.address}
                onChange={set('address')}
                placeholder="Alamat lengkap atau nama kota"
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="bio">Catatan Biografi & Kenangan</label>
              <textarea
                id="bio"
                rows={4}
                value={form.bio}
                onChange={set('bio')}
                placeholder="Tuliskan kisah perjalanan hidup, kenangan keluarga, atau pesan penting..."
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <Link to={isEdit ? `/members/${id}` : '/dashboard'} className="btn btn-secondary">
            Batal
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
            {saving ? 'Menyimpan Data...' : isEdit ? 'Simpan Perubahan' : 'Daftarkan Anggota'}
          </button>
        </div>
      </form>
    </div>
  );
}
