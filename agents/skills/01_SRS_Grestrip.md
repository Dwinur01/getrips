# 📄 SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## Grestrip Smart & Secure Navigator
**Versi:** 2.0.0 | **Tanggal:** Mei 2026 | **Status:** Final

---

## 1. PENDAHULUAN

### 1.1 Tujuan Dokumen
Dokumen ini mendefinisikan seluruh kebutuhan fungsional dan non-fungsional sistem **Grestrip Smart & Secure Navigator** — platform pariwisata digital berbasis AI untuk Kabupaten Gresik yang menggabungkan fitur perencanaan wisata cerdas, pemberdayaan UMKM lokal, dan keamanan siber berlapis.

### 1.2 Ruang Lingkup Sistem
Grestrip adalah aplikasi web multi-role yang menyediakan:
- **AI Itinerary Planner** berbasis Google Gemini 2.5 Flash
- **Dashboard UMKM** untuk pengelolaan usaha wisata lokal
- **AI WAF (Web Application Firewall)** berlapis dua untuk proteksi konten
- **Panel Administrasi** untuk Dinas Pariwisata Kabupaten Gresik
- **IT Security Center** untuk monitoring ancaman siber real-time

### 1.3 Definisi dan Akronim
| Istilah | Definisi |
|---|---|
| WAF | Web Application Firewall — sistem penyaring konten berbahaya |
| AI | Artificial Intelligence — kecerdasan buatan |
| UMKM | Usaha Mikro Kecil Menengah |
| AES-256 | Advanced Encryption Standard 256-bit |
| JWT-like | Skema autentikasi berbasis session lokal |
| SPA | Single Page Application |
| UGC | User Generated Content (ulasan pengguna) |
| Gemini | Model AI generatif dari Google |

### 1.4 Referensi
- Google Gemini 2.5 Flash API Documentation
- OWASP Top 10 Web Security Risks
- Standar Aksesibilitas WCAG 2.1
- Peraturan Daerah Gresik tentang Pariwisata

---

## 2. DESKRIPSI UMUM SISTEM

### 2.1 Perspektif Produk
Grestrip merupakan platform standalone berbasis web yang beroperasi di atas infrastruktur Node.js/Express dengan frontend React. Sistem terintegrasi dengan:
- Google Gemini API untuk fitur AI
- OpenStreetMap/Leaflet.js untuk peta interaktif
- Nominatim API untuk reverse geocoding
- MySQL (primary) dengan JSON file fallback

### 2.2 Fungsi Utama Sistem
```
Grestrip
├── Perencanaan Perjalanan AI (Wisatawan)
├── Manajemen UMKM & Sentimen (Pemilik UMKM)
├── Keamanan Konten AI WAF (IT Security)
└── Administrasi Platform (Super Admin)
```

### 2.3 Karakteristik Pengguna

| Role | Deskripsi | Akses Halaman |
|---|---|---|
| **Guest** | Pengunjung tanpa akun | /wisatawan |
| **Wisatawan** | Pengguna terdaftar pencari wisata | /wisatawan |
| **UMKM** | Pemilik usaha mitra Grestrip | /wisatawan, /umkm |
| **IT Security** | Petugas keamanan siber | Semua halaman |
| **Super Admin** | Staf Dinas Pariwisata Gresik | /wisatawan, /umkm, /admin |

### 2.4 Batasan Sistem
- Peta hanya mencakup wilayah Kabupaten Gresik (bbox: -7.30 s/d -6.95 lintang, 112.45 s/d 112.85 bujur)
- Fitur AI memerlukan koneksi internet dan Gemini API key (tanpa key: mode simulasi lokal)
- Tidak ada fitur pembayaran atau transaksi keuangan
- Data disimpan lokal (JSON file) atau MySQL — tidak ada cloud database

---

## 3. KEBUTUHAN FUNGSIONAL

### 3.1 Modul Autentikasi (AUTH)

#### AUTH-01: Registrasi Akun
- **Deskripsi:** Pengguna dapat mendaftar akun baru dengan memilih role
- **Input:** Nama lengkap, username (alphanumeric, 3-20 karakter), password (min 6 karakter), role
- **Proses:** Validasi input → hash password bcrypt (salt 10) → simpan ke database
- **Output:** Notifikasi sukses, redirect ke halaman login
- **Validasi:** Username unik, password min 6 karakter, nama tidak boleh kosong

