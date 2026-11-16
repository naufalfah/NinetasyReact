// controllers/kategoriController.js — Logika CRUD untuk tabel tb_kategori
const db = require("../config/db");

// Ambil semua kategori beserta jumlah produk aktualnya
exports.getAllKategori = async (req, res) => {
    try {
        const query = `
            SELECT 
                k.id,
                k.nama_kategori,
                COUNT(p.id) AS count_produk,
                k.created_at,
                k.updated_at
            FROM tb_kategori k
            LEFT JOIN tb_produk p ON k.id = p.kategori_id
            GROUP BY k.id, k.nama_kategori
            ORDER BY k.id ASC
        `;
        const [rows] = await db.query(query);

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Gagal mengambil kategori:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data kategori.",
            error: error.message,
        });
    }
};

// Tambah kategori baru
exports.tambahKategori = async (req, res) => {
    const { nama_kategori } = req.body;

    if (!nama_kategori) {
        return res.status(400).json({
            success: false,
            message: "Nama kategori wajib diisi!",
        });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO tb_kategori (nama_kategori, count_produk) VALUES (?, 0)`,
            [nama_kategori]
        );

        return res.status(201).json({
            success: true,
            message: "Kategori berhasil ditambahkan!",
            data: { id: result.insertId, nama_kategori, count_produk: 0 },
        });
    } catch (error) {
        console.error("Gagal tambah kategori:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal menambahkan kategori.",
            error: error.message,
        });
    }
};

// Update kategori
exports.updateKategori = async (req, res) => {
    const { id } = req.params;
    const { nama_kategori } = req.body;

    if (!nama_kategori) {
        return res.status(400).json({
            success: false,
            message: "Nama kategori wajib diisi!",
        });
    }

    try {
        await db.execute(`UPDATE tb_kategori SET nama_kategori = ? WHERE id = ?`, [
            nama_kategori,
            id,
        ]);

        return res.status(200).json({
            success: true,
            message: "Kategori berhasil diperbarui!",
        });
    } catch (error) {
        console.error("Gagal update kategori:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui kategori.",
            error: error.message,
        });
    }
};

// Hapus kategori
exports.hapusKategori = async (req, res) => {
    const { id } = req.params;

    try {
        // Lepaskan referensi kategori di tb_produk (set to NULL)
        await db.execute(`UPDATE tb_produk SET kategori_id = NULL WHERE kategori_id = ?`, [id]);
        await db.execute(`DELETE FROM tb_kategori WHERE id = ?`, [id]);

        return res.status(200).json({
            success: true,
            message: "Kategori berhasil dihapus!",
        });
    } catch (error) {
        console.error("Gagal hapus kategori:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal menghapus kategori.",
            error: error.message,
        });
    }
};
