# 📋 TASK BREAKDOWN DOCUMENT
## Grestrip Smart & Secure Navigator
**Versi:** 2.0.0 | **Metodologi:** Agile Sprint | **Total Estimasi:** ~120 jam

---

## 1. RINGKASAN SPRINT

| Sprint | Fokus | Durasi | Status |
|---|---|---|---|
| Sprint 0 | Setup & Fondasi | 8 jam | ✅ Done |
| Sprint 1 | Backend Core & Database | 16 jam | ✅ Done |
| Sprint 2 | Portal Wisatawan | 20 jam | ✅ Done |
| Sprint 3 | Portal UMKM | 14 jam | ✅ Done |
| Sprint 4 | AI WAF & IT Security | 16 jam | ✅ Done |
| Sprint 5 | Portal Super Admin | 12 jam | ✅ Done |
| Sprint 6 | Keamanan & Kualitas | 10 jam | ✅ Done |
| Sprint 7 | UI/UX Polish & Improvisasi | 14 jam | ✅ Done |
| Sprint 8 | React Router Multi-Page | 8 jam | ✅ Done |
| Sprint 9 | Final Fix & Testing | 6 jam | ✅ Done |

---

## 2. SPRINT 0 — SETUP & FONDASI
**Estimasi:** 8 jam | **Status:** ✅ Selesai

| ID | Task | Assignee | Estimasi | Status |
|---|---|---|---|---|
| S0-01 | Inisialisasi repo GitHub | Dev | 0.5j | ✅ |
| S0-02 | Setup Node.js + Express project structure | Dev | 1j | ✅ |
| S0-03 | Setup React + Vite + TailwindCSS (client/) | Dev | 1j | ✅ |
| S0-04 | Konfigurasi Tailwind: color tokens, font, custom class | Dev | 1j | ✅ |
| S0-05 | Setup `.env` dengan template variabel | Dev | 0.5j | ✅ |
| S0-06 | Buat struktur folder: `data/`, `client/src/components/` | Dev | 0.5j | ✅ |
| S0-07 | Setup Leaflet.js di client (import CSS + JS) | Dev | 1j | ✅ |
| S0-08 | Setup Lucide React icons | Dev | 0.5j | ✅ |
| S0-09 | Buat initial mock data (`database.json`) dengan 7 merchant | Dev | 1.5j | ✅ |
| S0-10 | Setup `nodemon` untuk hot-reload server | Dev | 0.5j | ✅ |

---

## 3. SPRINT 1 — BACKEND CORE & DATABASE
**Estimasi:** 16 jam | **Status:** ✅ Selesai

### 3.1 Database Layer (`db.js`)

| ID | Task | Estimasi | Status | Catatan |
|---|---|---|---|---|
| S1-01 | Implementasi AES-256-CBC encrypt/decrypt | 2j | ✅ | Untuk data alergi |
| S1-02 | Buat fungsi `getMerchants()` | 0.5j | ✅ | Baca dari JSON |
| S1-03 | Buat fungsi `getReviews()` + `addReview()` | 1j | ✅ | |
| S1-04 | Buat fungsi `getUsers()` + `addUser()` | 0.5j | ✅ | |
| S1-05 | Buat fungsi `getThreats()` + `addThreat()` | 0.5j | ✅ | |
| S1-06 | Dual-mode database: MySQL primary + JSON fallback | 2j | ✅ | |
| S1-07 | Buat `initialData` seed lengkap (merchant, review, user demo) | 1.5j | ✅ | |

### 3.2 API Endpoints (`server.js`)

