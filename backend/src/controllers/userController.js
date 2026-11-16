// controllers/userController.js — Logika CRUD untuk tabel users
const db = require("../config/db");

// Ambil semua user (tanpa password demi keamanan)
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, name, email, created_at, updated_at FROM users ORDER BY id DESC`
        );

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Gagal mengambil users:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data user.",
            error: error.message,
        });
    }
};

// Tambah user baru (name, email, pw)
exports.tambahUser = async (req, res) => {
    const { name, email, pw } = req.body;

    if (!name || !email || !pw) {
        return res.status(400).json({
            success: false,
            message: "Name, email, dan pw wajib diisi!",
        });
    }

    try {
        const query = `INSERT INTO users (name, email, pw) VALUES (?, ?, ?)`;
        const [result] = await db.execute(query, [name, email, pw]);

        return res.status(201).json({
            success: true,
            message: "User berhasil ditambahkan!",
            data: { id: result.insertId, name, email },
        });
    } catch (error) {
        console.error("Gagal menambah user:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                success: false,
                message: "Email sudah terdaftar!",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Gagal menambahkan user.",
            error: error.message,
        });
    }
};

// Hapus user
exports.hapusUser = async (req, res) => {
    const { id } = req.params;

    try {
        await db.execute(`DELETE FROM users WHERE id = ?`, [id]);

        return res.status(200).json({
            success: true,
            message: "User berhasil dihapus!",
        });
    } catch (error) {
        console.error("Gagal hapus user:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal menghapus user.",
            error: error.message,
        });
    }
};
