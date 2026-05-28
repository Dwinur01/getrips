# 📐 SYSTEM SEQUENCE DIAGRAM (SSD)
## Grestrip Smart & Secure Navigator
**Versi:** 2.0.0 | **Notasi:** PlantUML / Text-based UML

---

## CARA MEMBACA SSD INI
- `Actor →` : Aktor mengirim request ke sistem
- `System →` : Sistem merespons balik ke aktor
- `System ⟶` : Sistem berkomunikasi ke layanan eksternal
- `[alt]` : Kondisi alternatif / cabang logika
- `[loop]` : Pengulangan

---

## SSD-01: ALUR REGISTRASI DAN LOGIN

```
Actor: Pengguna Baru
Sistem: Frontend (React) + Backend (Express) + Database

Pengguna    Frontend           Backend            Database
   │            │                  │                  │
   │──[Buka /wisatawan]──►│                  │                  │
   │            │──[Render halaman]──►       │                  │
   │            │◄──[Tampil modal login]──   │                  │
   │            │                  │                  │
   │──[Isi form register: nama, username, password, role]──►│   │
   │            │──POST /api/auth/register──►│                  │
   │            │                  │──[Validasi input]         │
   │            │                  │──[bcrypt.hash(pw, 10)]    │
   │            │                  │──[addUser()]──────────────►│
   │            │                  │◄──[user saved]────────────│
   │            │◄──[200 OK: "Berhasil daftar"]──│             │
   │◄──[Toast: "Akun berhasil dibuat!"]──│       │             │
   │            │                  │                  │
   │──[Isi form login: username, password]──►│  │                  │
   │            │──POST /api/auth/login─────►│                  │
   │            │                  │──[getUser(username)]──────►│
   │            │                  │◄──[userData]──────────────│
   │            │                  │──[bcrypt.compare(pw, hash)]│
   │            │                  │                  │
   │            │         [alt: password salah]       │
   │            │◄──[401: "Username atau password salah"]─│    │
   │◄──[Tampil error di modal]──────│       │                  │
   │            │         [end alt]           │                  │
   │            │                  │                  │
   │            │◄──[200 OK: {user: {...}}]───│                  │
   │            │──[localStorage.setItem('grestrip_user')]       │
   │            │──[navigate('/umkm' | '/itsec' | '/admin')]     │
   │◄──[Halaman portal sesuai role]──│      │                  │
```

---

## SSD-02: ALUR GENERATE AI ITINERARY

```
Actor: Wisatawan (login atau guest)
Sistem: Frontend + Backend + Gemini AI API

Wisatawan   Frontend           Backend          Gemini API       Database
   │            │                  │                  │               │
   │──[Isi: budget, durasi, preferensi, alergi]──►│  │               │
   │──[Klik "Rangkai Rute dengan AI"]──►│         │  │               │
   │            │──[Validasi: budget 10k-1jt, durasi 1-7]           │
   │            │──POST /api/itinerary──────────────►│  │           │
   │            │                  │                  │               │
   │            │         [alt: Mode Simulasi / tanpa API key]        │
   │            │                  │──[generateMockItinerary()]──────►│
   │            │                  │◄──[merchantsData]───────────────│
   │            │                  │──[Filter alergi berbasis tag]    │
   │            │                  │──[Build timeline lokal]          │
   │            │         [else: API key tersedia]    │               │
   │            │                  │──[cek cache itinerary]           │
   │            │                  │                  │               │
   │            │                  │   [alt: cache hit]│               │
   │            │                  │──[return cached]  │               │
   │            │                  │   [else: cache miss]              │
   │            │                  │──[Prompt Gemini]──►│              │
   │            │                  │                  │──[Proses AI]  │
   │            │                  │◄──[JSON itinerary]─│              │
   │            │                  │──[Simpan ke cache]  │              │
   │            │         [end alt]           │                │       │
   │            │                  │                  │               │
   │            │◄──[200 OK: {timeline, totalCost}]───│               │
   │            │──[setItinerary(data)]         │                │    │
   │            │──[triggerConfetti()]          │                │    │
   │            │──[auto-switch tab Timeline]  │                │    │
   │◄──[Confetti + Timeline tampil + Progress bar anggaran]──│       │
```

