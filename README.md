# 🌳 Silsilah Keluarga (Family Tree App)

Aplikasi web modern, interaktif, dan responsif untuk mencatat, mengelola, serta memvisualisasikan silsilah pohon keluarga lintas generasi. Dibangun dengan arsitektur decoupled menggunakan **Go (GoFiber)** di sisi backend dan **React (Vite)** di sisi frontend, serta basis data **PostgreSQL**.

[![Go Version](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go)](https://golang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://www.docker.com)
[![Saweria](https://img.shields.io/badge/Support-Saweria-FFA500?style=flat&logo=kofi)](https://saweria.co/itsamilitarysecret)

---

## ☕ Dukungan & Donasi

Jika Anda merasa aplikasi ini bermanfaat atau ingin mendukung keberlanjutan pengembangan fitur-fitur baru, Anda dapat memberikan apresiasi dan donasi melalui:

👉 **[Saweria: saweria.co/itsamilitarysecret](https://saweria.co/itsamilitarysecret)**

Dukungan Anda sangat berarti bagi kelanjutan dan penyempurnaan proyek open-source ini! ❤️

---

## 🚀 Fitur Utama

- **🌳 Interactive Family Tree Visualizer**: Visualisasi diagram silsilah keluarga hierarkis dengan navigasi interaktif, intuitif, dan responsif.
- **👤 Manajemen Anggota Keluarga**: Pencatatan lengkap data anggota keluarga mencakup:
  - Nama lengkap & nama panggilan
  - Jenis kelamin
  - Tempat & tanggal lahir
  - Status hidup / tanggal wafat
  - Foto profil (upload lokal atau Cloudinary)
  - Pekerjaan, nomor telepon, alamat, dan biografi singkat
- **🔗 Relasi Keluarga Fleksibel**:
  - Hubungan Orang Tua ↔ Anak (*biological*, *adopted*, *stepchild*)
  - Hubungan Perkawinan / Pasangan (*spouse*)
- **📊 Dashboard & Statistik**: Ringkasan jumlah anggota keluarga, rasio hidup vs wafat, serta distribusi generasi keluarga.
- **🔐 Sistem Autentikasi & Hak Akses (RBAC)**:
  - Role **Admin**: Memiliki akses penuh menambah, menyunting, dan menghapus anggota serta relasi.
  - Role **Member**: Akses melihat dan mengeksplorasi pohon keluarga.
  - Dilengkapi keamanan JSON Web Token (JWT) dan hashing kata sandi dengan **Bcrypt**.
- **📸 Fleksibilitas Penyimpanan Media**: Mendukung penyimpanan file foto secara lokal di server (`/uploads`) maupun terintegrasi dengan **Cloudinary**.
- **🐳 Docker Ready**: Konfigurasi `docker-compose.yml` siap pakai untuk deploy backend, frontend (Nginx), dan PostgreSQL dalam satu perintah.

---

## 🔑 Akun Bawaan (Default Credentials)

Saat aplikasi pertama kali dijalankan dan terhubung ke database kosong, backend secara otomatis membuat akun Administrator bawaan:

| Keterangan | Nilai |
| :--- | :--- |
| **Email** | `admin@admin.com` |
| **Kata Sandi (Password)** | `admin123` |
| **Role** | `admin` |

> [!TIP]
> Kata sandi bawaan dapat disesuaikan sebelum server pertama kali dijalankan melalui variabel `DEFAULT_ADMIN_PASSWORD` pada file `.env` di backend.

---

## 🛠️ Tech Stack

### Backend
- **Bahasa**: [Go (Golang)](https://go.dev/) (Go 1.25+)
- **Web Framework**: [Fiber v2](https://gofiber.io/) (High performance, Express-like framework)
- **ORM & Database Driver**: [GORM](https://gorm.io/) dengan PostgreSQL Driver (`pgx/v5`)
- **Autentikasi**: JWT (`golang-jwt/jwt/v5`) & `golang.org/x/crypto/bcrypt`
- **Penyimpanan Media**: Local File Storage & Cloudinary SDK

### Frontend
- **Framework / Bundler**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS modern dengan tema glassmorphism & responsive layout

### Database & Infrastruktur
- **Database**: [PostgreSQL 15](https://www.postgresql.org/)
- **Containerization**: [Docker & Docker Compose](https://www.docker.com/)
- **Web Server Frontend**: [Nginx Alpine](https://nginx.org/)

---

## 💻 Panduan Instalasi & Menjalankan

### Cara 1: Menggunakan Docker Compose (Direkomendasikan)

Pastikan Docker Desktop / Docker Engine sudah terpasang dan berjalan di sistem Anda.

1. **Clone repository ini**:
   ```bash
   git clone https://github.com/username/silsilah-keluarga.git
   cd silsilah-keluarga
   ```

2. **Jalankan seluruh layanan dengan Docker Compose**:
   ```bash
   docker-compose up -d --build
   ```

3. **Akses aplikasi di browser**:
   - **Frontend**: [http://localhost](http://localhost) (Port 80)
   - **Backend API**: [http://localhost:8080](http://localhost:8080)
   - **PostgreSQL**: `localhost:5433`

---

### Cara 2: Menjalankan Secara Manual (Development Lokal)

#### Prasyarat
- Go 1.22+ terpasang
- Node.js 18+ & npm terpasang
- PostgreSQL 14+ terpasang dan berjalan

#### 1. Setup Database
Buat database baru di PostgreSQL:
```sql
CREATE DATABASE silsilah_keluarga;
```
*(Opsional: Anda dapat mengimpor file `backend/database/schema.sql` atau biarkan GORM melakukan auto-migrate otomatis saat backend berjalan).*

#### 2. Setup Backend
1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Buat file konfigurasi `.env`:
   ```bash
   cp .env.example .env
   ```
3. Sesuaikan isi `.env` sesuai konfigurasi lokal Anda:
   ```env
   DATABASE_URL=postgres://postgres:password@localhost:5432/silsilah_keluarga?sslmode=disable
   JWT_SECRET=your-super-secret-jwt-key
   DEFAULT_ADMIN_PASSWORD=admin123
   PORT=8080
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```
4. Jalankan backend:
   ```bash
   go run main.go
   ```
   Backend akan berjalan di port `8080` dan secara otomatis membuat tabel serta akun `admin@admin.com`.

#### 3. Setup Frontend
1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Buat file `.env`:
   ```bash
   cp .env.example .env
   ```
   Pastikan mengarah ke port backend:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
3. Install dependensi dan jalankan development server:
   ```bash
   npm install
   npm run dev
   ```
4. Buka tautan lokal yang ditampilkan (biasanya [http://localhost:5173](http://localhost:5173)).

---

## 📁 Struktur Direktori

```text
silsilah-keluarga/
├── README.md               # Dokumentasi proyek
├── docker-compose.yml      # Konfigurasi container Docker
├── backend/
│   ├── config/             # Pemuatan environment & konfigurasi
│   ├── database/           # Koneksi GORM, migrasi, dan seed default admin
│   │   ├── db.go           # Inisialisasi DB & AutoMigrate
│   │   └── schema.sql      # Schema DDL & seed manual
│   ├── handlers/           # Controller API (auth, family_member, relationship, upload)
│   ├── middleware/         # Middleware JWT & Auth Guard
│   ├── models/             # Definisi skema data GORM (User, FamilyMember, Relationship)
│   ├── routes/             # Routing endpoint Fiber
│   ├── uploads/            # Direktori penyimpanan foto lokal
│   ├── Dockerfile          # Image Docker backend
│   └── main.go             # Entrypoint server Go
└── frontend/
    ├── src/
    │   ├── api/            # Client axios & request handler
    │   ├── components/     # Komponen UI (Navbar, Card, Modal, dll.)
    │   ├── pages/          # Halaman aplikasi (Landing, TreeView, Dashboard, MemberDetail, Login)
    │   ├── store/          # Global state (Zustand authStore)
    │   ├── App.jsx         # Konfigurasi rute React Router
    │   └── main.jsx        # Entrypoint React
    ├── Dockerfile          # Image Docker frontend dengan Nginx
    └── nginx.conf          # Konfigurasi reverse proxy Nginx
```

---

## 🔒 Konfigurasi Variabel Lingkungan (Environment Variables)

### Backend (`backend/.env`)

| Variabel | Deskripsi | Default Contoh |
| :--- | :--- | :--- |
| `DATABASE_URL` | String koneksi PostgreSQL | `postgres://user:pass@localhost:5432/dbname?sslmode=disable` |
| `JWT_SECRET` | Kunci rahasia enkripsi token JWT | `your-super-secret-jwt-key` |
| `DEFAULT_ADMIN_PASSWORD` | Password akun bawaan `admin@admin.com` | `admin123` |
| `PORT` | Port server GoFiber | `8080` |
| `ALLOWED_ORIGINS` | Daftar origin URL CORS (dipisah koma) | `http://localhost:5173,http://localhost:3000` |
| `CLOUDINARY_CLOUD_NAME` | *(Opsional)* Cloud Name Cloudinary | `-` |
| `CLOUDINARY_API_KEY` | *(Opsional)* API Key Cloudinary | `-` |
| `CLOUDINARY_API_SECRET` | *(Opsional)* API Secret Cloudinary | `-` |

### Frontend (`frontend/.env`)

| Variabel | Deskripsi | Default Contoh |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL endpoint API backend | `http://localhost:8080/api` |

---

## 🤝 Dukung Kreator & Pengembangan

Aplikasi ini dikembangkan untuk mempermudah keluarga Indonesia dalam mendokumentasikan asal-usul, cerita, dan garis keturunan agar tidak lekang oleh waktu.

Dukung pengembang melalui Saweria:
👉 **[https://saweria.co/itsamilitarysecret](https://saweria.co/itsamilitarysecret)**

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT](LICENSE). Silakan gunakan, pelajari, dan kembangkan sesuai kebutuhan keluarga maupun komunitas Anda!
