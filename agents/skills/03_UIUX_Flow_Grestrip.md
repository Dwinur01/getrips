# 🎨 UI/UX FLOW DOCUMENT
## Grestrip Smart & Secure Navigator
**Versi:** 2.0.0 | **Tool Referensi:** Figma / Miro

---

## 1. PRINSIP DESAIN

### 1.1 Design System
| Token | Nilai |
|---|---|
| Primary | `#006666` (Teal Gresik) |
| Primary Light | `#e0f2f1` |
| Primary Dark | `#004d4d` |
| Secondary | `#e05624` (Oranye Aksen) |
| Background Light | `#f3f6f6` |
| Background Dark | `#090d10` (IT Security) |
| Font Display | Outfit (heading, KPI) |
| Font Sans | Inter (body, label) |
| Border Radius | `rounded-2xl` (16px) standar |
| Shadow | `shadow-soft` untuk card |

### 1.2 Prinsip UX
1. **Hierarchy Role** — setiap role mendapat pengalaman yang disesuaikan
2. **AI First** — fitur AI selalu terlihat dan mudah diakses
3. **Feedback Instan** — setiap aksi direspons dengan Toast/loading/animasi
4. **Graceful Degradation** — Mode Simulasi aktif otomatis jika API tidak tersedia
5. **Security Visible** — keamanan WAF dikomunikasikan secara visual kepada user

---

## 2. FLOW NAVIGASI GLOBAL

```
                    ┌─────────────────────────────────────────┐
                    │         LANDING: / atau /wisatawan       │
                    │   (Public - semua bisa akses tanpa login) │
                    └──────────────┬──────────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────────┐
                    │         Klik "Daftar / Masuk"            │
                    │         Auth Modal (Login/Register)       │
                    └───┬───────────┬──────────┬──────────────┘
                        │           │          │           │
                  role: wisatawan  umkm      itsec    superadmin
                        │           │          │           │
                        ▼           ▼          ▼           ▼
                  /wisatawan    /umkm       /itsec       /admin
                  (tetap di    (+ akses    (akses      (+ akses
                   sini)       /wisatawan)  semua)      /umkm &
                                                       /wisatawan)
```

---

## 3. FLOW HALAMAN LOGIN / REGISTER

### 3.1 State Diagram Modal Auth
```
[Sidebar: Tombol "Daftar / Masuk"]
           │
           ▼
[Modal terbuka — default: Tab Login]
           │
    ┌──────┴──────┐
    │             │
[Form Login]  [Form Register]
    │             │
    │   ┌─────────┴──────────┐
    │   │ Isi: Nama lengkap  │
    │   │ Pilih role         │
    │   │ Username, Password │
    │   └─────────┬──────────┘
    │             │
    │        [Validasi] ──error──► [Tampil pesan inline]
    │             │
    │        [POST /api/auth/register]
    │             │
    │        [Toast: "Akun berhasil dibuat!"]
    │             │
    │        [Auto-switch ke Tab Login]
    │             │
    ├─────────────┘
    │
    │ Isi: Username, Password
    │ ATAU klik Preset Akun Demo (4 tombol)
    │
    [POST /api/auth/login]
    │
    ├──error──► [Tampil error di modal: "Username atau password salah"]
    │
    [handleLoginSuccess()]
    │
    [localStorage.setItem('grestrip_user', userData)]
    │
    [Modal tutup + navigate ke URL role]
    │
    ├─► /wisatawan  (role: wisatawan)
    ├─► /umkm       (role: umkm)
    ├─► /itsec      (role: itsec)
    └─► /admin      (role: superadmin)
```

