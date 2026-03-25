import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { membersAPI, uploadAPI } from '../api/client';
import useAuthStore from '../store/authStore';

export default function MemberForm({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileRef = useRef();
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    full_name: '', nickname: '', gender: 'male',
    birth_date: '', birth_place: '', death_date: '',
    photo_url: '', bio: '', phone: '', address: '',
    occupation: '', is_alive: true,
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
      }).catch(() => setError('Gagal memuat data anggota'));
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
      setError('Gagal mengupload foto. Coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.gender) {
      setError('Nama lengkap dan jenis kelamin wajib diisi');
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
      setError(err.response?.data?.error || 'Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="page form-page">
      <div className="form-header">
        <Link to={isEdit ? `/members/${id}` : '/dashboard'} className="back-link">← Kembali</Link>
        <h1>{isEdit ? 'Edit Profil Anggota' : 'Tambah Anggota Keluarga'}</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="member-form">
        {/* Photo Upload */}
        <div className="form-section">
          <h2>Foto Profil</h2>
          <div className="photo-upload">
            <div className="photo-preview" onClick={() => fileRef.current.click()}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" />
              ) : (
                <div className="photo-upload-placeholder">
                  <span>📷</span>
                  <p>Klik untuk upload foto</p>
                </div>
              )}
              {uploading && <div className="upload-overlay"><div className="spinner"></div></div>}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <p className="upload-hint">JPG, PNG, WebP maksimal 5MB</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="form-section">
          <h2>Informasi Dasar</h2>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label>Nama Lengkap <span className="required">*</span></label>
              <input type="text" value={form.full_name} onChange={set('full_name')} placeholder="Nama lengkap" required />
            </div>
            <div className="form-group">
              <label>Nama Panggilan</label>
              <input type="text" value={form.nickname} onChange={set('nickname')} placeholder="Nama panggilan" />
            </div>
            <div className="form-group">
              <label>Jenis Kelamin <span className="required">*</span></label>
              <select value={form.gender} onChange={set('gender')} required>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Birth Info */}
        <div className="form-section">
          <h2>Data Kelahiran & Kematian</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Tanggal Lahir</label>
              <input type="date" value={form.birth_date} onChange={set('birth_date')} />
            </div>
            <div className="form-group">
              <label>Tempat Lahir</label>
              <input type="text" value={form.birth_place} onChange={set('birth_place')} placeholder="Kota kelahiran" />
            </div>
            <div className="form-group form-checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.is_alive} onChange={set('is_alive')} />
                Masih hidup
              </label>
            </div>
            {!form.is_alive && (
              <div className="form-group">
                <label>Tanggal Wafat</label>
                <input type="date" value={form.death_date} onChange={set('death_date')} />
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="form-section">
          <h2>Informasi Kontak</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Pekerjaan</label>
              <input type="text" value={form.occupation} onChange={set('occupation')} placeholder="Petani, Guru, dll." />
            </div>
            <div className="form-group">
              <label>No. HP / WhatsApp</label>
              <input type="text" value={form.phone} onChange={set('phone')} placeholder="08xxxxxxxxxx" />
            </div>
            <div className="form-group form-group-full">
              <label>Alamat</label>
              <textarea value={form.address} onChange={set('address')} placeholder="Alamat lengkap" rows={2} />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="form-section">
          <h2>Biografi</h2>
          <div className="form-group">
            <textarea
              value={form.bio}
              onChange={set('bio')}
              placeholder="Ceritakan sedikit tentang anggota keluarga ini..."
              rows={4}
            />
          </div>
        </div>

        <div className="form-actions">
          <Link to={isEdit ? `/members/${id}` : '/dashboard'} className="btn btn-ghost">Batal</Link>
          <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
            {saving ? 'Menyimpan...' : isEdit ? '💾 Simpan Perubahan' : '✅ Tambah Anggota'}
          </button>
        </div>
      </form>
    </div>
  );
}
