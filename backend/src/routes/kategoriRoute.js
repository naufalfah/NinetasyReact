// routes/kategoriRoute.js
const express = require("express");
const router = express.Router();
const kategoriController = require("../controllers/kategoriController");

router.get("/", kategoriController.getAllKategori);
router.post("/", kategoriController.tambahKategori);
router.put("/:id", kategoriController.updateKategori);
router.delete("/:id", kategoriController.hapusKategori);

module.exports = router;
