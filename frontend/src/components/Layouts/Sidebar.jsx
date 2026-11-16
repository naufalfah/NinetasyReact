import React, { useState } from "react";
import { LayoutDashboard, Logs, Package, UsersRound, LogOut, Clock, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // State untuk kontrol buka/tutup sidebar (default terbuka)
    const [isOpen, setIsOpen] = useState(true);

    // Ambil data user dari sesi localStorage
    const savedUser = localStorage.getItem("user");
    let user = null;
    try {
        user = savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
        user = null;
    }

    const isAdmin = user?.role === "admin";

    // Menu khusus Admin
    const adminMenus = [
        {
            name: "Dashboard",
            icon: LayoutDashboard,
            path: "/admin/dashboard",
        },
        {
            name: "Produk",
            icon: Package,
            path: "/admin/produk",
        },
        {
            name: "Kategori",
            icon: Logs,
            path: "/admin/kategori",
        },
        {
            name: "Data User",
            icon: UsersRound,
            path: "/admin/users",
        },
        {
            name: "Riwayat",
            icon: Clock,
            path: "/admin/transaksi",
        },
    ];

    // Menu khusus Kasir
    const kasirMenus = [
        {
            name: "Produk",
            icon: Package,
            path: "/",
        },
        {
            name: "Riwayat Transaksi",
            icon: Logs,
            path: "/riwayat",
        },
    ];

    const menus = isAdmin ? adminMenus : kasirMenus;

    // Fungsi logout
    const handleLogout = () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            localStorage.removeItem("user");
            navigate("/login");
        }
    };

    return (
        // Spacer aside dengan animasi lebar otomatis
        <aside
            className={`${
                isOpen ? "w-64" : "w-20"
            } min-h-screen flex-shrink-0 relative transition-all duration-300 ease-in-out`}
        >
            {/* Sidebar fixed dengan animasi lebar dan sudut */}
            <div
                className={`fixed top-20 left-0 bottom-0 ${
                    isOpen ? "w-64 rounded-tr-[50px]" : "w-20 rounded-tr-[35px]"
                } bg-white shadow-xl z-30 flex flex-col justify-between overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out`}
            >
                <div className={`${isOpen ? "m-8" : "my-8 mx-3"} transition-all duration-300`}>
                    {/* Header: Judul & Tombol Toggle Menu */}
                    <div
                        className={`flex items-center ${
                            isOpen ? "justify-between mx-1" : "justify-center"
                        } transition-all duration-300`}
                    >
                        {isOpen && (
                            <h1
                                onClick={() => navigate(isAdmin ? "/admin/dashboard" : "/")}
                                className="text-xl font-semibold cursor-pointer truncate transition-opacity duration-300"
                            >
                                Ninetasy
                            </h1>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="cursor-pointer p-1.5 rounded-xl text-gray-700 hover:text-black hover:bg-gray-100 active:scale-95 transition-all duration-200 flex items-center justify-center group"
                            aria-label={isOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
                            title={isOpen ? "Sembunyikan Sidebar (Tutup)" : "Tampilkan Sidebar (Lebarkan)"}
                        >
                            {isOpen ? (
                                <PanelLeftClose
                                    size={20}
                                    className="transition-transform duration-200 group-hover:-translate-x-0.5"
                                />
                            ) : (
                                <PanelLeftOpen
                                    size={20}
                                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                                />
                            )}
                        </button>
                    </div>

                    <hr className="my-3 border opacity-40" />

                    {/* Navigasi menu */}
                    <nav className="flex flex-col gap-4 w-full mt-6">
                        {menus.map((menu, index) => {
                            const IconNavigate = menu.icon;
                            const isActive =
                                menu.path === "/"
                                    ? location.pathname === "/"
                                    : location.pathname.startsWith(menu.path);

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => navigate(menu.path)}
                                    title={!isOpen ? menu.name : undefined}
                                    className={`flex items-center ${
                                        isOpen ? "gap-6 px-4" : "justify-center px-0"
                                    } py-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-200 ${
                                        isActive
                                            ? "bg-gray-100 font-semibold text-black"
                                            : "text-gray-700"
                                    }`}
                                >
                                    <IconNavigate size={20} className="flex-shrink-0" />
                                    {isOpen && (
                                        <h1 className="whitespace-nowrap transition-all duration-300 overflow-hidden text-sm">
                                            {menu.name}
                                        </h1>
                                    )}
                                </button>
                            );
                        })}

                        {/* Tombol Logout */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            title={!isOpen ? "Keluar" : undefined}
                            className={`flex items-center ${
                                isOpen ? "gap-6 px-4" : "justify-center px-0"
                            } py-3 rounded-xl hover:bg-red-50 text-red-500 hover:text-red-600 cursor-pointer transition-all duration-200 mt-2`}
                        >
                            <LogOut size={20} className="flex-shrink-0" />
                            {isOpen && (
                                <h1 className="whitespace-nowrap transition-all duration-300 overflow-hidden text-sm">
                                    Keluar
                                </h1>
                            )}
                        </button>
                    </nav>
                </div>
            </div>
        </aside>
    );
}
