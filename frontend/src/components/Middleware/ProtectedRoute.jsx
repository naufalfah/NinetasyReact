// components/Middleware/ProtectedRoute.jsx — Middleware proteksi rute berbasis role
// Memastikan user harus login terlebih dahulu dan hanya bisa mengakses rute sesuai rolenya

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [] }) {
    // 1. Ambil data session user dari localStorage
    const savedUser = localStorage.getItem("user");
    let user = null;

    try {
        user = savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
        user = null;
    }

    // 2. Jika user belum login, langsung alihkan ke halaman login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Jika rute dibatasi role tertentu dan user bukan role yang diizinkan
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Cegah admin membuka halaman kasir -> kembalikan ke dashboard admin
        if (user.role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        }
        // Cegah kasir membuka halaman admin -> kembalikan ke halaman kasir
        return <Navigate to="/" replace />;
    }

    // 4. Jika lolos verifikasi, render komponen anak / rute tujuan
    return <Outlet />;
}