| ID | Task | Estimasi | Status | Endpoint |
|---|---|---|---|---|
| S1-08 | `GET /api/merchants` | 0.5j | ✅ | |
| S1-09 | `GET /api/reviews` + `GET /api/reviews/:merchantId` | 0.5j | ✅ | |
| S1-10 | `POST /api/auth/register` dengan bcrypt hash | 1j | ✅ | |
| S1-11 | `POST /api/auth/login` dengan bcrypt.compare | 1j | ✅ | |
| S1-12 | `GET /api/threats` | 0.5j | ✅ | |
| S1-13 | `GET /api/quota` | 0.5j | ✅ | |
| S1-14 | `POST /api/waf/test` | 1j | ✅ | |
| S1-15 | `POST /api/waf/whitelist` | 0.5j | ✅ | |
| S1-16 | `POST /api/merchants/:id/catalog` | 0.5j | ✅ | |
| S1-17 | `POST /api/admin/merchants` | 1j | ✅ | |
| S1-18 | `PUT /api/admin/merchants/:id` | 1j | ✅ | |
| S1-19 | `GET /api/admin/stats` (real data) | 1j | ✅ | |
| S1-20 | `POST /api/itinerary/export` | 0.5j | ✅ | |
| S1-21 | Input validation semua endpoint | 1.5j | ✅ | |

---

## 4. SPRINT 2 — PORTAL WISATAWAN
**Estimasi:** 20 jam | **Status:** ✅ Selesai

### 4.1 Setup & Layout

| ID | Task | Estimasi | Status |
|---|---|---|---|
| S2-01 | Buat komponen `WisatawanPortal.jsx` dengan layout split panel | 1j | ✅ |
| S2-02 | Inisialisasi Leaflet map di useEffect dengan cleanup | 1.5j | ✅ |
| S2-03 | Plot marker merchant (kuliner/wisata berbeda warna) | 1j | ✅ |
| S2-04 | Popup marker: nama, tipe, rating | 0.5j | ✅ |

### 4.2 Form Itinerary

| ID | Task | Estimasi | Status |
|---|---|---|---|
| S2-05 | Input budget dengan slider + input angka | 1j | ✅ |
| S2-06 | Input durasi (dropdown 1-7 hari) | 0.5j | ✅ |
| S2-07 | Toggle preferensi dengan ikon per tipe (kuliner/sejarah/alam/religi) | 1j | ✅ |
| S2-08 | Input alergi dengan enkripsi AES-256 sebelum kirim | 1j | ✅ |
| S2-09 | Tombol "✨ Rangkai Rute dengan AI" + loading state | 0.5j | ✅ |
| S2-10 | Tombol Reset form | 0.5j | ✅ |

### 4.3 AI Itinerary Result

| ID | Task | Estimasi | Status |
|---|---|---|---|
| S2-11 | `POST /api/itinerary` dengan Gemini AI + fallback simulasi | 2j | ✅ |
| S2-12 | Tampilkan timeline card per aktivitas | 1j | ✅ |
| S2-13 | Filter chip (Default/Terdekat/Termurah/Terbagus) | 1j | ✅ |
| S2-14 | Badge summary (hari, aktivitas, durasi, biaya) | 0.5j | ✅ |
| S2-15 | Progress bar anggaran real-time (hijau/kuning/merah) | 1j | ✅ |
| S2-16 | Tombol "Lihat di Peta" per item timeline + zoom map | 1j | ✅ |
| S2-17 | Tombol simpan JSON + salin teks clipboard | 1j | ✅ |
| S2-18 | Auto-switch tab + smooth scroll ke timeline | 0.5j | ✅ |
| S2-19 | Animasi confetti CSS (30 pieces, 2.5 detik) | 1j | ✅ |
| S2-20 | Badge notifikasi di tab Timeline setelah generate | 0.5j | ✅ |

### 4.4 Review System

| ID | Task | Estimasi | Status |
|---|---|---|---|
| S2-21 | Form review: dropdown merchant + preview card | 1j | ✅ |
| S2-22 | Rating bintang interaktif + label dinamis | 0.5j | ✅ |
| S2-23 | Textarea dengan character counter (0/1000) | 0.5j | ✅ |
| S2-24 | Auto-fill nama dari sesi login | 0.5j | ✅ |
| S2-25 | WAF block modal saat review ditolak | 1j | ✅ |
| S2-26 | Filter review by merchant (dropdown) | 0.5j | ✅ |
| S2-27 | Pagination "Lihat N ulasan lagi" (5 per batch) | 0.5j | ✅ |