### 3.2 Komponen Modal Auth
```
┌─────────────────────────────────────────────────┐
│  ✕                                               │
│                                                  │
│       🌿  Masuk ke Grestrip                      │
│       "Gunakan kredensial terdaftar..."          │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ 🔴 Username atau password salah (error)  │    │  ← Hanya muncul jika error
│  └──────────────────────────────────────────┘    │
│                                                  │
│  Username: [👤 ___________________________]      │
│  Password: [🔒 ___________________________]      │
│                                                  │
│  [        Masuk Sekarang        ]                │
│                                                  │
│  ─── Preset Akun Demo Instan ────                │
│  [Budi (Wisatawan)]  [Haji Azza (UMKM)]          │
│  [Satria (IT Cybersec)] [Dinas (Admin)]          │
│                                                  │
│  Belum punya akun? [Daftar Sekarang]             │
└─────────────────────────────────────────────────┘
```

---

## 4. FLOW PORTAL WISATAWAN (/wisatawan)

### 4.1 Layout Halaman
```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR (260px fixed)     │  MAIN CONTENT (flex-grow)           │
│                           │                                     │
│  🌿 Grestrip              │  Grestrip / 🗺️ Portal Wisatawan     │
│  Secure Navigator         │  (Breadcrumb)                       │
│                           │                                     │
│  👋 Halo, Penjelajah!     │  ┌─── Welcome Banner (guest only) ──┐│
│  (atau: User Profile)     │  │ 🌿 Selamat Datang di Grestrip!   ││
│                           │  │ [Daftar Akun Baru →]            ││
│  ● Wisatawan  (aktif)     │  └────────────────────────────────┘│
│  🔒 Pemilik UMKM          │                                     │
│  🔒 IT Security           │  ┌── Panel Kiri ──┐  ┌─ Panel Kanan ┐│
│  🔒 Super Admin           │  │ Rancang        │  │              ││
│                           │  │ Perjalanan     │  │  TAB:        ││
│                           │  │                │  │  [🗺️ Peta]  ││
│  [Daftar / Masuk]         │  │ • Budget       │  │  [📋 Timeline]│
│                           │  │ • Durasi       │  │  [⭐ Ulasan] ││
│  ─────────────────        │  │ • Preferensi   │  │              ││
│  #JuaraVibeCoding 2026    │  │ • Alergi       │  │  (konten tab ││
│  v2.0.0 • Google Cloud ⚙️ │  │                │  │   aktif)     ││
│                           │  │ [🔄 Reset]     │  │              ││
│                           │  │ [✨ Rangkai AI]│  └─────────────┘│
│                           │  │                │                  │
│                           │  │ Progress Bar   │                  │
│                           │  │ Anggaran       │                  │
│                           │  └────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Flow Tab Peta Rute
```
[Tab Peta aktif — default]
        │
        ▼
[Peta Leaflet render: semua marker merchant]
        │
        ├─► Marker diklik → Popup: nama, rating, tipe
        │
        └─► Hint overlay: "💡 Buat itinerary untuk melihat rute" (sebelum generate)
```

### 4.3 Flow Tab Timeline
```
[Klik "✨ Rangkai Rute dengan AI"]
        │
        ▼
[Validasi budget, durasi, preferensi]
        │
        ▼
[Loading: spinner + "AI sedang merencanakan..."]
        │
    [API call POST /api/itinerary]
        │
    ┌───┴───┐
[Mode AI]   [Mode Simulasi]
    │           │
    └─────┬─────┘
          │
[setItinerary(data)]
          │
[triggerConfetti() — 2.5 detik]
          │
[Auto-switch ke Tab Timeline]
          │
[Tampil: Summary badge (hari/aktivitas/durasi/biaya)]
          │
[Progress Bar Anggaran: hijau/kuning/merah]
          │
[Filter Chip: Default | Terdekat | Termurah | Terbagus]
          │
[Timeline Card per item]
    ├─ Waktu, Lokasi, Aktivitas, Biaya
    ├─ Deskripsi
    └─ [📍 Lihat di Peta] → switch tab + zoom map
          │
[Tombol bawah]
    ├─ [⬇️ Simpan JSON]
    └─ [📋 Salin Teks]
```

### 4.4 Flow Tab Ulasan
```
[Tab Ulasan aktif]
        │
        ▼
[Dropdown: Filter by Merchant]
        │
[Preview card merchant terpilih]
        │
