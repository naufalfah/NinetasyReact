// components/Middleware/GuestRoute.jsx — Middleware untuk rute tamu (login & register)
// Jika user sudah login, otomatis diarahkan ke halaman utama sesuai rolenya

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestRoute() {
    // Cek apakah user sudah memiliki sesi login
    const savedUser = localStorage.getItem("user");
    let user = null;

    try {
        user = savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
        user = null;
    }

    // Jika sudah login, cegah akses ke /login atau /register
    if (user) {
        if (user.role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/" replace />;
    }

    // Jika belum login, tampilkan halaman auth
    return <Outlet />;
}

