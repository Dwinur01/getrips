# 🗺️ Grestrip Smart & Secure Navigator
### *Platform Wisata Gresik Terintegrasi, Pemberdayaan UMKM, dan Keamanan AI WAF (Web Application Firewall)*

---

[![Vibe Coding 2026](https://img.shields.io/badge/Vibe_Coding-2026-teal.svg?style=flat-square)](https://github.com/Dwinur01/getrips)
[![AI Powered](https://img.shields.io/badge/AI-Gemini_2.5_Flash-orange.svg?style=flat-square)](https://ai.google.dev/)
[![Database Mode](https://img.shields.io/badge/Database-MySQL_/_JSON_Fallback-blue.svg?style=flat-square)](https://mysql.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

**Grestrip Smart & Secure Navigator** adalah platform pariwisata digital modern yang dirancang khusus untuk mempromosikan destinasi wisata dan memberdayakan pelaku UMKM di wilayah Kabupaten Gresik. Platform ini mengintegrasikan **AI Generatif (Google Gemini)** dengan **Sistem Keamanan Siber Tingkat Tinggi** untuk menghadirkan pengalaman pengguna yang cerdas, inklusif, terlindungi, dan interaktif.

Platform ini mengusung arsitektur tangguh dengan **Dual-Mode Database Engine** (MySQL dengan Fallback JSON) serta pelindung input **AI WAF** untuk menyaring ancaman siber seperti Cross-Site Scripting (XSS), SQL Injection (SQLi), dan perundungan siber (*cyberbullying*).

---

## 🎯 Fitur Utama & Pembagian Portal

Platform ini dibagi menjadi **4 Portal Utama** yang melayani peran berbeda secara mulus:

### 1. 🚶 Portal Wisatawan (Smart Traveler Portal)
* **Peta Interaktif Leaflet.js**: Navigasi visual lokasi UMKM Kuliner dan Destinasi Wisata riil di Gresik secara presisi.
* **AI Itinerary Planner (Gemini 2.5 Flash)**: Menyusun rencana liburan kustom berdasarkan durasi hari, total anggaran, serta preferensi kategori perjalanan.
* **Data Privacy Guard (Alergen Auto-Filter)**: 
  > [!IMPORTANT]
  > Ketika wisatawan menginput riwayat medis atau alergi makanan (seperti alergi *seafood* atau kacang), sistem otomatis mengenkripsi data tersebut dengan **AES-256** dan menginstruksikan Gemini untuk mengganti rekomendasi hidangan/destinasi yang memicu alergi dengan menu alternatif yang 100% aman bagi wisatawan.

### 2. 🏪 Portal Pemilik UMKM (Merchant & Dashboard Analytics)
* **Manajemen Katalog Mandiri**: Memungkinkan UMKM memperbarui daftar produk, harga, dan deskripsi produk secara berkala.
* **AI Sentiment Analytics**: Menggunakan Gemini untuk menganalisis tumpukan ulasan konsumen, menghasilkan skor sentimen (0-100), visualisasi persentase rating positif/negatif, serta memberikan *Key Takeaways* (saran taktis bisnis).

### 3. 🛡️ Portal IT Security (Cyber Threat Monitoring Console)
* **Visualisasi Log Serangan Siber**: Memantau percobaan peretasan secara *real-time* yang dihentikan oleh AI WAF.
* **WAF Playground**: Sandbox bagi tim keamanan untuk menguji payload string (seperti skrip XSS atau injeksi database SQL) dan melihat bagaimana AI merespons.
* **Rate Limiter Monitor**: Melacak sisa kuota API Google AI Studio (15 Requests Per Minute - RPM) untuk mencegah serangan DoS/DDoS.

### 4. ⚙️ Portal Super Admin (Platform Configurator)
* **Onboarding UMKM**: Pendaftaran cepat UMKM baru lengkap dengan koordinat spasial (Latitude & Longitude) dan pengisian deskripsi dasar untuk dimasukkan ke ekosistem peta pariwisata.

---

## 💻 Tech Stack (Teknologi yang Digunakan)

### **Frontend (Client)**
* **React.js** (Vite Engine) - Cepat, responsif, dan berbasis komponen.
* **TailwindCSS** - Desain antarmuka premium, modern, dan bernuansa *Glassmorphism*.
* **Lucide React** - Sistem ikon vektor yang konsisten dan minimalis.
* **Leaflet.js** - Peta interaktif tanpa ketergantungan API pihak ketiga yang berbayar tinggi.

### **Backend (Server)**
* **Node.js** & **Express.js** - Restful API yang ringan dan asinkron.
* **Google Gen AI SDK (`@google/generative-ai`)** - Integrasi resmi dengan model **Gemini 2.5 Flash** (Itinerary & Sentiment) dan **Gemini 2.5 Flash-Lite** (WAF Engine).

### **Database & Security**
* **MySQL 2 (Dual Mode)** - Penyimpanan relasional terstruktur untuk tingkat produksi.
* **JSON File DB (Fallback Engine)** - Penyimpanan otomatis ke `data/database.json` jika server tidak terhubung ke MySQL.
* **Crypto Library (AES-256-CBC)** - Proteksi data pribadi medis/alergi wisatawan di basis data.

---

## 🛡️ Lapisan Keamanan: AI WAF (Web Application Firewall)

Grestrip dilengkapi dengan WAF berlapis ganda yang menyaring setiap ulasan/input teks dari pengguna:

```
[ Input Wisatawan ] 
        │
        ▼
┌─────────────────────────────────┐
│  Layer 1: Heuristic Engine      │ ──► [Terdeteksi Kasar/Script?] ──► BLOCKED!
└─────────────────────────────────┘
        │ (Lolos)
        ▼
┌─────────────────────────────────┐
│  Layer 2: AI WAF (Gemini Lite)  │ ──► [Deteksi Konteks Halus?] ──► BLOCKED!
└─────────────────────────────────┘
        │ (Bersih)
        ▼
[ Disimpan di Database ]
```

1. **Rule-based Heuristics**: Penyaringan kilat menggunakan Regex untuk skrip XSS mentah, pola SQL standar, dan *blacklist* kosakata kasar bahasa Indonesia & Inggris.
2. **AI Semantic Guard**: Menggunakan **Gemini 2.5 Flash-Lite** untuk memindai pesan yang mencoba menyiasati filter reguler (misal: *prompt injection*, caci maki tersembunyi, atau manipulasi logika query terenkripsi).

---

## 🛠️ Panduan Instalasi & Penggunaan

### **Prasyarat (Prerequisites)**
Pastikan komputer Anda sudah menginstal:
* [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
* [MySQL](https://www.mysql.com/) (Opsional - Jika ingin menggunakan mode DB MySQL relasional)

### **1. Kloning Repositori**
```bash
git clone https://github.com/Dwinur01/getrips.git
cd getrips
```

### **2. Instal Dependensi**
Instal dependensi untuk backend (root folder) dan frontend (`client` folder):
```bash
# Instal dependensi backend
npm install

# Masuk ke folder client dan instal dependensi frontend
cd client
npm install
cd ..
```

### **3. Konfigurasi Environment Variables (`.env`)**
Buat file bernama `.env` di root folder proyek Anda:
```env
PORT=3000

# API KEY GOOGLE AI STUDIO (Wajib untuk fitur AI Real-mode)
GEMINI_API_KEY=your_gemini_api_key_here

# KUNCI ENKRIPSI AES-256 (32 karakter acak)
ENCRYPTION_KEY=grestripsupersecretkeyforallergies!

# KONFIGURASI MYSQL (Kosongkan jika ingin menggunakan Fallback JSON DB otomatis)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=getrips_db
```

### **4. Jalankan Aplikasi secara Lokal**

#### **Mode Pengembangan (Development Mode)**
Jalankan backend server dan frontend vite dev server secara bersamaan:

Di terminal utama (Backend):
```bash
npm run dev
```

Di terminal kedua (Frontend):
```bash
cd client
npm run dev
```

#### **Mode Produksi (Production Build)**
Jika ingin menjalankan aplikasi secara utuh dari satu port backend:
```bash
# Lakukan compile aset frontend React
cd client
npm run build
cd ..

# Jalankan server utama
npm start
```
Buka **[http://localhost:3000](http://localhost:3000)** di browser Anda!

---

## 📁 Struktur Direktori Proyek

```text
getrips/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # Portal: Wisatawan, UMKM, IT Security, SuperAdmin
│   │   ├── App.jsx         # Router & Pusat Data Utama Frontend
│   │   ├── main.jsx
│   │   └── index.css       # Custom styling & Tailwind konfigurasi
│   ├── tailwind.config.js
│   └── vite.config.js
├── data/
│   └── database.json       # Fallback persistent DB file
├── db.js                   # Unified Database Interface & Skema MySQL Bootstrap
├── waf.js                  # Engine AI & Heuristic WAF + Rate Limiter
├── server.js               # Express API endpoints & Routing
├── package.json            # Daftar dependensi & script backend
├── .gitignore              # Pengecualian node_modules, .env, & file build
└── README.md               # Dokumentasi utama proyek
```

---

## 💡 Mode Simulasi vs Real API
Jika Anda tidak memiliki `GEMINI_API_KEY`, aplikasi akan **berjalan secara otomatis di dalam Mode Simulasi**:
* **Itinerary Generator**: Menggunakan algoritma heuristik internal untuk mensimulasikan pencarian rute aman alergi.
* **Sentiment & WAF**: Menggunakan database kata kasar bawaan dan logika validasi statis lokal.
* *Anda dapat memasukkan API Key secara dinamis langsung dari input box di sidebar aplikasi saat sedang berjalan.*

---

## 🏆 Kemenangan & Apresiasi
Aplikasi ini dikembangkan dengan dedikasi penuh dan semangat inovasi untuk program **#JuaraVibeCoding 2026**. Menggabungkan keindahan estetika UI modern, kepedulian terhadap pariwisata & UMKM daerah, serta proteksi keamanan berlapis cerdas.

*Dibuat oleh Tim Grestrip Secure Navigator - Google Cloud Innovation.*
