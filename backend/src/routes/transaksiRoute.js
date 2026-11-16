// routes/transaksiRoute.js — Rute API untuk fitur transaksi
const express = require("express");
const router = express.Router();
const transaksiController = require("../controllers/transaksiController");

// Endpoint POST: Simpan transaksi baru
router.post("/", transaksiController.simpanTransaksi);

// Endpoint GET: Ambil riwayat semua transaksi
router.get("/", transaksiController.getRiwayatTransaksi);

// Endpoint GET: Ambil detail spesifik transaksi beserta barang yang dibeli
router.get("/:id", transaksiController.getDetailTransaksi);

module.exports = router;
