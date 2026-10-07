import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { TreeIcon, UsersIcon, BookOpenIcon, ShieldIcon } from '../components/Icons';
import Avatar from '../components/Avatar';

export default function Landing() {
  const { user } = useAuthStore();

  return (
    <div className="landing-page">
      {/* Top Bar */}
      <header className="landing-header">
        <div className="navbar-brand">
          <Link to="/" aria-label="Beranda Silsilah Keluarga">
            <span className="brand-icon-wrapper">
              <TreeIcon size={20} />
            </span>
            <span>Silsilah Keluarga</span>
          </Link>
        </div>
        <div className="navbar-actions">
          <Link to="/tree" className="btn btn-ghost btn-sm">
            Bagan Silsilah
          </Link>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard Anggota
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Masuk Akun
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-category">
            <TreeIcon size={16} />
            <span>Dokumentasi Garis Keturunan</span>
          </div>

          <h1 className="hero-title">
            Dokumentasikan & Rawat<br />
            <strong>Silsilah Keluarga</strong><br />
            Lintas Generasi
          </h1>

          <p className="hero-description">
            Wadah terpercaya bagi keluarga besar untuk merangkai bagan leluhur,
            mencatat riwayat hidup, serta mewariskan memori berharga kepada anak cucu.
          </p>

          <div className="hero-actions">
            <Link to="/tree" className="btn btn-primary btn-lg">
              Jelajahi Bagan Silsilah
            </Link>
            {user ? (
              <Link to="/dashboard" className="btn btn-secondary btn-lg">
                Buka Data Anggota
              </Link>
            ) : (
              <Link to="/login" className="btn btn-secondary btn-lg">
                Masuk ke Akun
              </Link>
            )}
          </div>
        </div>

        {/* Hero Visual: Clean Archival Tree Mockup */}
        <div className="hero-visual-card" aria-label="Pratinjau struktur bagan keluarga">
          <div className="visual-card-header">
            <span className="visual-card-title">Arsip Garis Keturunan</span>
            <span className="visual-card-tag">3 Generasi</span>
          </div>

          <div className="mock-tree">
            {/* Generasi 1 */}
            <div className="mock-row">
              <div className="mock-node">
                <Avatar name="Raden Kartosuwiryo" gender="male" size="sm" />
                <span>Kakek Buyut</span>
              </div>
              <div className="mock-node">
                <Avatar name="Siti Aminah" gender="female" size="sm" />
                <span>Nenek Buyut</span>
              </div>
            </div>

            <div className="mock-branch"></div>

            {/* Generasi 2 */}
            <div className="mock-row">
              <div className="mock-node">
                <Avatar name="Ahmad Dahlan" gender="male" size="sm" />
                <span>Ayah</span>
              </div>
              <div className="mock-node">
                <Avatar name="Nurhayati" gender="female" size="sm" />
                <span>Ibu</span>
              </div>
            </div>

            <div className="mock-branch"></div>

            {/* Generasi 3 */}
            <div className="mock-row">
              <div className="mock-node current-user">
                <Avatar name="Fahmi Prasanda" gender="male" size="sm" />
                <span>Anda (Pencatat)</span>
              </div>
              <div className="mock-node">
                <Avatar name="Aisyah Putri" gender="female" size="sm" />
                <span>Saudari</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Pillars / Value Props */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2>Nilai Penting Merawat Asal-Usul</h2>
            <p>
              Mengenal siapa pendahulu kita mempererat tali persaudaraan dan
              memastikan kisah keluarga tetap lestari.
            </p>
          </div>

          <div className="narrative-grid">
            <article className="narrative-card">
              <div className="card-icon-bubble">
                <UsersIcon size={22} />
              </div>
              <h3>Pencatatan Kolaboratif</h3>
              <p>
                Setiap anggota keluarga yang terdaftar dapat melengkapi profil,
                foto masa muda, dan memverifikasi tali persaudaraan secara bersama.
              </p>
            </article>

            <article className="narrative-card">
              <div className="card-icon-bubble">
                <BookOpenIcon size={22} />
              </div>
              <h3>Riwayat Hidup Utuh</h3>
              <p>
                Dokumentasikan tanggal penting, tempat kelahiran, jejak pengabdian,
                hingga cerita kenangan keluarga dalam satu wadah yang tersusun rapi.
              </p>
            </article>

            <article className="narrative-card">
              <div className="card-icon-bubble">
                <ShieldIcon size={22} />
              </div>
              <h3>Privasi Terjaga Penuh</h3>
              <p>
                Data silsilah dan foto kenangan tersimpan secara aman dan terproteksi,
                hanya dapat diakses oleh anggota keluarga yang diberikan izin.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Callout Section */}
      <section className="cta-callout">
        <h2>Mulai Bangun Pohon Silsilah Anda Hari Ini</h2>
        <p>
          Catat nama para orang tua, sambungkan saudara yang jauh, dan
          abadikan warisan keluarga untuk generasi penerus.
        </p>
        <div className="hero-actions">
          <Link to="/tree" className="btn btn-primary btn-lg">
            Buka Bagan Silsilah
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-secondary btn-lg">
              Masuk Akun Pengelola
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Silsilah Keluarga (c) 2026. Merawat ingatan, mempererat persaudaraan.</p>
      </footer>
    </div>
  );
}