[Form Review]
    ├─ Nama (auto-fill jika login)
    ├─ Rating bintang ★★★★★ + label "5 — Sangat Puas"
    ├─ Textarea (counter: 0/1000)
    └─ [Kirim Ulasan]
              │
      [POST /api/reviews + WAF scan]
              │
          ┌───┴───┐
       [Lulus]    [Diblokir]
          │           │
   [Toast ✅]    [Modal WAF Block]
          │       (detail ancaman)
   [List review update]
```

---

## 5. FLOW PORTAL UMKM (/umkm)

### 5.1 Layout Halaman
```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR                   │  MAIN CONTENT                       │
│  ● Wisatawan              │  Grestrip / 🏪 Dashboard UMKM       │
│  ● Pemilik UMKM (aktif)   │                                     │
│  🔒 IT Security           │  [Selector Merchant ▾] (auto-select)│
│  🔒 Super Admin           │                                     │
│                           │  ┌── KPI Row (4 card) ─────────────┐│
│                           │  │ Total Ulasan | Rating | Total    ││
│                           │  │              |        | Menu     ││
│                           │  │              |        | Avg Harga││
│                           │  └───────────────────────────────── ┘│
│                           │                                     │
│                           │  ┌── Gauge Sentimen ─┐ ┌─ Katalog ─┐│
│                           │  │ 🔄 Refresh        │ │ 🔍 Search ││
│                           │  │ [Speedometer SVG] │ │ [+Tambah] ││
│                           │  │ 78% Positif       │ │ List item ││
│                           │  │ "Sangat Puas"     │ │ ✏️ 🗑️    ││
│                           │  │ "Tingkatkan..."   │ │           ││
│                           │  │ dari N ulasan     │ └───────────┘│
│                           │  └───────────────────┘              │
│                           │                                     │
│                           │  ┌── Tab: [Dashboard] [Ulasan 3 baru]┐│
│                           │  │ (konten tab aktif)               ││
│                           │  └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Flow Tab Ulasan Konsumen
```
[Klik tab "Ulasan Konsumen"]
        │
[setLastSeenCount(merchantReviews.length)] ← badge baru clear
        │
[Grafik distribusi rating]
    ├─ Skor besar (4.8)
    ├─ Bar chart 5★→1★
    └─ "dari 23 ulasan"
        │
[Sort chip: 🕐 Terbaru | ⭐ Tertinggi | ▼ Terendah]
        │
[List review cards]
    ├─ Nama, bintang, tanggal
    └─ Teks ulasan (plain, tidak ada markup)
```

### 5.3 Flow Tambah Menu Katalog
```
[Klik "+ Tambah Menu Baru"]
        │
[Modal form terbuka]
    ├─ Nama menu
    ├─ Harga (validasi: Rp 1.000 – 1.000.000)
    └─ Deskripsi
        │
[Klik Simpan]
        │
[Validasi sisi klien] ──error──► [Toast warning]
        │
[POST /api/merchants/:id/catalog]
        │
[Toast: "Menu berhasil ditambahkan! 🍽️"]
        │
[List katalog update — item baru di atas atau bawah]
```

---

## 6. FLOW PORTAL IT SECURITY (/itsec)

### 6.1 Layout Halaman (Dark Theme)
```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR (dark)            │  MAIN CONTENT (dark bg #090d10)     │
│  ● Wisatawan              │  Grestrip / 🛡️ IT Security Center   │
│  ● Pemilik UMKM           │                                     │
│  ● IT Security (aktif)    │  [Officer: Satria | IT Sec Officer] │
│  ● Super Admin            │  [🛡️ 7 serangan diblokir hari ini ▲]│
│                           │                                     │
│  [Keluar (Logout)]        │  ┌── KPI Cards (dark) ─────────────┐│
│                           │  │ Total Blokir | XSS | SQLi | ...  ││
│                           │  └──────────────────────────────────┘│
│                           │                                     │
│                           │  ┌── Chart 24 Jam ─────────────────┐│
│                           │  │ Bar chart aktivitas serangan     ││
│                           │  │ 00:00────06:00────12:00────24:00 ││
│                           │  └──────────────────────────────────┘│
│                           │                                     │
│                           │  ┌── WAF Playground ───────────────┐│
│                           │  │ [Textarea payload]              ││
│                           │  │ Recent: [xss] [sqli] [...]      ││
│                           │  │ [Uji Sekarang]                  ││
│                           │  │ Console output (syntax color)   ││
│                           │  └──────────────────────────────────┘│
│                           │                                     │
│                           │  ┌── Threat Log ───────────────────┐│
│                           │  │ Filter: [Semua][XSS][SQLi][...]  ││
│                           │  │ [Auto OFF ▶] toggle             ││
│                           │  │ Tabel: time|type|HIGH|payload📋  ││
│                           │  └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Flow WAF Test (Happy Path & Blocked)
```
[Ketik payload di textarea]
        │
