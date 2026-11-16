// routes/produkRoute.js — Rute API produk dengan middleware upload gambar Multer
const express = require("express");
const router = express.Router();
const produkController = require("../controllers/produkController");
const upload = require("../middleware/uploadMiddleware");

// GET semua produk
router.get("/", produkController.getAllProduk);

// POST tambah produk baru (dengan upload file gambar opsional ke storage)
router.post("/", upload.single("gambar"), produkController.tambahProduk);

// PUT update produk (bisa upload file gambar baru)
router.put("/:id", upload.single("gambar"), produkController.updateProduk);

// POST tambah stok cepat
router.post("/:id/tambah-stok", produkController.tambahStok);

// DELETE hapus produk
router.delete("/:id", produkController.hapusProduk);

module.exports = router;
