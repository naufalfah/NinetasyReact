#  PANDUAN DEPLOYMENT APLIKASI NINETASY POS

Dokumen ini memandu langkah demi langkah cara mendeploy aplikasi Fullstack **Ninetasy POS** (React 19 + Express.js + MySQL).

---

##  Ringkasan Persiapan yang Sudah Dibuat

1. **Backend**:
   - `start` script siap produksi di `backend/package.json` (`node src/app.js`).
   - Dukungan koneksi database fleksibel di `backend/src/config/db.js` (mendukung `DB_PORT` kustom dan `DB_SSL=true` untuk cloud database).
   - Pengaturan CORS dinamis yang mendukung domain frontend production via `CLIENT_URL`.
   - File template `.env.example` untuk backend.
   - Folder storage upload gambar otomatis dibuat jika belum ada (`backend/public/uploads/.gitkeep`).

2. **Frontend**:
   - Penggunaan dynamic environment variable `VITE_API_URL` di `frontend/src/api/index.js`.
   - Konfigurasi SPA Routing siap deploy (`frontend/vercel.json` dan `frontend/public/_redirects`) agar tidak error 404 saat halaman di-refresh.
   - File template `.env.example` untuk frontend.

3. **Database**:
   - File dump database siap import: `database.sql` (sudah termasuk tabel `users`, `tb_produk`, `tb_kategori`, `tb_transaksi`, `tb_detail_transaksi`, serta akun default Admin dan Kasir).

4. **Git**:
   - File `.gitignore` lengkap di root dan sub-folder agar `node_modules` dan file `.env` rahasia tidak ter-upload ke repository publik.

---

##  Metode 1: Deploy Gratis & Otomatis (Rekomendasi Terbaik)

Kombinasi layanan cloud modern gratis/freemium tanpa perlu kelola server Linux manual:
- **Database**: TiDB Cloud / Aiven / Clever Cloud (MySQL Gratis)
- **Backend API**: Render / Railway
- **Frontend React**: Vercel / Netlify

---

### Langkah 1: Push Project ke GitHub

1. Buka terminal di folder root project (`D:\Coding\REACT\Ninetasy`):
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit ready for deploy"
   ```
2. Buat repository baru di [GitHub](https://github.com/new) (misal: `ninetasy-pos`).
3. Hubungkan dan push:
   ```bash
   git remote add origin https://github.com/USERNAME_ANDA/ninetasy-pos.git
   git branch -M main
   git push -u origin main
   ```

---

### Langkah 2: Buat Database MySQL Cloud (Gratis)

Pilih salah satu penyedia cloud MySQL gratis:

#### Opsi A: TiDB Cloud (Serverless MySQL Gratis)
1. Buka [tidbcloud.com](https://tidbcloud.com/) dan daftar akun.
2. Buat cluster **Serverless Tier (Free)**.
3. Buat database baru bernama `db_react_ninetasy` (atau gunakan database bawaan `test`).
4. Buka menu **SQL Editor** atau gunakan aplikasi desktop seperti DBeaver / Navicat / HeidiSQL.
5. Buka isi file `database.sql` di project Anda, copy seluruh teksnya, dan paste ke SQL Editor lalu jalankan (**Run / Execute**).
6. Catat informasi koneksi:
   - **Host** (contoh: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
   - **Port** (contoh: `4000`)
   - **User** (contoh: `xxxx.root`)
   - **Password**
   - **Database Name** (contoh: `test` atau `db_react_ninetasy`)

*(Atau gunakan Aiven.io / Clever Cloud / Railway MySQL)*.

---

### Langkah 3: Deploy Backend di Render / Railway

#### Menggunakan Render (render.com):
1. Buka [render.com](https://render.com) dan login dengan akun GitHub Anda.
2. Klik **New +** > pilih **Web Service**.
3. Pilih repository GitHub Anda (`ninetasy-pos`).
4. Konfigurasikan:
   - **Name**: `ninetasy-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Masuk ke tab **Environment Variables**, tambahkan:
   | Key | Value | Keterangan |
   |---|---|---|
   | `PORT` | `3000` | Port aplikasi |
   | `DB_HOST` | Host MySQL Cloud | Dari Langkah 2 |
   | `DB_PORT` | Port MySQL Cloud | Misal: `4000` atau `3306` |
   | `DB_USER` | User MySQL Cloud | Dari Langkah 2 |
   | `DB_PASSWORD`| Password MySQL Cloud | Dari Langkah 2 |
   | `DB_NAME` | Nama database | Dari Langkah 2 |
   | `DB_SSL` | `true` | Wajib `true` untuk cloud DB |
