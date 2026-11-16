// app.js — File entry point backend Express server Ninetasy POS
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Muat variabel .env

// Import koneksi database
require("./config/db");

// Import routes
const transaksiRoute = require("./routes/transaksiRoute");
const produkRoute = require("./routes/produkRoute");
const kategoriRoute = require("./routes/kategoriRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const dashboardRoute = require("./routes/dashboardRoute");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Mengizinkan request dari frontend (CORS) — bisa dibatasi via CLIENT_URL di .env
const allowedOrigin = process.env.CLIENT_URL;
if (allowedOrigin) {
    app.use(cors({ origin: [allowedOrigin, "http://localhost:5173", "http://localhost:3000"], credentials: true }));
} else {
    app.use(cors());
}
app.use(express.json()); // Parsing body request format JSON
app.use(express.urlencoded({ extended: true })); // Parsing urlencoded

// Akses file statis gambar publik melalui URL: http://localhost:PORT/uploads/...
// Siap diakses saat dideploy ke server / VPS / hosting
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Route test server
app.get("/", (req, res) => {
    res.json({
        message: "Ninetasy POS API berhasil dijalankan!",
        database: process.env.DB_NAME || "db_react_ninetasy",
        storage_url: "/uploads",
    });
});

// Daftarkan API routes
app.use("/api/auth", authRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/transaksi", transaksiRoute);
app.use("/api/produk", produkRoute);
app.use("/api/kategori", kategoriRoute);
app.use("/api/users", userRoute);

// Jalankan server jika dijalankan langsung di lokal / VPS (bukan serverless Vercel)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server Ninetasy POS berjalan di http://localhost:${PORT}`);
        console.log(`Storage gambar publik siap di http://localhost:${PORT}/uploads`);
    });
}

// Ekspor instance express untuk Vercel Serverless
module.exports = app;
