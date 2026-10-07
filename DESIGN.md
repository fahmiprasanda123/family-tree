# DESIGN.md — Silsilah Keluarga

## 1. Identitas & Karakter Desain
- **Konsep**: *Warm Heritage & Family Archival* (Dokumentasi silsilah keluarga yang hangat, bersahaja, terpercaya, dan mudah diakses lintas generasi).
- **Anti-Pola yang Dihindari**:
  - Menghindari visual tech/crypto SaaS default AI (gradien ungu-neon, mode gelap pekat `#0d0d1a`, border glowing, teks berkilau, dan icon emoji mentah).
  - Menghindari tata letak kartu bento atau template generik tanpa substansi.
- **Prinsip Utama**:
  1. *Kejelasan Silsilah*: Hubungan darah, pernikahan, dan generasi terbaca jelas tanpa distraksi visual.
  2. *Inklusivitas Generasi*: Kontras teks tinggi (lolos WCAG AA), ukuran tombol nyaman (minimal 44px), navigasi responsif dan intuitif.
  3. *Nuansa Hangat & Abadi*: Menggunakan palet bernuansa alam (heritage forest green & warm amber/terracotta) dengan latar kertas hangat (warm parchment).

---

## 2. Palet Warna (Color System)

### A. Tema Terang (Light Mode — Default)
- `--bg-base`: `#fcfbf9` (Warm parchment cream)
- `--bg-surface`: `#f5f2eb` (Subtle warm paper)
- `--bg-card`: `#ffffff` (Clean white card)
- `--bg-elevated`: `#ece8df` (Muted warm surface)
- `--bg-hover`: `#e4dfd4` (Hover tone)
- `--text-primary`: `#1c1917` (Deep stone charcoal — kontras > 12:1)
- `--text-secondary`: `#44403c` (Muted warm stone — kontras > 7:1)
- `--text-muted`: `#78716c` (Stone grey — kontras > 4.5:1)
- `--border`: `#e7e2d7` (Warm subtle border)
- `--border-focus`: `#1b4332` (Forest green focus ring)

### B. Tema Gelap (Dark Mode — Opsional melalui Toggle)
- `--bg-base`: `#141517` (Deep warm charcoal)
- `--bg-surface`: `#1c1d21` (Dark slate surface)
- `--bg-card`: `#23252a` (Card slate)
- `--bg-elevated`: `#2c2e35` (Elevated surface)
- `--bg-hover`: `#353740` (Hover tone)
- `--text-primary`: `#fcfbf9` (Parchment white)
- `--text-secondary`: `#d6d3d1` (Soft stone)
- `--text-muted`: `#a8a29e` (Muted stone — kontras > 4.5:1)
- `--border`: `#343740` (Slate border)
- `--border-focus`: `#52b788` (Sage focus ring)

### C. Aksen & Status
- **Primary Brand (Heritage Green)**: `#1b4332` (Light) / `#40916c` (Dark)
- **Primary Hover**: `#143326` (Light) / `#52b788` (Dark)
- **Secondary / Archival Accent**: `#9a3412` (Warm Terracotta)
- **Male Line Accent**: `#1d4ed8` (Deep Blue)
- **Female Line Accent**: `#be185d` (Rose Ruby)
- **Success**: `#15803d`
- **Error**: `#b91c1c`
- **Warning**: `#b45309`

---

## 3. Tipografi
- **Font Utama**: `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`
- **Heading**: Bobot 700 / 800, line-height proporsional (1.2–1.3), tanpa huruf kapital berjarak renggang kaku.
- **Body**: 15px / 16px, line-height 1.6, santun dan mudah dibaca oleh pembaca usia lanjut.

---

## 4. Komponen & Interaktivitas
- **Ikon**: Menggunakan icon SVG semantik yang bersih, presisi, dan bersatu dengan tone sistem (tanpa emoji mentah sebagai pengganti ikon).
- **Avatar Placeholder**: Menggunakan inisial nama terformat atau siluet netral sopan.
- **Focus Ring**: Outline ganda kontras tinggi (`2px solid var(--border-focus)`, `outline-offset: 2px`) aktif pada keyboard `:focus-visible`.
- **Diagram Pohon**: Kartu node rapi dengan garis ortogonal tegas, pembagian gender yang elegan tanpa glow berlebih, dan navigasi zoom/pan lancar.