---

## 5. SPRINT 3 — PORTAL UMKM
**Estimasi:** 14 jam | **Status:** ✅ Selesai

| ID | Task | Estimasi | Status |
|---|---|---|---|
| S3-01 | Buat `UmkmPortal.jsx` dengan layout grid bento | 1j | ✅ |
| S3-02 | Merchant selector dropdown | 0.5j | ✅ |
| S3-03 | Auto-select merchant milik user yang login | 1j | ✅ |
| S3-04 | 4 KPI stat cards (ulasan, rating, menu, avg harga) | 1j | ✅ |
| S3-05 | Sentiment gauge speedometer SVG | 1.5j | ✅ |
| S3-06 | Fetch sentimen via Gemini AI + loading spinner | 1j | ✅ |
| S3-07 | Tombol refresh sentimen manual | 0.5j | ✅ |
| S3-08 | Tooltip jumlah data di gauge sentimen | 0.5j | ✅ |
| S3-09 | List katalog menu dengan search real-time | 1j | ✅ |
| S3-10 | Badge "🔥 Terlaris" di item pertama | 0.5j | ✅ |
| S3-11 | Tooltip full deskripsi via `title` attribute | 0.5j | ✅ |
| S3-12 | Modal tambah menu (nama/harga/deskripsi) | 1j | ✅ |
| S3-13 | Validasi harga Rp 1.000–1.000.000 | 0.5j | ✅ |
| S3-14 | Modal edit menu (pre-filled data) | 1j | ✅ |
| S3-15 | Konfirmasi hapus menu (modal custom, bukan confirm()) | 0.5j | ✅ |
| S3-16 | Tab "Ulasan Konsumen" | 0.5j | ✅ |
| S3-17 | Grafik distribusi rating bintang (bar chart inline) | 1j | ✅ |
| S3-18 | Sorting ulasan (Terbaru/Tertinggi/Terendah) | 0.5j | ✅ |
| S3-19 | Badge "N baru" di tab Ulasan | 0.5j | ✅ |

---

## 6. SPRINT 4 — AI WAF & IT SECURITY
**Estimasi:** 16 jam | **Status:** ✅ Selesai

### 6.1 WAF Engine (`waf.js`)

| ID | Task | Estimasi | Status |
|---|---|---|---|
| S4-01 | Layer 1: regex heuristik XSS patterns | 1j | ✅ |
| S4-02 | Layer 1: regex heuristik SQL Injection patterns | 1j | ✅ |
| S4-03 | Layer 1: regex profanity/cyberbullying Indonesia | 1j | ✅ |
| S4-04 | Layer 2: Gemini Flash-Lite AI scan | 1.5j | ✅ |
| S4-05 | Rate limiter per-IP menggunakan Map | 1j | ✅ |
| S4-06 | Export `recordRequest` dari module.exports | 0.5j | ✅ |
| S4-07 | `addToWhitelist()` function | 0.5j | ✅ |

### 6.2 Portal IT Security (`ItSecPortal.jsx`)

