# 👕 Glowear - Custom T-Shirt Ordering System

Glowear adalah sistem informasi pemesanan kaos custom berbasis **Service-Oriented Architecture (SOA)** yang dikembangkan untuk digitalisasi dan otomatisasi proses bisnis konveksi, khususnya untuk **Glomed.co**.

Aplikasi ini mengintegrasikan tiga ekosistem utama untuk memberikan pengalaman *end-to-end*, mulai dari pelanggan merancang desain hingga admin memproduksi pesanan di pabrik.

---

## ✨ Fitur Utama

### 📱 Mobile App (Pelanggan)
- **Katalog Produk:** Menampilkan daftar kaos polos dan katalog pakaian siap sablon.
- **Studio Custom:** Pelanggan dapat melampirkan referensi gambar/desain sablon mereka sendiri secara langsung.
- **Checkout & Pembayaran:** Kalkulasi harga otomatis dan sistem konfirmasi pembayaran.
- **Pelacakan Pesanan:** Memantau riwayat transaksi dan status produksi (Pending, Diproses, Dikirim) secara *real-time*.

### 💻 Web Admin (CMS)
- **Dashboard Analitik:** Ringkasan pendapatan, performa penjualan, dan pesanan masuk.
- **Manajemen Transaksi:** Verifikasi bukti pembayaran, validasi desain custom, dan *update* status produksi pesanan.
- **Manajemen Katalog:** Pengaturan inventaris, harga produk, dan varian ukuran.
- **Laporan Keuangan:** Rekapitulasi transaksi untuk kebutuhan pembukuan konveksi.

### ⚙️ Backend (API Service)
- RESTful API yang aman dan terstruktur.
- Manajemen penyimpanan file statis (Bukti Transfer & Desain Sablon).
- Relasi database yang presisi untuk menjaga integritas data antar layanan.

---

## 🚀 Tech Stack

**Backend**
- Framework: NestJS
- ORM: Prisma
- Database: PostgreSQL

**Frontend (Admin Web)**
- Framework: Next.js (App Router)
- Library UI: React, Tailwind CSS
- State Management: React Hooks

**Mobile App (User)**
- Framework: React Native (Expo)
- Routing: Expo Router

---