#### AUTH-02: Login
- **Deskripsi:** Pengguna masuk dengan kredensial terdaftar
- **Input:** Username, password
- **Proses:** Cari user → bcrypt.compare() → simpan session ke localStorage
- **Output:** Redirect ke halaman sesuai role, toast "Selamat datang"
- **Error:** "Username atau password salah" (tidak mengungkap mana yang salah)

#### AUTH-03: Logout
- **Deskripsi:** Pengguna keluar dari sesi aktif
- **Proses:** Hapus localStorage `grestrip_user` → redirect ke /wisatawan

#### AUTH-04: Preset Login Demo
- **Deskripsi:** Login satu klik menggunakan akun demo yang sudah terpasang
- **Akun Demo:** wisatawan/password, umkm/password, itsec/password, admin/password

#### AUTH-05: Protected Route
- **Deskripsi:** Halaman tertentu hanya bisa diakses oleh role yang sesuai
- **Jika tidak authorized:** Tampil halaman "Akses Ditolak" lalu redirect

---

### 3.2 Modul Portal Wisatawan (TOUR)

#### TOUR-01: Peta Interaktif
- **Deskripsi:** Tampilkan semua merchant/destinasi di peta Leaflet.js
- **Fitur:** Marker berwarna per tipe (kuliner/wisata), popup info saat klik marker
- **Data:** Nama, tipe, rating, koordinat dari API `/api/merchants`

#### TOUR-02: AI Itinerary Generator
- **Deskripsi:** Buat rencana perjalanan otomatis menggunakan Gemini AI
- **Input:** Anggaran (Rp 10.000–1.000.000), durasi (1–7 hari), preferensi (kuliner/sejarah/alam/religi), alergi makanan
- **Proses:** Kirim ke `/api/itinerary` → Gemini AI generasi → fallback simulasi lokal
- **Output:** Timeline per hari berisi aktivitas, lokasi, estimasi biaya, deskripsi
- **Fitur tambahan:** Progress bar anggaran, badge total durasi, tombol simpan/salin

#### TOUR-03: Filter Timeline
- **Deskripsi:** Urutkan timeline itinerary berdasarkan kriteria
- **Opsi:** Default, Terdekat (jarak), Termurah (biaya), Terbagus (rating)

#### TOUR-04: Navigasi Peta dari Timeline
- **Deskripsi:** Klik tombol "Lihat di Peta" di item timeline → peta zoom ke lokasi tersebut
- **Proses:** Switch ke tab Peta → `mapInstance.setView([lat,lng], 16, {animate:true})`

#### TOUR-05: Simpan dan Salin Itinerary
- **Deskripsi:** Export itinerary ke file JSON atau salin teks plain ke clipboard
- **Format JSON:** `itinerary-gresik-{timestamp}.json`
- **Format teks:** Readable human-friendly dengan emoji dan format baris

#### TOUR-06: Ulasan (Review) dengan WAF Protection
- **Deskripsi:** Pengguna mengirim ulasan untuk merchant/destinasi
- **Input:** Nama, merchant terpilih, rating (1-5 bintang), teks ulasan (max 1000 karakter)
- **Proses:** Teks discan WAF (heuristik + AI) → jika bersih simpan, jika berbahaya tolak
- **Fitur tambahan:** Auto-fill nama dari sesi login, preview merchant terpilih, counter karakter

#### TOUR-07: Filter Review by Merchant
- **Deskripsi:** Tampilkan ulasan berdasarkan merchant tertentu
- **Default:** Semua merchant

#### TOUR-08: Pagination Review
- **Deskripsi:** Tampilkan 5 ulasan, tombol "Lihat N ulasan lagi"

#### TOUR-09: Alergi Filter
- **Deskripsi:** Sistem menyaring merchant berbahaya dari itinerary berdasarkan input alergi
- **Deteksi:** Keywords seafood (bandeng, udang, cumi, ikan), kacang (peanut, serundeng)
- **Data alergi:** Dienkripsi AES-256-CBC sebelum disimpan ke database

#### TOUR-10: Confetti Animasi
- **Deskripsi:** Animasi confetti CSS muncul selama 2.5 detik setelah itinerary berhasil dibuat

---

### 3.3 Modul Portal UMKM (UMKM)

#### UMKM-01: Dashboard Statistik
- **Deskripsi:** Menampilkan KPI merchant aktif: total menu, rata-rata harga, rating
- **Data:** Dihitung dari catalog dan reviews merchant yang dipilih