| ID | Task | Estimasi | Status |
|---|---|---|---|
| S4-08 | Buat `ItSecPortal.jsx` dengan dark theme | 1j | ✅ |
| S4-09 | KPI stats cards (dark) | 0.5j | ✅ |
| S4-10 | Counter "N serangan hari ini" vs kemarin | 1j | ✅ |
| S4-11 | Chart aktivitas serangan per jam (24 bar) | 1.5j | ✅ |
| S4-12 | WAF Playground textarea + tombol uji | 0.5j | ✅ |
| S4-13 | `renderConsoleOutput()` dengan syntax highlight per key | 1j | ✅ |
| S4-14 | Animasi THREAT BLOCKED overlay (2 detik) | 1j | ✅ |
| S4-15 | Recent payloads history (max 5 chip) | 0.5j | ✅ |
| S4-16 | Filter chip tabel log (Semua/XSS/SQLi/Profanity) | 1j | ✅ |
| S4-17 | Badge severity HIGH/MED/LOW di tabel | 0.5j | ✅ |
| S4-18 | Tombol copy payload ke clipboard | 0.5j | ✅ |
| S4-19 | Auto-refresh toggle dengan countdown (10s) | 1j | ✅ |
| S4-20 | Timestamp log: tanggal + jam | 0.5j | ✅ |
| S4-21 | Nama officer tampil di header portal | 0.5j | ✅ |
| S4-22 | Toast feedback untuk payload aman/diblokir | 0.5j | ✅ |

---

## 7. SPRINT 5 — PORTAL SUPER ADMIN
**Estimasi:** 12 jam | **Status:** ✅ Selesai

| ID | Task | Estimasi | Status |
|---|---|---|---|
| S5-01 | Buat `SuperAdminPortal.jsx` dengan layout grid | 1j | ✅ |
| S5-02 | Fetch stats real dari `/api/admin/stats` | 1j | ✅ |
| S5-03 | 4 KPI cards dari data aktual | 0.5j | ✅ |
| S5-04 | Donut chart SVG distribusi tipe UMKM | 1.5j | ✅ |
| S5-05 | Loading skeleton saat stats fetch | 0.5j | ✅ |
| S5-06 | Form registrasi UMKM (semua field) | 1j | ✅ |
| S5-07 | Map Picker Leaflet interaktif untuk koordinat | 2j | ✅ |
| S5-08 | Validasi bounding box Gresik | 0.5j | ✅ |
| S5-09 | Reverse geocoding Nominatim → nama wilayah | 1j | ✅ |
| S5-10 | Modal pratinjau sebelum submit | 0.5j | ✅ |
| S5-11 | Search merchant (filter nama/pemilik) | 0.5j | ✅ |
| S5-12 | Badge status aktif/nonaktif visual | 0.5j | ✅ |
| S5-13 | Modal alasan nonaktifkan (dropdown 4 alasan) | 1j | ✅ |
| S5-14 | Tombol edit merchant + auto-fill editLocationName | 1j | ✅ |

---

## 8. SPRINT 6 — KEAMANAN & KUALITAS KODE
**Estimasi:** 10 jam | **Status:** ✅ Selesai

| ID | Task | Estimasi | Status | Catatan |
|---|---|---|---|---|
| S6-01 | Implementasi bcrypt hash di register | 1j | ✅ | Salt 10 |
| S6-02 | bcrypt.compare di login + auto-migrasi password lama | 1j | ✅ | Bonus feature |
| S6-03 | Hapus semua `alert()` native → Toast | 1j | ✅ | Semua portal |
| S6-04 | Hapus semua `confirm()` native → Modal custom | 1j | ✅ | UMKM + Admin |
| S6-05 | Fix `filteredCatalog` duplikasi variabel | 0.5j | ✅ | UmkmPortal |
| S6-06 | Hapus dead code `renderHighlightedJSON` | 0.5j | ✅ | ItSecPortal |
| S6-07 | Fix font size minimum 10px (ganti semua text-[9px]) | 0.5j | ✅ | Semua file |
| S6-08 | Smooth theme transition CSS (200ms) | 0.5j | ✅ | index.css |
| S6-09 | XSS escape di tabel log IT Security | 0.5j | ✅ | |
| S6-10 | Input validation sisi klien (semua form) | 1j | ✅ | |
| S6-11 | EmptyState komponen konsisten semua portal | 1j | ✅ | |
| S6-12 | Hapus folder `public/` legacy | 0.5j | ✅ | Belum dihapus di v3 |
| S6-13 | Fix impor EmptyState (hapus definisi inline WisatawanPortal) | 0.5j | ✅ | |
| S6-14 | Export `recordRequest` dari waf.js | 0.5j | ✅ | |

