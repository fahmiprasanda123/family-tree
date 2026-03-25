import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Landing() {
  const { user } = useAuthStore();

  return (
    <div className="landing">
      {/* Hero */}
      <header className="landing-nav">
        <div className="landing-nav-brand">
          <span>🌳</span>
          <strong>Silsilah Keluarga</strong>
        </div>
        <div className="landing-nav-links">
          <Link to="/tree">Lihat Pohon</Link>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
          ) : (
            <Link to="/login" className="btn btn-primary">Masuk</Link>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">✨ Hubungkan keluarga besar Anda</div>
          <h1 className="hero-title">
            Temukan & Abadikan<br />
            <span className="gradient-text">Silsilah Keluarga</span><br />
            Anda Bersama
          </h1>
          <p className="hero-desc">
            Platform kolaboratif untuk menyusun pohon keluarga bersama-sama. 
            Setiap anggota bisa menambahkan profil, foto, dan cerita mereka sendiri.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="btn btn-primary btn-lg">
              Masuk ke Akun
            </Link>
            <Link to="/tree" className="btn btn-ghost btn-lg">
              Lihat Contoh Pohon →
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-tree">
            <div className="tree-node grandparent">👴 Kakek</div>
            <div className="tree-line-h"></div>
            <div className="tree-node grandparent">👵 Nenek</div>
            <div className="tree-connector"></div>
            <div className="tree-row">
              <div className="tree-node parent">👨 Ayah</div>
              <div className="tree-node parent">👩 Ibu</div>
            </div>
            <div className="tree-connector"></div>
            <div className="tree-row">
              <div className="tree-node child active">👦 Anda</div>
              <div className="tree-node child">👧 Saudari</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Kenapa Silsilah Keluarga?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👨‍👩‍👧‍👦</div>
            <h3>Kolaboratif</h3>
            <p>Setiap anggota keluarga yang ditambahkan bisa masuk dan mengisi data sendiri</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Upload Foto</h3>
            <p>Tambahkan foto profil untuk setiap anggota keluarga</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌳</div>
            <h3>Visualisasi Interaktif</h3>
            <p>Lihat pohon keluarga dalam tampilan visual yang bisa di-zoom dan drag</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Aman & Privat</h3>
            <p>Data keluarga Anda aman dengan sistem otentikasi JWT</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Data Lengkap</h3>
            <p>Simpan nama, tanggal lahir, tempat lahir, pekerjaan, dan bio</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3>Cloud Storage</h3>
            <p>Foto disimpan di Cloudinary — aman dan bisa diakses dari mana saja</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ingin mendokumentasikan silsilah keluarga Anda?</h2>
        <p>Silakan masuk ke akun Anda untuk mulai membangun pohon keluarga</p>
        <Link to="/login" className="btn btn-primary btn-lg">Masuk Sekarang</Link>
      </section>

      <footer className="landing-footer">
        <p>🌳 Silsilah Keluarga — Abadikan warisan keluarga Anda</p>
      </footer>
    </div>
  );
}
