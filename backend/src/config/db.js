// config/db.js — Konfigurasi koneksi MySQL ke database db_react_ninetasy
// Mendukung koneksi lokal (Laragon/XAMPP) maupun cloud database saat deploy (Railway, Aiven, TiDB, cPanel)

const mysql = require("mysql2/promise"); // Import driver mysql2 dengan promise
require("dotenv").config(); // Muat variabel lingkungan dari file .env

const dbConfig = {
    host: process.env.DB_HOST || "localhost", // Host database
    user: process.env.DB_USER || "root", // Username database
    password: process.env.DB_PASSWORD || "", // Password database
    database: process.env.DB_NAME || "db_react_ninetasy", // Nama database
    port: Number(process.env.DB_PORT) || 3306, // Port database (default MySQL 3306)
    waitForConnections: true, // Tunggu koneksi jika pool penuh
    connectionLimit: 10, // Batas maksimal 10 koneksi simultan
    queueLimit: 0, // Tidak ada batas antrean permintaan koneksi
};

// Jika cloud database membutuhkan koneksi aman SSL (contoh: Aiven, TiDB Cloud, Supabase)
if (process.env.DB_SSL === "true") {
    dbConfig.ssl = { rejectUnauthorized: false };
}

// Buat pool koneksi database agar lebih efisien dan reusable
const db = mysql.createPool(dbConfig);

// Tes koneksi database saat pertama kali aplikasi dijalankan
(async () => {
    try {
        const connection = await db.getConnection(); // Coba ambil satu koneksi dari pool
        console.log(" Berhasil terhubung ke database:", process.env.DB_NAME || "db_react_ninetasy");
        connection.release(); // Kembalikan koneksi ke pool
    } catch (err) {
        console.error(" Gagal koneksi ke database:", err.message);
    }
})();

module.exports = db; // Ekspor pool db agar bisa dipakai di controller

