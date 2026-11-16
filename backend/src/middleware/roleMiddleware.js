// middleware/roleMiddleware.js — Middleware otorisasi role di backend
exports.requireRole = (allowedRoles = []) => {
    return (req, res, next) => {
        const userRole = req.headers["x-user-role"] || req.body?.role || req.query?.role;

        // Jika ada header role dan rolenya tidak diizinkan, tolak akses
        if (userRole && !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Akses ditolak! Anda tidak memiliki izin untuk rute ini.",
            });
        }

        next();
    };
};

