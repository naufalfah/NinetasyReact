// controllers/dashboardController.js — Statistik ringkasan untuk admin dashboard
const db = require("../config/db");

exports.getStats = async (req, res) => {
    try {
        // 1. Total Penjualan & Total Transaksi
        const [trxStats] = await db.query(`
            SELECT 
                COALESCE(SUM(total_harga), 0) AS total_penjualan,
                COUNT(*) AS total_transaksi
            FROM tb_transaksi
        `);

        // 2. Total Produk & Total Stok
        const [prodStats] = await db.query(`
            SELECT 
                COUNT(*) AS total_produk,
                COALESCE(SUM(stok), 0) AS total_stok
            FROM tb_produk
        `);

        // 3. Total Kategori
        const [katStats] = await db.query(`
            SELECT COUNT(*) AS total_kategori FROM tb_kategori
        `);

        // 4. Total User
        const [userStats] = await db.query(`
            SELECT COUNT(*) AS total_user FROM users
        `);

        // 5. Transaksi Terbaru (5 transaksi terakhir)
        const [recentTrx] = await db.query(`
            SELECT * FROM tb_transaksi ORDER BY id DESC LIMIT 5
        `);

        return res.status(200).json({
            success: true,
            data: {
                total_penjualan: trxStats[0].total_penjualan,
                total_transaksi: trxStats[0].total_transaksi,
                total_produk: prodStats[0].total_produk,
                total_stok: prodStats[0].total_stok,
                total_kategori: katStats[0].total_kategori,
                total_user: userStats[0].total_user,
                recent_transactions: recentTrx,
            },
        });
    } catch (error) {
        console.error("Gagal mengambil stats dashboard:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data statistik.",
            error: error.message,
        });
    }
};

