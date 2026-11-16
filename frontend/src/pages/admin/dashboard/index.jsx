// pages/admin/dashboard/index.jsx — Halaman Utama Dashboard Admin Ninetasy
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/Layouts/Sidebar";
import DetailTransaksiModal from "../../../components/Fragments/DetailTransaksiModal";
import api from "../../../api";
import {
    DollarSign,
    ShoppingBag,
    Package,
    FolderKanban,
    Users,
    Receipt,
    ArrowUpRight,
    Plus,
    Eye,
} from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        total_penjualan: 0,
        total_transaksi: 0,
        total_produk: 0,
        total_stok: 0,
        total_kategori: 0,
        total_user: 0,
        recent_transactions: [],
    });
    const [loading, setLoading] = useState(true);
    const [selectedTransaksiId, setSelectedTransaksiId] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/dashboard/stats");
            if (res.data?.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error("Gagal load dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const formatRupiah = (val) => `Rp ${Number(val).toLocaleString("id-ID")}`;

    const statCards = [
        {
            label: "Total Penjualan",
            value: formatRupiah(stats.total_penjualan),
            icon: DollarSign,
            color: "bg-emerald-50 text-emerald-600",
        },
        {
            label: "Total Transaksi",
            value: `${stats.total_transaksi} Transaksi`,
            icon: ShoppingBag,
            color: "bg-blue-50 text-blue-600",
        },
        {
            label: "Total Produk",
            value: `${stats.total_produk} Menu`,
            icon: Package,
            color: "bg-amber-50 text-amber-600",
        },
        {
            label: "Kategori & User",
            value: `${stats.total_kategori} Kat / ${stats.total_user} User`,
            icon: Users,
            color: "bg-purple-50 text-purple-600",
        },
    ];

    return (
        <div className="flex min-h-screen bg-[#ECEAE6]">
            {/* Sidebar Admin */}
            <Sidebar />

            {/* Konten Utama */}
            <main className="flex-1 p-8 overflow-y-auto animate-page-enter">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-xs text-gray-500 mt-1">Ringkasan performa penjualan dan manajemen Ninetasy POS</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin/produk"
                            className="flex items-center gap-2 bg-[#3D3D3D] text-white px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-black active:scale-95 transition-all shadow-sm"
                        >
                            <Plus size={14} />
                            <span>Tambah Produk</span>
                        </Link>
                    </div>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-white rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-gray-400">{card.label}</span>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color}`}>
                                        <Icon size={16} />
                                    </div>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                                    {loading ? "..." : card.value}
                                </h3>
                            </div>
                        );
                    })}
                </div>

                {/* Section Transaksi Terbaru */}
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-extrabold text-gray-900">Transaksi Terbaru</h2>
                            <p className="text-[11px] text-gray-400">5 penjualan paling baru yang telah tercatat di kasir</p>
                        </div>

                        <Link
                            to="/admin/transaksi"
                            className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-black transition-colors"
                        >
                            <span>Lihat Semua</span>
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <p className="text-center py-8 text-xs text-gray-400">Memuat transaksi...</p>
                    ) : stats.recent_transactions.length === 0 ? (
                        <p className="text-center py-8 text-xs text-gray-400">Belum ada transaksi tersimpan.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                                        <th className="pb-3 px-2">ID</th>
                                        <th className="pb-3 px-2">Tanggal</th>
                                        <th className="pb-3 px-2">Total Harga</th>
                                        <th className="pb-3 px-2">Uang Bayar</th>
                                        <th className="pb-3 px-2">Kembalian</th>
                                        <th className="pb-3 px-2 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {stats.recent_transactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-gray-50/60">
                                            <td className="py-3 px-2 font-bold text-gray-900">
                                                <div className="flex items-center gap-1.5">
                                                    <Receipt size={13} className="text-gray-400" />
                                                    <span>#{trx.id}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-gray-600">
                                                {new Date(trx.tanggal_transaksi || trx.created_at).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="py-3 px-2 font-bold text-gray-900">
                                                {formatRupiah(trx.total_harga)}
                                            </td>
                                            <td className="py-3 px-2 text-gray-600">
                                                {formatRupiah(trx.uang_bayar)}
                                            </td>
                                            <td className="py-3 px-2 text-emerald-600 font-semibold">
                                                {formatRupiah(trx.kembalian)}
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedTransaksiId(trx.id)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#3D3D3D] hover:text-white text-gray-700 font-bold text-[11px] transition-colors cursor-pointer"
                                                >
                                                    <Eye size={12} />
                                                    <span>Detail</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Detail Transaksi */}
            {selectedTransaksiId && (
                <DetailTransaksiModal
                    transaksiId={selectedTransaksiId}
                    onClose={() => setSelectedTransaksiId(null)}
                />
            )}
        </div>
    );
}
