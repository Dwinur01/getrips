# 🤝 Panduan Kontribusi (Contributing Guidelines)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada **Grestrip Smart & Secure Navigator**! Kami sangat menghargai kontribusi dari komunitas untuk membuat platform pariwisata dan keamanan ini menjadi lebih baik.

## 🚀 Memulai (Local Setup)

Untuk mulai berkontribusi secara lokal, ikuti langkah-langkah setup berikut:

1. **Fork & Clone Repositori:**
   ```bash
   git clone https://github.com/Dwinur01/getrips.git
   cd getrips
   ```
2. **Pasang Dependensi:**
   Instal dependensi di root (backend) dan di folder `client` (frontend):
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```
3. **Konfigurasi Environment (`.env`):**
   Buat file `.env` di root proyek dengan variabel yang diperlukan (lihat petunjuk di [README.md](README.md)).
4. **Jalankan Aplikasi:**
   * Backend dev server: `npm run dev`
   * Frontend dev server: `cd client && npm run dev`

## 📐 Standar Pengodean & Desain

Untuk menjaga kualitas dan kekonsistenan kode, harap perhatikan aturan berikut:
* **Gaya UI/UX:** Selalu gunakan token warna brand yang telah ditentukan:
  * Warna Utama (Primary): `#006666` (Teal)
  * Warna Sekunder (Secondary): `#e05624` (Orange)
* **Ukuran Huruf:** Batas ukuran minimum font pada UI React adalah `text-[10px]`.
* **Notifikasi UI:** Hindari penggunaan fungsi dialog bawaan browser seperti `alert()` atau `confirm()`. Gunakan modal kustom React atau sistem toast yang telah disediakan.
* **Keamanan:** Sebelum mengubah logika input ulasan atau data, pastikan perubahan Anda tidak mengganggu integrasi **AI WAF** dan rule heuristik yang ada di berkas `waf.js`.

## 🧪 Melakukan Pengujian

Sebelum membuat Pull Request (PR), pastikan seluruh pengujian unit berjalan sukses:
```bash
npm run test
```

## 📬 Mengirimkan Pull Request

1. Buat branch baru dari `main` dengan nama deskriptif (contoh: `feature/nama-fitur` atau `bugfix/nama-bug`).
2. Terapkan perubahan Anda dengan commit message yang jelas dan informatif.
3. Kirimkan Pull Request ke cabang utama repositori ini dan jelaskan perubahan yang Anda buat secara ringkas.

---
*Dibuat dengan 💻 oleh Tim Grestrip Navigator - Google Cloud Innovation.*