6. Klik **Deploy Web Service**.
7. Tunggu build selesai. Anda akan mendapatkan URL backend, contoh:
   `https://ninetasy-api.onrender.com`

---

### Langkah 4: Deploy Frontend di Vercel

1. Buka [vercel.com](https://vercel.com) dan login dengan GitHub Anda.
2. Klik **Add New...** > pilih **Project**.
3. Pilih repository `ninetasy-pos`.
4. Pada bagian pengaturan:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Klik *Edit*, pilih folder `frontend`.
5. Buka bagian **Environment Variables**, tambahkan:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://ninetasy-api.onrender.com` *(Gunakan URL backend Anda)* |
6. Klik **Deploy**.
7. Dalam ~1 menit, frontend Anda sudah aktif dan live! (Contoh: `https://ninetasy-pos.vercel.app`).
8. *(Opsional)* Kembali ke pengaturan backend di Render, tambahkan variabel `CLIENT_URL` = `https://ninetasy-pos.vercel.app` untuk proteksi keamanan CORS.

---

##  Akun Login Default

Setelah deploy berhasil, akun yang sudah ada di database:

| Role | Email | Password | Hak Akses |
|---|---|---|---|
| **Admin** | `naufal123@gmail.com` | `1223344` | Kelola Produk, Tambah Stok, Kategori, Dashboard, Data User |
| **Kasir** | `kasir@gmail.com` | `kasir123` | Transaksi POS, Cetak Nota, Riwayat Transaksi |

---

## 🛠️ Metode 2: Deploy ke VPS Linux Sendiri (Ubuntu 22.04 / 24.04)

Jika Anda memiliki VPS (seperti DigitalOcean, Linode, IDCloudHost, Biznet, DomaiNesia):

### 1. Masuk ke Server via SSH:
```bash
ssh root@IP_SERVER_ANDA
```

### 2. Install Node.js, MySQL, Nginx, PM2:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server git

# Install Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 3. Setup Database MySQL di VPS:
```bash
sudo mysql
```
Di dalam MySQL console:
```sql
CREATE DATABASE db_react_ninetasy;
CREATE USER 'ninetasy_user'@'localhost' IDENTIFIED BY 'PasswordKuat123!';
GRANT ALL PRIVILEGES ON db_react_ninetasy.* TO 'ninetasy_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
Import data:
```bash
mysql -u ninetasy_user -p db_react_ninetasy < database.sql
```

### 4. Clone Project & Jalankan Backend dengan PM2:
```bash
cd /var/www
git clone https://github.com/USERNAME_ANDA/ninetasy-pos.git
cd ninetasy-pos/backend
npm install
nano .env # Isi DB_HOST=localhost, DB_USER=ninetasy_user, DB_PASSWORD=..., DB_NAME=db_react_ninetasy

# Jalankan backend service
pm2 start src/app.js --name "ninetasy-api"
pm2 save
pm2 startup
```

### 5. Build Frontend:
```bash
cd /var/www/ninetasy-pos/frontend
nano .env # Isi VITE_API_URL=http://IP_SERVER_ANDA:3000 (atau domain backend)
npm install
npm run build
```

### 6. Konfigurasi Nginx:
```bash
sudo nano /etc/nginx/sites-available/ninetasy
```
Isi konfigurasi:
```nginx
server {
    listen 80;
    server_name domain-anda.com; # atau IP server

    # Frontend React Build
    location / {
        root /var/www/ninetasy-pos/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Backend Reverse Proxy
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads Static Image
    location /uploads/ {
        proxy_pass http://localhost:3000/uploads/;
    }
}
```
Aktifkan dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/ninetasy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 💡 Troubleshooting Cepat

1. **Gambar Produk Blank setelah Deploy?**
   - Pastikan URL gambar menggunakan `getImageUrl()` (sudah otomatis mengambil dari `VITE_API_URL`).
   - Di cloud hosting gratis seperti Render/Railway ephemeral container, jika ingin penyimpanan gambar permanen tanpa batas saat server restart, Anda bisa mengaktifkan Persistent Disk di dashboard Render/Railway untuk folder `/uploads`.

2. **Halaman 404 saat di-refresh di Vercel / Netlify?**
   - File `frontend/vercel.json` dan `frontend/public/_redirects` sudah disertakan di repository, sehingga routing SPA React Router bekerja secara otomatis tanpa error 404.