#### UMKM-02: Selector Merchant
- **Deskripsi:** Dropdown memilih merchant yang dikelola
- **Auto-select:** Jika role UMKM login, otomatis pilih merchant miliknya berdasarkan nama owner

#### UMKM-03: AI Sentiment Analysis
- **Deskripsi:** Analisis sentimen ulasan konsumen menggunakan Gemini AI
- **Output:** Skor persentase (0-100%), gauge speedometer visual, label emosi, saran AI
- **Refresh:** Tombol manual refresh, otomatis saat ganti merchant

#### UMKM-04: Manajemen Katalog Menu
- **Deskripsi:** CRUD (tambah, edit, hapus) item menu/produk merchant
- **Input:** Nama (max 100 karakter), harga (Rp 1.000–1.000.000), deskripsi
- **Validasi:** Harga minimum Rp 1.000, nama tidak boleh duplikat
- **Fitur:** Search katalog real-time, badge "🔥 Terlaris" di item pertama, tooltip deskripsi

#### UMKM-05: Tab Ulasan Konsumen
- **Deskripsi:** Lihat semua ulasan yang masuk untuk merchant aktif
- **Fitur:** Grafik distribusi rating bintang, sorting (Terbaru/Tertinggi/Terendah), badge "N baru"

---

### 3.4 Modul Portal IT Security (ITSEC)

#### ITSEC-01: Dashboard Monitoring
- **Deskripsi:** Tampilan statistik ancaman real-time
- **Metrics:** Total ancaman diblokir, jumlah hari ini vs kemarin, chart aktivitas per jam

#### ITSEC-02: Threat Log Table
- **Deskripsi:** Tabel riwayat serangan yang diblokir WAF
- **Kolom:** Timestamp (tanggal+jam), tipe ancaman, payload (truncated), IP, badge severity
- **Filter:** Chip filter Semua/XSS/SQLi/Profanity
- **Fitur:** Copy payload ke clipboard, auto-refresh toggle dengan countdown

#### ITSEC-03: WAF Playground
- **Deskripsi:** Pengujian payload secara langsung terhadap AI WAF
- **Input:** Textarea payload (XSS, SQLi, profanity, teks normal)
- **Output:** Console syntax-highlighted (key berwarna), status BLOCKED/SAFE
- **Fitur tambahan:** Animasi "THREAT BLOCKED" shield saat terblokir, history 5 payload terakhir

#### ITSEC-04: WAF Dual-Layer Engine
- **Layer 1 (Heuristik):** Regex pattern matching untuk XSS, SQLi, profanity (cepat, offline)
- **Layer 2 (AI):** Gemini Flash-Lite untuk analisis kontekstual mendalam
- **Rate Limiter:** Per-IP, 15 request per 60 detik, tracking via Map

#### ITSEC-05: Quota Monitoring
- **Deskripsi:** Pantau sisa quota API Gemini
- **Status:** Secure (hijau) / Warning (kuning) / Blocked (merah)

---

### 3.5 Modul Portal Super Admin (ADMIN)

#### ADMIN-01: Statistik Platform
- **Deskripsi:** KPI real-time platform dari data aktual
- **Metrics:** Total merchant, total reviews, rata-rata rating, total ancaman diblokir
- **Visualisasi:** Donut chart distribusi tipe UMKM (kuliner/wisata), loading skeleton saat fetch

#### ADMIN-02: Registrasi UMKM Baru
- **Deskripsi:** Daftarkan merchant UMKM baru ke platform
- **Input:** Nama usaha, nama pemilik, tipe (kuliner/wisata), deskripsi, koordinat
- **Koordinat:** Bisa diisi manual atau via Map Picker Leaflet interaktif
- **Validasi:** Koordinat harus dalam bounding box Gresik, semua field wajib diisi
- **Alur:** Isi form → Pratinjau (preview modal) → Konfirmasi → Submit
- **Reverse geocoding:** Nama kelurahan/kecamatan otomatis terisi setelah pilih koordinat

#### ADMIN-03: Manajemen Merchant
- **Deskripsi:** Lihat, edit, dan ubah status aktif/nonaktif merchant
- **Search:** Filter merchant berdasarkan nama atau pemilik
- **Toggle nonaktif:** Wajib pilih alasan dari dropdown (renovasi/pelanggaran/permintaan/tidak aktif)
- **Visual:** Merchant nonaktif tampil redup + badge "⏸ Nonaktif"

