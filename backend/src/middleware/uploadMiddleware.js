// middleware/uploadMiddleware.js — Konfigurasi Multer untuk penyimpanan gambar produk di storage publik
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan direktori backend/public/uploads selalu tersedia
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan file ke disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Buat nama file unik: produk-[timestamp]-[random].[ekstensi]
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `produk-${uniqueSuffix}${ext}`);
    },
});

// Filter format file: hanya menerima gambar
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) {
        cb(null, true);
    } else {
        cb(new Error("Hanya file gambar (jpg, jpeg, png, webp, gif) yang diperbolehkan!"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran 5MB
});

module.exports = upload;