---

## SSD-03: ALUR KIRIM REVIEW dengan WAF PROTECTION

```
Actor: Wisatawan
Sistem: Frontend + Backend + WAF Engine + Gemini AI

Wisatawan   Frontend         Backend          WAF Engine      Gemini AI
   │            │                │                 │                │
   │──[Isi form review: merchant, rating, teks]──►││               │
   │──[Klik "Kirim Ulasan"]──►  │                │                 │
   │            │──[Validasi: text≤1000, rating 1-5]               │
   │            │──POST /api/reviews───────────────►│               │
   │            │                │──[scanHeuristics(text)]──────────►│
   │            │                │                │──[Cek regex XSS/SQLi/profanity]
   │            │                │                │                 │
   │            │     [alt: Heuristik mendeteksi ancaman]           │
   │            │                │◄──[blocked: true, type, reason]──│
   │            │◄──[403: "Konten diblokir WAF"]───│               │
   │◄──[Modal WAF Block muncul]──│                │                │
   │            │     [else: Heuristik aman, lanjut AI layer]       │
   │            │                │──[scanWAF(text, geminiKey)]──────►│
   │            │                │                │──[kirim ke Gemini]──►│
   │            │                │                │◄──[respons AI]──────│
   │            │                │◄──[blocked: false, score]────────│
   │            │     [else: AI juga aman]          │                │
   │            │                │──[db.addReview({...encryptedAllergies})]
   │            │◄──[201: review saved]────────────│               │
   │◄──[Toast: "Ulasan lolos WAF! ✅"]──│          │               │
   │            │     [end alt]          │                │        │
```

---

## SSD-04: ALUR WAF PLAYGROUND (IT Security)

```
Actor: IT Security Officer
Sistem: Frontend + Backend + WAF Engine

IT Officer  Frontend         Backend          WAF Engine
   │            │                │                 │
   │──[Ketik payload di textarea]──►│             │
   │──[Klik "Uji Sekarang"]──────►  │             │
   │            │──[Validasi: payload tidak kosong]│
   │            │──POST /api/waf/test──────────────►│
   │            │                │──[checkRateLimit(ipAddress)]───►│
   │            │                │                │──[cek Map per IP]
   │            │     [alt: Rate limit terlampaui] │
   │            │◄──[429: "Terlalu banyak request"]│
   │◄──[Toast warning: "Rate limit"]───│           │
   │            │     [else: dalam batas]           │
   │            │                │──[scanWAF(payload, key)]────────►│
   │            │                │                │──[Layer 1: Heuristik]
   │            │                │                │──[Layer 2: AI (jika key ada)]
   │            │◄──[200: {isBlocked, type, highlight, reason}]─────│
   │            │──[renderConsoleOutput() berwarna] │
   │            │                │
   │            │     [alt: isBlocked = true]
   │            │──[setSysStatus('blocked')]
   │            │──[setShieldAnim(true)]
   │◄──[Animasi THREAT BLOCKED + status merah]──│
   │            │     [else: aman]
   │            │──[setSysStatus('secure')]
   │◄──[Toast: "Payload bersih ✅"]──│
   │            │     [end alt]
   │            │──[setRecentPayloads(update 5 terakhir)]
```

---

## SSD-05: ALUR REGISTRASI UMKM (Super Admin)

```
Actor: Super Admin (Dinas Pariwisata)
Sistem: Frontend + Backend + Nominatim API + Database

Admin       Frontend         Backend        Nominatim       Database
   │            │                │                │               │
   │──[Isi form: nama, pemilik, tipe, deskripsi]──►│             │
   │──[Klik "Pilih di Peta"]────►│               │               │
   │            │──[Tampil Leaflet Map Picker]     │               │
   │──[Klik lokasi di peta]─────►│               │               │
   │            │──GET Nominatim reverse geocode──►│               │
   │            │                │────────────────►│──[Proses]     │
   │            │◄──[nama kelurahan/kecamatan]─────│               │
   │◄──[Field koordinat terisi + preview wilayah]──│               │
   │            │                │               │               │
   │──[Klik "Pratinjau Legalitas"]──►│           │               │
   │◄──[Modal konfirmasi tampil: semua data]───── │               │
   │            │                │               │               │
   │            │   [alt: koordinat di luar Gresik]               │
   │◄──[Toast warning: "Koordinat harus dalam wilayah Gresik"]    │
   │            │   [else: koordinat valid]       │               │
   │──[Klik "Ya, Daftarkan!"]───►│               │               │
   │            │──POST /api/admin/merchants──────►│               │
   │            │                │──[Validasi bounding box]       │
   │            │                │──[db.addMerchant()]────────────►│
   │            │◄──[201: merchant saved]─────────│               │
   │◄──[Toast: "UMKM berhasil didaftarkan!"]───── │               │
   │            │──[onRefresh() — reload data]     │               │
   │            │   [end alt]    │               │               │
```

