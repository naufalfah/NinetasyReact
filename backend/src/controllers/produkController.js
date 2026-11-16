// controllers/produkController.js — Logika CRUD untuk tabel tb_produk dengan penyimpanan file gambar di storage publik
const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// Ambil semua produk beserta nama kategorinya
exports.getAllProduk = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.nama_produk AS name,
                p.nama_produk,
                p.harga,
                p.stok,
                p.kategori_id,
                COALESCE(k.nama_kategori, 'Tanpa Kategori') AS kategori,
                p.gambar AS image,
                p.gambar,
                p.deskripsi,
                p.created_at,
                p.updated_at
            FROM tb_produk p
            LEFT JOIN tb_kategori k ON p.kategori_id = k.id
            ORDER BY p.id DESC
        `;
        const [rows] = await db.query(query);

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Gagal mengambil produk:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data produk.",
            error: error.message,
        });
    }
};

// Tambah produk baru (mendukung upload file gambar ke storage public/uploads)
exports.tambahProduk = async (req, res) => {
    const { nama_produk, harga, stok, kategori_id, deskripsi } = req.body;

    if (!nama_produk || harga === undefined) {
        return res.status(400).json({
            success: false,
            message: "Nama produk dan harga wajib diisi!",
        });
    }

    // Jika ada file yang diupload, simpan path relatifnya (misal: /uploads/produk-123.png)
    let gambarPath = null;
    if (req.file) {
        gambarPath = `/uploads/${req.file.filename}`;
    } else if (req.body.gambar) {
        gambarPath = req.body.gambar;
    }

    try {
        const query = `
            INSERT INTO tb_produk (nama_produk, harga, stok, kategori_id, deskripsi, gambar)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [
            nama_produk,
            Number(harga),
            Number(stok) || 0,
            kategori_id || null,
            deskripsi || null,
            gambarPath,
        ]);

        // Perbarui jumlah produk (count_produk) di tb_kategori jika ada kategori_id
        if (kategori_id) {
            await db.execute(
                `UPDATE tb_kategori SET count_produk = (SELECT COUNT(*) FROM tb_produk WHERE kategori_id = ?) WHERE id = ?`,
                [kategori_id, kategori_id]
            );
        }

        return res.status(201).json({
            success: true,
            message: "Produk berhasil ditambahkan!",
            data: { id: result.insertId, nama_produk, harga, stok, gambar: gambarPath },
        });
    } catch (error) {
        console.error("Gagal menambah produk:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal menambahkan produk.",
            error: error.message,
        });
    }
};

// Update produk yang ada (bisa ganti gambar file baru atau pertahankan gambar lama)
exports.updateProduk = async (req, res) => {
    const { id } = req.params;
    const { nama_produk, harga, stok, kategori_id, deskripsi } = req.body;

    if (!nama_produk || harga === undefined) {
        return res.status(400).json({
            success: false,
            message: "Nama produk dan harga wajib diisi!",
        });
    }

    try {
        // Ambil data produk lama untuk mengetahui gambar sebelumnya
        const [oldRows] = await db.execute(
            `SELECT gambar FROM tb_produk WHERE id = ?`,
            [id]
        );

        let gambarPath = oldRows[0]?.gambar || null;

        // Jika user mengupload gambar baru
        if (req.file) {
            gambarPath = `/uploads/${req.file.filename}`;

            // Hapus file fisik gambar lama dari disk jika berada di /uploads/ (kecuali default asset)
            if (
                oldRows[0]?.gambar &&
                oldRows[0].gambar.startsWith("/uploads/") &&
                !oldRows[0].gambar.includes("default-gabin")
            ) {
                const oldFilePath = path.join(__dirname, "../../public", oldRows[0].gambar);
                if (fs.existsSync(oldFilePath)) {
                    try {
                        fs.unlinkSync(oldFilePath);
                    } catch (e) {
                        // Abaikan jika gagal hapus file lama
                    }
                }
            }
        } else if (req.body.gambar !== undefined) {
            gambarPath = req.body.gambar;
        }

        const query = `
            UPDATE tb_produk 
            SET nama_produk = ?, harga = ?, stok = ?, kategori_id = ?, deskripsi = ?, gambar = ?
            WHERE id = ?
        `;
        await db.execute(query, [
            nama_produk,
            Number(harga),
            Number(stok) || 0,
            kategori_id || null,
            deskripsi || null,
            gambarPath,
            id,
        ]);

        return res.status(200).json({
            success: true,
            message: "Produk berhasil diperbarui!",
            data: { id, nama_produk, harga, stok, gambar: gambarPath },
        });
    } catch (error) {
        console.error("Gagal update produk:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui produk.",
            error: error.message,
        });
    }
};

// Tambah stok secara incremental
exports.tambahStok = async (req, res) => {
    const { id } = req.params;
    const { tambah_stok } = req.body;

    const jumlah = Number(tambah_stok);
    if (isNaN(jumlah) || jumlah <= 0) {
        return res.status(400).json({
            success: false,
            message: "Jumlah penambahan stok harus berupa angka lebih dari 0!",
        });
    }

    try {
        await db.execute(
            `UPDATE tb_produk SET stok = stok + ? WHERE id = ?`,
            [jumlah, id]
        );

        const [rows] = await db.execute(
            `SELECT id, nama_produk, stok FROM tb_produk WHERE id = ?`,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: `Stok berhasil ditambahkan! Total stok sekarang: ${rows[0].stok}`,
            data: rows[0],
        });
    } catch (error) {
        console.error("Gagal tambah stok:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal menambahkan stok produk.",
            error: error.message,
        });
    }
};

// Hapus produk (dan hapus file gambar dari storage jika ada)
exports.hapusProduk = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.execute(`SELECT gambar FROM tb_produk WHERE id = ?`, [id]);
        if (
            rows[0]?.gambar &&
            rows[0].gambar.startsWith("/uploads/") &&
            !rows[0].gambar.includes("default-gabin")
        ) {
            const filePath = path.join(__dirname, "../../public", rows[0].gambar);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    // Abaikan jika gagal hapus
                }
            }
        }

        await db.execute(`DELETE FROM tb_produk WHERE id = ?`, [id]);

        return res.status(200).json({
            success: true,
            message: "Produk berhasil dihapus!",
        });
    } catch (error) {
        console.error("Gagal hapus produk:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal menghapus produk.",
            error: error.message,
        });
    }
};
