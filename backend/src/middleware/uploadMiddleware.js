// middleware/uploadMiddleware.js — Konfigurasi Multer untuk penyimpanan gambar produk
// Mendukung penyimpanan disk lokal maupun memory serverless (Vercel)
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const isServerless = Boolean(process.env.VERCEL);

let storage;
if (isServerless) {
    // Di Vercel Serverless: simpan file ke memory buffer (disimpan ke database sebagai Data URI)
    storage = multer.memoryStorage();
} else {
    // Di lokal: simpan file fisik ke backend/public/uploads
    const uploadDir = path.join(__dirname, "../../public/uploads");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `produk-${uniqueSuffix}${ext}`);
        },
    });
}

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