---

## 9. SPRINT 7 — UI/UX POLISH & IMPROVISASI
**Estimasi:** 14 jam | **Status:** ✅ Selesai

### 9.1 Global

| ID | Task | Estimasi | Status |
|---|---|---|---|
| S7-01 | Toast system (4 tipe: success/error/warning/info) | 1j | ✅ |
| S7-02 | Settings Modal untuk API key (pindah dari sidebar) | 1j | ✅ |
| S7-03 | Onboarding tooltip first-time user | 0.5j | ✅ |
| S7-04 | Breadcrumb portal indicator di header | 0.5j | ✅ |
| S7-05 | Keyboard shortcut Alt+1/2/3/4 | 0.5j | ✅ |
| S7-06 | Skeleton loading screen | 0.5j | ✅ |
| S7-07 | Guest mode label "Halo, Penjelajah! 👋" | 0.5j | ✅ |

### 9.2 Per Portal

| ID | Task | Portal | Estimasi | Status |
|---|---|---|---|---|
| S7-08 | Progress bar anggaran real-time | Wisatawan | 1j | ✅ |
| S7-09 | Hint overlay peta kosong | Wisatawan | 0.5j | ✅ |
| S7-10 | Label rating bintang dinamis | Wisatawan | 0.5j | ✅ |
| S7-11 | Merchant preview card di form review | Wisatawan | 0.5j | ✅ |
| S7-12 | Character counter textarea | Wisatawan | 0.5j | ✅ |
| S7-13 | Tombol "Lihat di Peta" per timeline item | Wisatawan | 1j | ✅ |
| S7-14 | Tombol simpan JSON + salin teks | Wisatawan | 1j | ✅ |
| S7-15 | Badge notif "N baru" tab Ulasan | UMKM | 0.5j | ✅ |
| S7-16 | Search katalog real-time | UMKM | 0.5j | ✅ |
| S7-17 | Chart distribusi rating bintang | UMKM | 1j | ✅ |
| S7-18 | Chart aktivitas serangan 24 jam | IT Security | 1j | ✅ |
| S7-19 | Severity badge HIGH/MED/LOW | IT Security | 0.5j | ✅ |
| S7-20 | Copy payload clipboard | IT Security | 0.5j | ✅ |
| S7-21 | Donut chart tipe UMKM | Super Admin | 1j | ✅ |
| S7-22 | Konfirmasi nonaktifkan dengan alasan | Super Admin | 1j | ✅ |

---

## 10. SPRINT 8 — REACT ROUTER MULTI-PAGE
**Estimasi:** 8 jam | **Status:** ✅ Selesai

| ID | Task | Estimasi | Status | Prioritas |
|---|---|---|---|---|
| S8-01 | Install `react-router-dom` di client/ | 0.5j | ✅ | 🔴 P0 |
| S8-02 | Buat `AppContext.jsx` — pindah semua global state | 2j | ✅ | 🔴 P0 |
| S8-03 | Buat `ProtectedRoute.jsx` dengan role guard | 1j | ✅ | 🔴 P0 |
| S8-04 | Buat `Layout.jsx` — sidebar pakai useNavigate | 1.5j | ✅ | 🔴 P0 |
| S8-05 | Ekstrak `AuthModal.jsx` dari App.jsx | 0.5j | ✅ | 🔴 P0 |
| S8-06 | Ekstrak `SettingsModal.jsx` dari App.jsx | 0.5j | ✅ | 🔴 P0 |
| S8-07 | Buat 4 pages: WisatawanPage, UmkmPage, ItSecPage, AdminPage | 1j | ✅ | 🔴 P0 |
| S8-08 | Update `App.jsx` → hanya berisi `<Routes>` config | 0.5j | ✅ | 🔴 P0 |
| S8-09 | Update `main.jsx` → bungkus `<BrowserRouter>` | 0.5j | ✅ | 🔴 P0 |
| S8-10 | Update `vite.config.js` → `historyApiFallback: true` | 0.5j | ✅ | 🔴 P0 |
| S8-11 | Implementasi role access matrix (addendum) | 1j | ✅ | 🔴 P0 |
| S8-12 | Test semua alur routing (login/logout/protected/refresh) | 1j | ✅ | 🔴 P0 |

