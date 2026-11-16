// controllers/transaksiController.js — Logika penyimpanan dan pengambilan data transaksi
// Mengelola tabel tb_transaksi, tb_detail_transaksi, serta mengurangi stok di tb_produk (ACID)

const db = require("../config/db"); // Import koneksi database

// Controller untuk menyimpan transaksi baru ke database
exports.simpanTransaksi = async (req, res) => {
    // Ambil data dari body request
    const { total_harga, uang_bayar, kembalian, items } = req.body;

    // Validasi data input
    if (!total_harga || uang_bayar === undefined || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Data transaksi tidak lengkap! Pastikan total_harga, uang_bayar, dan items terisi.",
        });
    }

    // Validasi uang bayar tidak boleh kurang dari total harga
    if (Number(uang_bayar) < Number(total_harga)) {
        return res.status(400).json({
            success: false,
            message: "Uang pembayaran kurang dari total harga!",
        });
    }

    // Dapatkan koneksi khusus untuk menjalankan database transaction
    const connection = await db.getConnection();

    try {
        // Mulai transaksi atomik
        await connection.beginTransaction();

        // Tanggal transaksi hari ini (format YYYY-MM-DD)
        const tanggal_transaksi = new Date().toISOString().split("T")[0];

        // 1. Simpan ke tabel master: tb_transaksi
        const queryTransaksi = `
            INSERT INTO tb_transaksi (tanggal_transaksi, total_harga, uang_bayar, kembalian)
            VALUES (?, ?, ?, ?)
        `;
        const [resultTransaksi] = await connection.execute(queryTransaksi, [
            tanggal_transaksi,
            total_harga,
            uang_bayar,
            kembalian ?? (Number(uang_bayar) - Number(total_harga)),
        ]);

        // ID transaksi yang baru saja digenerate otomatis oleh MySQL
        const transaksiId = resultTransaksi.insertId;

        // 2. Simpan setiap item belanja ke tb_detail_transaksi dan kurangi stok di tb_produk
        const queryDetail = `
            INSERT INTO tb_detail_transaksi (transaksi_id, produk_id, nama_produk, qty, harga, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const queryKurangStok = `
            UPDATE tb_produk 
            SET stok = GREATEST(0, stok - ?) 
            WHERE id = ?
        `;

        for (const item of items) {
            const hargaItem = item.harga ?? item.price ?? 0;
            const subtotalItem = hargaItem * item.qty;

            // Simpan detail item
            await connection.execute(queryDetail, [
                transaksiId,
                item.id || null, // ID produk jika ada
                item.name || "Produk", // Nama produk
                item.qty, // Jumlah item yang dibeli
                hargaItem, // Harga satuan
                subtotalItem, // Subtotal
            ]);

            // Jika ada produk_id, kurangi stok produk di tabel tb_produk
            if (item.id) {
                await connection.execute(queryKurangStok, [item.qty, item.id]);
            }
        }

        // Simpan perubahan permanen jika semua proses berhasil
        await connection.commit();

        // Kirim respon berhasil ke client
        return res.status(201).json({
            success: true,
            message: "Transaksi berhasil disimpan ke database!",
            data: {
                transaksi_id: transaksiId,
                tanggal_transaksi,
                total_harga,
                uang_bayar,
                kembalian: Number(uang_bayar) - Number(total_harga),
                total_item: items.length,
            },
        });
    } catch (error) {
        // Batalkan seluruh perubahan jika terjadi error di tengah jalan
        await connection.rollback();
        console.error("Gagal menyimpan transaksi:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server saat menyimpan transaksi.",
            error: error.message,
        });
    } finally {
        // Kembalikan koneksi ke pool
        connection.release();
    }
};

// Controller untuk melihat riwayat semua transaksi (lengkap dengan jumlah jenis & total item)
exports.getRiwayatTransaksi = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.*,
                COUNT(d.id) AS total_jenis_item,
                COALESCE(SUM(d.qty), 0) AS total_qty
            FROM tb_transaksi t
            LEFT JOIN tb_detail_transaksi d ON t.id = d.transaksi_id
            GROUP BY t.id
            ORDER BY t.created_at DESC
        `;
        const [transaksi] = await db.query(query);

        return res.status(200).json({
            success: true,
            data: transaksi,
        });
    } catch (error) {
        console.error("Gagal mengambil riwayat transaksi:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil riwayat transaksi.",
            error: error.message,
        });
    }
};

// Controller untuk melihat detail spesifik transaksi beserta barang yang dibeli
exports.getDetailTransaksi = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Ambil data transaksi utama
        const [transaksiRows] = await db.query(
            `SELECT * FROM tb_transaksi WHERE id = ?`,
            [id]
        );

        if (transaksiRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Transaksi tidak ditemukan!",
            });
        }

        // 2. Ambil seluruh item barang yang dibeli pada transaksi ini
        const [items] = await db.query(
            `SELECT 
                d.id,
                d.transaksi_id,
                d.produk_id,
                d.nama_produk,
                d.qty,
                d.harga,
                d.subtotal,
                p.gambar,
                COALESCE(k.nama_kategori, 'Makanan') AS kategori
            FROM tb_detail_transaksi d
            LEFT JOIN tb_produk p ON d.produk_id = p.id
            LEFT JOIN tb_kategori k ON p.kategori_id = k.id
            WHERE d.transaksi_id = ?
            ORDER BY d.id ASC`,
            [id]
        );

        return res.status(200).json({
            success: true,
            data: {
                ...transaksiRows[0],
                items,
            },
        });
    } catch (error) {
        console.error("Gagal mengambil detail transaksi:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil detail transaksi.",
            error: error.message,
        });
    }
};
