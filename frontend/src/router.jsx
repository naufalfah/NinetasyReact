// router.jsx — Routing Ninetasy POS: Auth, User (Kasir), Admin
// Dilengkapi Middleware ProtectedRoute & GuestRoute untuk pengamanan berbasis role

import { createBrowserRouter, Navigate } from "react-router-dom";

// Middleware
import ProtectedRoute from "./components/Middleware/ProtectedRoute";
import GuestRoute from "./components/Middleware/GuestRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Pages User (Kasir)
import UserPOS from "./pages/user/pos";
import UserRiwayat from "./pages/user/riwayat";

// Pages Admin
import AdminDashboard from "./pages/admin/dashboard";
import AdminProduk from "./pages/admin/produk";
import AdminKategori from "./pages/admin/kategori";
import AdminUsers from "./pages/admin/users";
import AdminTransaksi from "./pages/admin/transaksi";

// Error Page
import ErrorPage from "./pages/404";

export const router = createBrowserRouter([
    // Error Page (404 Not Found)
    { path: "*", element: <ErrorPage /> },

    // ====== PUBLIC / GUEST ROUTES (Hanya jika belum login) ======
    // Jika sudah login, otomatis dialihkan ke halaman rolenya masing-masing
    {
        element: <GuestRoute />,
        children: [
            { path: "/login", element: <Login /> },
            { path: "/register", element: <Register /> },
        ],
    },

    // ====== KASIR / USER ONLY (Role: 'kasir') ======
    // Admin dilarang mengakses rute ini (akan dialihkan ke /admin/dashboard)
    // Pengguna belum login akan dialihkan ke /login
    {
        element: <ProtectedRoute allowedRoles={["kasir"]} />,
        children: [
            { path: "/", element: <UserPOS /> },
            { path: "/transaksi", element: <UserPOS /> },
            { path: "/riwayat", element: <UserRiwayat /> },
        ],
    },

    // ====== ADMIN ONLY (Role: 'admin') ======
    // Kasir dilarang mengakses rute ini (akan dialihkan ke /)
    // Pengguna belum login akan dialihkan ke /login
    {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
            { path: "/admin", element: <Navigate to="/admin/dashboard" replace /> },
            { path: "/admin/dashboard", element: <AdminDashboard /> },
            { path: "/admin/produk", element: <AdminProduk /> },
            { path: "/admin/kategori", element: <AdminKategori /> },
            { path: "/admin/users", element: <AdminUsers /> },
            { path: "/admin/transaksi", element: <AdminTransaksi /> },
        ],
    },
]);