#### ADMIN-04: Akun UMKM
- **Deskripsi:** Buat akun login untuk pemilik UMKM baru yang terdaftar

---

### 3.6 Modul Global (GLOBAL)

#### GLOBAL-01: Toast Notification System
- **Deskripsi:** Notifikasi non-blocking di pojok kanan bawah, auto-hilang 3.5 detik
- **Tipe:** success (teal), error (merah), warning (amber), info (biru)

#### GLOBAL-02: Settings Modal
- **Deskripsi:** Konfigurasi Gemini API key, tersimpan di localStorage
- **Akses:** Icon gear di footer sidebar

#### GLOBAL-03: Onboarding Tooltip
- **Deskripsi:** Tooltip panduan pertama kali untuk guest, muncul sekali, tersimpan di localStorage

#### GLOBAL-04: Keyboard Shortcut
- **Deskripsi:** Alt+1/2/3/4 untuk navigasi antar portal (sesuai akses role)

#### GLOBAL-05: Mode Simulasi
- **Deskripsi:** Seluruh fitur AI berjalan dengan data mock tanpa Gemini API key
- **Cakupan:** Itinerary generator, sentiment analysis, WAF AI layer

---

## 4. KEBUTUHAN NON-FUNGSIONAL

### 4.1 Performa
| Metrik | Target |
|---|---|
| Waktu load halaman pertama | < 3 detik (jaringan normal) |
| Waktu generate itinerary (dengan API) | < 8 detik |
| Waktu generate itinerary (simulasi) | < 1 detik |
| Waktu analisis sentimen | < 5 detik |
| Waktu scan WAF heuristik | < 50ms |
| Waktu scan WAF AI | < 3 detik |

### 4.2 Keamanan
| Aspek | Implementasi |
|---|---|
| Password storage | bcrypt hash, salt 10 |
| Data alergi sensitif | AES-256-CBC encryption |
| XSS prevention | HTML escape di log table |
| Input validation | Server-side validation semua endpoint |
| Rate limiting | Per-IP, 15 req/60 detik |
| SQL Injection | Parameterized via WAF scan |

### 4.3 Ketersediaan
- Sistem harus berjalan di Mode Simulasi saat API tidak tersedia
- Fallback database JSON jika MySQL tidak terhubung
- Graceful error handling di semua API endpoint

### 4.4 Aksesibilitas
- Font size minimum 10px di seluruh antarmuka
- Contrast ratio memenuhi WCAG 2.1 AA
- Semua tombol icon-only memiliki `title` attribute
- Keyboard navigable (Alt+1/2/3/4)

### 4.5 Kompatibilitas
- Browser: Chrome 110+, Firefox 110+, Edge 110+, Safari 16+
- Layar: Minimum 1280px width (desktop-first)
- Node.js: v18+
- React: v18+

### 4.6 Pemeliharaan
- Kode diorganisir per module/komponen
- Context API untuk state management global
- Tidak ada inline `alert()` atau `confirm()` native
- Semua string pesan dalam bahasa Indonesia

---

## 5. BATASAN DAN ASUMSI

### 5.1 Batasan
1. Tidak ada fitur real-time chat/notifikasi push
2. Tidak ada integrasi payment gateway
3. Peta hanya support wilayah Gresik
4. Satu sesi aktif per browser (localStorage-based)
5. File upload belum didukung (termasuk foto menu)

### 5.2 Asumsi
1. Pengguna memiliki koneksi internet stabil minimal 1 Mbps
2. Server berjalan di lingkungan Node.js v18+
3. Data merchant awal sudah disediakan oleh Dinas Pariwisata
4. Gemini API key dimiliki oleh administrator sistem

---

## 6. DIAGRAM KONTEKS SISTEM

```
                    ┌─────────────────────────────────┐
                    │                                 │
 [Wisatawan] ──────►│                                 │◄──── [Google Gemini API]
                    │                                 │
 [Pemilik UMKM] ───►│     GRESTRIP SMART & SECURE     │◄──── [OpenStreetMap/Nominatim]
                    │          NAVIGATOR              │
 [IT Security] ────►│                                 │◄──── [MySQL Database]
                    │                                 │
 [Super Admin] ────►│                                 │◄──── [JSON File Fallback]
                    │                                 │
                    └─────────────────────────────────┘
```

---

*Dokumen ini dibuat sebagai bagian dari submission #JuaraVibeCoding 2026*
*Versi terakhir diperbarui: Mei 2026*