---

## 11. SPRINT 9 — FINAL FIX & TESTING
**Estimasi:** 6 jam | **Status:** ✅ Selesai

### 11.1 Fix Wajib Sisa (dari v3)

| ID | Task | Estimasi | Status | Prioritas |
|---|---|---|---|---|
| S9-01 | Export `recordRequest` dari waf.js | 0.25j | ✅ | 🔴 P0 |
| S9-02 | Hapus inline EmptyState di WisatawanPortal | 0.25j | ✅ | 🔴 P0 |
| S9-03 | Hapus folder `public/` legacy | 0.25j | ✅ | 🔴 P0 |

### 11.2 Testing Fungsional

| ID | Task | Estimasi | Status | Jenis Test |
|---|---|---|---|---|
| S9-04 | Test login semua 4 preset akun | 0.5j | ✅ | Manual |
| S9-05 | Test protected route (akses ilegal antar role) | 0.5j | ✅ | Manual |
| S9-06 | Test generate itinerary (AI + simulasi) | 0.5j | ✅ | Manual |
| S9-07 | Test WAF dengan payload XSS, SQLi, profanity | 0.5j | ✅ | Manual |
| S9-08 | Test kirim review (lulus WAF + diblokir WAF) | 0.5j | ✅ | Manual |
| S9-09 | Test CRUD katalog UMKM | 0.5j | ✅ | Manual |
| S9-10 | Test registrasi UMKM (koordinat valid + invalid) | 0.5j | ✅ | Manual |
| S9-11 | Test Mode Simulasi (tanpa API key) | 0.5j | ✅ | Manual |
| S9-12 | Test keyboard shortcut Alt+1/2/3/4 | 0.25j | ✅ | Manual |
| S9-13 | Test refresh halaman — session tetap (localStorage) | 0.25j | ✅ | Manual |
| S9-14 | Test tombol Back/Forward browser | 0.25j | ✅ | Manual |
| S9-15 | Test auto-refresh IT Security (toggle on/off) | 0.25j | ✅ | Manual |

### 11.3 Performance & Final Check

| ID | Task | Estimasi | Status |
|---|---|---|---|
| S9-16 | Cek bundle size setelah build (`npm run build`) | 0.25j | ✅ |
| S9-17 | Cek tidak ada error di browser console | 0.25j | ✅ |
| S9-18 | Cek tidak ada `alert()` / `confirm()` tersisa | 0.25j | ✅ |
| S9-19 | Cek semua Toast muncul dengan benar | 0.25j | ✅ |
| S9-20 | Final review README.md (update screenshot/fitur) | 0.5j | ✅ |

---

## 12. BACKLOG (Future Enhancement)

| ID | Task | Estimasi | Prioritas | Sprint Target |
|---|---|---|---|---|
| BL-01 | Mobile responsive (sidebar collapse + hamburger) | 4j | 🟡 P2 | v3.0 |
| BL-02 | Upload foto menu/produk ke storage | 3j | 🟡 P2 | v3.0 |
| BL-03 | Dark mode untuk portal non-IT Security | 2j | 🟢 P3 | v3.0 |
| BL-04 | Export itinerary ke PDF (html2canvas/jsPDF) | 3j | 🟡 P2 | v2.1 |
| BL-05 | Notifikasi push (review baru untuk UMKM) | 4j | 🟡 P2 | v3.0 |
| BL-06 | Multi-language support (EN/ID) | 3j | 🟢 P3 | v3.0 |
| BL-07 | Peta clustering untuk banyak marker | 1j | 🟡 P2 | v2.1 |
| BL-08 | Fitur "Favorit" itinerary tersimpan | 2j | 🟢 P3 | v3.0 |
| BL-09 | Verifikasi email saat register | 3j | 🟡 P2 | v3.0 |
| BL-10 | Audit log Admin (siapa edit apa kapan) | 2j | 🟡 P2 | v3.0 |
| BL-11 | Unit test backend (Jest) | 4j | 🟡 P2 | v3.0 |
| BL-12 | E2E test (Cypress/Playwright) | 6j | 🟡 P2 | v3.0 |