---

## SSD-06: ALUR ANALISIS SENTIMEN UMKM

```
Actor: Pemilik UMKM
Sistem: Frontend + Backend + Gemini AI

UMKM        Frontend         Backend          Gemini AI
   │            │                │                 │
   │──[Login → redirect /umkm]──►│               │
   │            │──[Auto-select merchant milik user]
   │            │──GET /api/merchants──────────────►│
   │            │◄──[merchantsData]────────────────│
   │            │──[find merchant by owner/username]│
   │            │──GET /api/sentiment/:merchantId──►│
   │            │                │──[db.getReviews(merchantId)]     │
   │            │                │──[Siapkan prompt analisis]        │
   │            │                │──[kirim ke Gemini]───────────────►│
   │            │                │◄──[JSON: score, label, saran]────│
   │            │◄──[200: sentimentData]────────────│               │
   │◄──[Gauge sentimen animasi + label + saran]────│               │
   │            │                │                 │
   │──[Klik tombol Refresh]─────►│               │
   │            │──[setIsFetchingSentiment(true) → spinner]
   │            │──GET /api/sentiment/:merchantId (ulang)──────────►│
   │◄──[Gauge update dengan data baru]────────────│               │
```

---

## SSD-07: ALUR AKSES HALAMAN PROTECTED ROUTE

```
Actor: Pengguna (berbagai role)
Sistem: React Router + ProtectedRoute + AppContext

Pengguna   Browser URL         ProtectedRoute    AppContext
   │            │                    │                 │
   │──[Ketik /umkm di address bar]──►│               │
   │            │──[React Router render]──────────────►│
   │            │                    │──[useApp() → ambil user]──►│
   │            │                    │◄──[user data]──────────────│
   │            │                    │                 │
   │            │         [alt: user = null (belum login)]
   │            │                    │──[<Navigate to="/wisatawan" />]
   │◄──[Redirect ke /wisatawan]──────│               │
   │            │         [alt: user.role = 'wisatawan' (tidak punya akses)]
   │            │                    │──[canAccess('umkm') = false]
   │◄──[Tampil halaman "Akses Ditolak" + pesan role]──│
   │            │         [else: role sesuai (umkm/itsec/superadmin)]
   │            │                    │──[canAccess('umkm') = true]
   │◄──[Render <UmkmPage />]──────────│               │
   │            │         [end alt]  │                 │
```

---

## SSD-08: ALUR AUTO-REFRESH IT SECURITY

```
Actor: IT Security Officer (pasif)
Sistem: Frontend (useEffect timer) + Backend

IT Officer  Frontend         Backend
   │            │                │
   │──[Toggle "Auto ON"]────────►│
   │            │──[setAutoRefresh(true)]
   │            │──[setInterval 10s → setInterval 1s countdown]
   │            │                │
   │            │   [loop: setiap 10 detik]
   │            │──GET /api/threats + /api/quota───►│
   │            │◄──[threatsData + quotaData]────────│
   │            │──[update tabel + gauge + counter]   │
   │◄──[UI update otomatis: "7 serangan, Auto ON (3s)"]│
   │            │   [end loop]   │
   │            │                │
   │──[Toggle "Auto OFF"]───────►│
   │            │──[clearInterval() semua]
   │◄──[Badge: "Auto OFF"]──────│
```

---

*SSD ini menggunakan notasi UML sequence diagram yang disederhanakan*
*Untuk rendering diagram visual, paste ke PlantUML atau draw.io*
