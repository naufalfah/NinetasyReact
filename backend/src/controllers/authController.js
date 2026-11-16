// controllers/authController.js — Login & Register tanpa JWT (session sederhana)
const db = require("../config/db");

// Login: cocokkan email + password, kembalikan data user + role
exports.login = async (req, res) => {
    const { email, pw } = req.body;

    if (!email || !pw) {
        return res.status(400).json({
            success: false,
            message: "Email dan password wajib diisi!",
        });
    }

    try {
        const [rows] = await db.execute(
            `SELECT id, name, email, role FROM users WHERE email = ? AND pw = ? LIMIT 1`,
            [email, pw]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email atau password salah!",
            });
        }

        const user = rows[0];
        return res.status(200).json({
            success: true,
            message: `Login berhasil! Selamat datang, ${user.name}.`,
            data: user,
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server.",
            error: error.message,
        });
    }
};

// Register: buat akun baru (default role = kasir)
exports.register = async (req, res) => {
    const { name, email, pw } = req.body;

    if (!name || !email || !pw) {
        return res.status(400).json({
            success: false,
            message: "Nama, email, dan password wajib diisi!",
        });
    }

    try {
        // Cek apakah email sudah terdaftar
        const [existing] = await db.execute(
            `SELECT id FROM users WHERE email = ? LIMIT 1`,
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email sudah terdaftar! Silakan gunakan email lain.",
            });
        }

        const [result] = await db.execute(
            `INSERT INTO users (name, email, pw, role) VALUES (?, ?, ?, 'kasir')`,
            [name, email, pw]
        );

        return res.status(201).json({
            success: true,
            message: "Registrasi berhasil! Silakan login.",
            data: { id: result.insertId, name, email, role: "kasir" },
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server.",
            error: error.message,
        });
    }
};