---

## 13. MATRIKS RISIKO

| ID | Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|---|
| R-01 | Gemini API rate limit saat demo live | Sedang | Tinggi | Mode Simulasi selalu aktif sebagai fallback |
| R-02 | Koordinat merchant tidak akurat | Rendah | Sedang | Validasi bounding box Gresik di backend |
| R-03 | Session hilang saat refresh | Rendah | Tinggi | localStorage persist + auto-read saat load |
| R-04 | React Router 404 saat refresh halaman | Sedang | Sedang | `historyApiFallback: true` di vite.config |
| R-05 | WAF false positive blokir review normal | Rendah | Sedang | Whitelist endpoint + AI layer kedua sebagai buffer |
| R-06 | MySQL tidak tersedia saat demo | Sedang | Tinggi | JSON fallback otomatis |
| R-07 | Browser tidak support clipboard API | Rendah | Rendah | try-catch di handleCopyPayload |

---

## 14. DEFINITION OF DONE (DoD)

Sebuah task dianggap **Done** jika memenuhi semua kriteria berikut:

### Kriteria Kode
- [ ] Tidak ada error di browser console
- [ ] Tidak ada warning TypeScript/ESLint yang kritikal
- [ ] Tidak menggunakan `alert()`, `confirm()`, atau `console.log` yang tertinggal
- [ ] Font size minimum 10px
- [ ] Semua string pesan dalam bahasa Indonesia

### Kriteria Fungsional
- [ ] Fitur berjalan di Mode Simulasi (tanpa API key)
- [ ] Fitur berjalan dengan Gemini API key aktif
- [ ] Error state ditangani dengan Toast atau pesan yang informatif
- [ ] Loading state ditampilkan selama proses async

### Kriteria UI/UX
- [ ] Menggunakan design tokens yang konsisten (warna, font, border-radius)
- [ ] Toast notification muncul untuk semua aksi penting
- [ ] Tombol icon-only memiliki `title` attribute
- [ ] EmptyState tampil saat data kosong

### Kriteria Keamanan
- [ ] Input divalidasi sisi klien dan sisi server
- [ ] Password tidak pernah disimpan plain text
- [ ] Data sensitif (alergi) dienkripsi AES-256

---

## 15. REKAP TOTAL JAM

| Kategori | Jam Estimasi | Jam Aktual | Delta |
|---|---|---|---|
| Setup & Fondasi | 8j | ~8j | 0 |
| Backend Core | 16j | ~17j | +1j |
| Portal Wisatawan | 20j | ~21j | +1j |
| Portal UMKM | 14j | ~13j | -1j |
| AI WAF & IT Security | 16j | ~16j | 0 |
| Portal Super Admin | 12j | ~12j | 0 |
| Keamanan & Kualitas | 10j | ~9j | -1j |
| UI/UX Polish | 14j | ~14j | 0 |
| React Router | 8j | ⏳ TBD | - |
| Final Testing | 6j | ⏳ TBD | - |
| **TOTAL** | **~124j** | **~110j** | **-14j** |

---

*Dokumen ini adalah task breakdown lengkap proyek Grestrip v2.0.0*
*Dibuat sebagai bagian dari submission #JuaraVibeCoding 2026*
*Last updated: Mei 2026*