[Chip recent payloads update]
        │
[Klik "Uji Sekarang"]
        │
[Console: "AI WAF sedang menganalisis..."]
        │
[POST /api/waf/test]
        │
    ┌───┴────────────────┐
[Blocked = true]    [Blocked = false]
    │                    │
[setSysStatus('blocked')]  [setSysStatus('secure')]
[Animasi THREAT BLOCKED]   [Toast: "Payload bersih ✅"]
[Status bar: merah]        [Console: hijau]
[Toast: "Ancaman XSS 🛡️"] [Status bar: hijau]
    │                    │
    └────────┬───────────┘
             │
[Simpan ke recentPayloads (max 5)]
[Tabel log update]
```

---

## 7. FLOW PORTAL SUPER ADMIN (/admin)

### 7.1 Layout Halaman
```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR                   │  MAIN CONTENT                       │
│  ● Wisatawan              │  Grestrip / ⚙️ Super Admin          │
│  ● Pemilik UMKM           │                                     │
│  🔒 IT Security           │  ┌── KPI Row (4 card real) ────────┐│
│  ● Super Admin (aktif)    │  │ Merchant | Reviews | Rating |    ││
│                           │  │          |         | Threats     ││
│                           │  └──────────────────────────────────┘│
│                           │                                     │
│                           │  ┌── Donut Chart ───┐ ┌─ Form Reg ─┐│
│                           │  │ Distribusi Tipe  │ │ Nama Usaha ││
│                           │  │ Kuliner: 5 (71%) │ │ Pemilik    ││
│                           │  │ Wisata: 2 (29%)  │ │ Tipe ▾     ││
│                           │  └──────────────────┘ │ Koordinat  ││
│                           │                       │ [Pilih Peta]││
│                           │                       │ 📍 Lokasi  ││
│                           │                       │ Deskripsi  ││
│                           │                       │ [Pratinjau]││
│                           │                       └────────────┘│
│                           │                                     │
│                           │  ┌── Daftar UMKM Terdaftar ────────┐│
│                           │  │ 🔍 Cari nama atau pemilik...    ││
│                           │  │ ● Nasi Krawu Bu Azza  [kuliner]  ││
│                           │  │   Ibu Azza          ✏️ ⏸️       ││
│                           │  │ ⏸ Warung XYZ  [⏸ Nonaktif]      ││
│                           │  └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Flow Registrasi UMKM dengan Map Picker
```
[Isi form: nama, pemilik, tipe, deskripsi]
        │
[Klik "📍 Pilih di Peta"]
        │
[Modal Map Picker Leaflet terbuka]
        │
[Klik lokasi di peta]
        │
[setLat(), setLng()]
        │
[GET Nominatim reverse geocode]
        │
[Tampil: "📍 Kecamatan Gresik, Kabupaten Gresik"]
        │
[Konfirmasi lokasi → Modal tutup]
        │
[Klik "Pratinjau Legalitas"]
        │
[Modal Preview terbuka: semua data + nama wilayah]
        │
[Klik "Ya, Daftarkan!"]
        │
[Validasi bounding box Gresik]
        │
    ┌───┴────────────────────┐
[Di luar bbox]          [Di dalam bbox]
    │                       │
[Toast warning]         [POST /api/admin/merchants]
[Modal tutup]               │
                       [Toast: "UMKM didaftarkan!"]
                       [onRefresh()]
```

