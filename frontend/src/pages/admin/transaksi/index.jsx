// pages/admin/transaksi/index.jsx — Riwayat Transaksi Penjualan Lengkap (Admin) dengan Filter Harian & Reset
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../../components/Layouts/Sidebar";
import DetailTransaksiModal from "../../../components/Fragments/DetailTransaksiModal";
import api from "../../../api";
import { Receipt, RefreshCw, Search, Eye, DollarSign, ShoppingBag, Calendar, Trash2 } from "lucide-react";

export default function AdminTransaksi() {
    const [transaksiList, setTransaksiList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedTransaksiId, setSelectedTransaksiId] = useState(null);

    // State Filter: "today" (Hari Ini) | "yesterday" (Kemarin) | "7days" | "all" | "custom"
    const [filterType, setFilterType] = useState("today");
    const [customDate, setCustomDate] = useState("");

    // Helper tanggal lokal YYYY-MM-DD
    const getLocalDateString = (dateObj) => {
        const d = new Date(dateObj);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const todayStr = useMemo(() => getLocalDateString(new Date()), []);

    const yesterdayStr = useMemo(() => {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        return getLocalDateString(y);
    }, []);

    const sevenDaysAgoStr = useMemo(() => {
        const s = new Date();
        s.setDate(s.getDate() - 7);
        return getLocalDateString(s);
    }, []);

    const fetchTransaksi = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/transaksi");
            if (res.data?.success) {
                setTransaksiList(res.data.data);
            }
        } catch (error) {
            console.error("Gagal load transaksi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransaksi();
    }, []);

    // Filter transaksi berdasarkan tanggal & pencarian
    const filtered = useMemo(() => {
        return transaksiList.filter((trx) => {
            const rawDate = trx.tanggal_transaksi || trx.created_at;
            const trxDate = rawDate ? getLocalDateString(rawDate) : "";

            // 1. Filter Tanggal
            let matchDate = true;
            if (filterType === "today") {
                matchDate = trxDate === todayStr;
            } else if (filterType === "yesterday") {
                matchDate = trxDate === yesterdayStr;
            } else if (filterType === "7days") {
                matchDate = trxDate >= sevenDaysAgoStr && trxDate <= todayStr;
            } else if (filterType === "custom" && customDate) {
                matchDate = trxDate === customDate;
            }

            if (!matchDate) return false;

            // 2. Filter Search Query
            const idStr = String(trx.id);
            const tglStr = String(rawDate || "");
            const query = searchQuery.toLowerCase();
            return idStr.includes(query) || tglStr.includes(query);
        });
    }, [transaksiList, filterType, customDate, searchQuery, todayStr, yesterdayStr, sevenDaysAgoStr]);

    // Ringkasan Penjualan dari data yang sedang difilter
    const totalOmset = useMemo(() => {
        return filtered.reduce((acc, curr) => acc + Number(curr.total_harga || 0), 0);
    }, [filtered]);

    const totalQty = useMemo(() => {
        return filtered.reduce((acc, curr) => acc + Number(curr.total_qty || 0), 0);
    }, [filtered]);

    // Handler Reset Seluruh Riwayat Transaksi
    const handleResetRiwayat = async () => {
        const confirmReset = window.confirm(
            "⚠️ PERINGATAN!\n\nApakah Anda yakin ingin MERESET/MENGHAPUS seluruh riwayat transaksi?\n" +
            "Semua riwayat penjualan akan dikosongkan dan tidak dapat dikembalikan."
        );
        if (!confirmReset) return;

        try {
            setLoading(true);
            const res = await api.delete("/api/transaksi/reset");
            if (res.data?.success) {
                alert("✓ Seluruh riwayat transaksi berhasil di-reset menjadi kosong!");
                fetchTransaksi();
            }
        } catch (err) {
            console.error("Gagal reset riwayat:", err);
            alert(err.response?.data?.message || "Gagal mereset riwayat transaksi.");
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (val) => `Rp ${Number(val).toLocaleString("id-ID")}`;

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return d.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="flex min-h-screen bg-[#ECEAE6]">
            <Sidebar />

            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto animate-page-enter">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Kelola Transaksi</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Pantau data penjualan harian, pendapatan, dan cetak ulang nota</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={fetchTransaksi}
                            className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl shadow-2xs hover:bg-gray-50 text-xs font-bold text-gray-700 cursor-pointer transition-all border border-gray-100"
                        >
                            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Kartu Ringkasan Penjualan */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold">Total Pendapatan</p>
                            <p className="text-base font-extrabold text-gray-900 leading-tight">
                                {formatRupiah(totalOmset)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                            <Receipt size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold">Total Transaksi</p>
                            <p className="text-base font-extrabold text-gray-900 leading-tight">
                                {filtered.length} Transaksi
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-400 font-semibold">Total Menu Terjual</p>
                            <p className="text-base font-extrabold text-gray-900 leading-tight">
                                {totalQty} Item
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Tab, Search & Reset */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3 rounded-3xl shadow-2xs border border-gray-100">
                    {/* Tab Cepat */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                setFilterType("today");
                                setCustomDate("");
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                filterType === "today"
                                    ? "bg-[#3D3D3D] text-white shadow-xs"
                                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                            }`}
                        >
                            Hari Ini
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setFilterType("yesterday");
                                setCustomDate("");
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                filterType === "yesterday"
                                    ? "bg-[#3D3D3D] text-white shadow-xs"
                                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                            }`}
                        >
                            Kemarin
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setFilterType("7days");
                                setCustomDate("");
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                filterType === "7days"
                                    ? "bg-[#3D3D3D] text-white shadow-xs"
                                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                            }`}
                        >
                            7 Hari Terakhir
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setFilterType("all");
                                setCustomDate("");
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                filterType === "all"
                                    ? "bg-[#3D3D3D] text-white shadow-xs"
                                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                            }`}
                        >
                            Semua
                        </button>
                    </div>

                    {/* Search, Filter Kalender & Tombol Reset */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search Input */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
                            <Search size={13} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari ID / tanggal..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent text-xs outline-none text-gray-700 placeholder:text-gray-400 w-32"
                            />
                        </div>

                        {/* Date Picker */}
                        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-xl text-xs">
                            <Calendar size={13} className="text-gray-400" />
                            <input
                                type="date"
                                value={customDate}
                                onChange={(e) => {
                                    setCustomDate(e.target.value);
                                    if (e.target.value) setFilterType("custom");
                                }}
                                className="bg-transparent text-xs text-gray-700 outline-none cursor-pointer font-semibold"
                            />
                        </div>

                        {/* Reset Button */}
                        <button
                            type="button"
                            onClick={handleResetRiwayat}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                            title="Reset Seluruh Riwayat Transaksi"
                        >
                            <Trash2 size={13} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                            <span className="text-xs">Memuat transaksi...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <Receipt size={36} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm font-bold text-gray-600">
                                {filterType === "today"
                                    ? "Belum ada transaksi hari ini"
                                    : filterType === "yesterday"
                                    ? "Tidak ada transaksi kemarin"
                                    : "Tidak ada riwayat transaksi"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                                {filterType === "today"
                                    ? "Transaksi baru yang diselesaikan kasir hari ini akan otomatis tercatat di sini."
                                    : "Silakan pilih tab 'Hari Ini' atau 'Semua' untuk melihat data lainnya."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                                        <th className="pb-3 px-3">No. Nota</th>
                                        <th className="pb-3 px-3">Waktu</th>
                                        <th className="pb-3 px-3">Total Belanja</th>
                                        <th className="pb-3 px-3">Uang Bayar</th>
                                        <th className="pb-3 px-3">Kembalian</th>
                                        <th className="pb-3 px-3 text-center">Status</th>
                                        <th className="pb-3 px-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-3 px-3 font-bold text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <Receipt size={14} className="text-gray-400" />
                                                    <span>#{String(trx.id).padStart(4, "0")}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-gray-600">
                                                <div className="font-semibold text-gray-800">
                                                    {formatDate(trx.tanggal_transaksi || trx.created_at)}
                                                </div>
                                                <div className="text-[10px] text-gray-400">
                                                    Pukul {formatTime(trx.created_at || trx.tanggal_transaksi)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 font-bold text-gray-900">{formatRupiah(trx.total_harga)}</td>
                                            <td className="py-3 px-3 text-gray-600">{formatRupiah(trx.uang_bayar)}</td>
                                            <td className="py-3 px-3 text-emerald-600 font-semibold">
                                                {Number(trx.kembalian) === 0 ? "Uang Pas" : formatRupiah(trx.kembalian)}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                                                    Selesai
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedTransaksiId(trx.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-[#3D3D3D] hover:text-white text-gray-700 font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                                                >
                                                    <Eye size={13} />
                                                    <span>Struk & Detail</span>
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