### 7.3 Flow Nonaktifkan Merchant
```
[Klik ⏸️ di baris merchant]
        │
[Modal: "Alasan Nonaktifkan" terbuka]
    ├─ [Sedang renovasi]
    ├─ [Pelanggaran SOP]
    ├─ [Permintaan pemilik]
    └─ [Tidak aktif 30 hari]
        │
[Pilih alasan + klik "Ya, Nonaktifkan"]
        │
[PUT /api/admin/merchants/:id → status: nonaktif]
        │
[Toast: "Merchant dinonaktifkan"]
        │
[Card merchant: greyed out + badge "⏸ Nonaktif"]
```

---

## 8. MICRO-INTERACTIONS & FEEDBACK STATES

### 8.1 Toast System
```
Tipe       Warna        Icon         Contoh Pesan
───────────────────────────────────────────────────────────
success    #006666 teal  ✅ CheckCircle  "Itinerary berhasil dibuat!"
error      #dc2626 red   ✖ XCircle      "Konten diblokir WAF"
warning    #f59e0b amber ⚠ AlertTriangle "Koordinat di luar Gresik"
info       #2563eb blue  ℹ Info          "Payload bersih ✅"

Posisi: fixed bottom-5 right-5
Durasi: 3.5 detik → fade out
Animasi: slide dari kanan
```

### 8.2 Loading States
```
Komponen              State Loading
─────────────────────────────────────────────────────────
Halaman pertama       Skeleton layout (4 card + map placeholder)
Generate Itinerary    Spinner + "AI sedang merencanakan..."
Sentimen Gauge        Spinner di tengah speedometer
Tombol Submit         Loader2 spin + "Memproses..."
Donut Chart Stats     Spinner di dalam card
```

### 8.3 Animasi Khusus
```
Event                    Animasi
────────────────────────────────────────────────────────
Itinerary berhasil       Confetti 30 pieces, 2.5 detik, lalu auto-switch tab
WAF blokir payload       Overlay THREAT BLOCKED + ShieldAlert bounce, 2 detik
Modal buka               animate-scale-in (scale 0.9 → 1.0)
Toast masuk              animate-slide-in (dari kanan)
Chip badge baru          animate-pulse (merah) di tab Ulasan UMKM
IT Security portal       Tema berubah full dark dengan transisi 300ms
```

---

## 9. EMPTY STATES

```
Halaman           Kondisi              Ikon         Teks
────────────────────────────────────────────────────────────────────
Wisatawan         Belum generate       ListTodo     "Belum ada rencana"
                  itinerary                         "Klik 'Rangkai Rute' untuk memulai"
Wisatawan         Review kosong        MessageSquare "Belum ada ulasan"
                                                    "Jadilah yang pertama!"
UMKM              Katalog kosong       ShoppingBag  "Katalog masih kosong"
                                                    "Tambahkan menu pertama Anda"
UMKM              Ulasan kosong        Star         "Belum ada ulasan"
                                                    "Konsumen belum memberikan ulasan"
IT Security       Log kosong           Shield       "Sistem Aman"
                                                    "Tidak ada ancaman terdeteksi"
Super Admin       Merchant kosong      Store        "Belum ada UMKM"
                                                    "Daftarkan UMKM pertama"
```

---

## 10. RESPONSIVITAS (BREAKPOINTS)

```
Breakpoint    Behavior
────────────────────────────────────────────────────────
< 1280px      Sidebar overlap (saat ini belum mobile responsive)
1280px+       Sidebar fixed 260px, main content ml-260px (current)
1440px+       Layout optimal, semua grid tampil penuh
```

> **Catatan:** Aplikasi ini dirancang **desktop-first** untuk kompetisi.
> Mobile responsiveness adalah enhancement future.

---

*Dokumen ini menjadi referensi desain dan flow untuk development dan testing*
*Dibuat sebagai bagian dari submission #JuaraVibeCoding 2026*
