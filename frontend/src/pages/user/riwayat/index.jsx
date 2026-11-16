// pages/user/riwayat/index.jsx — Halaman Riwayat Transaksi Kasir
import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Layouts/Sidebar";
import DetailTransaksiModal from "../../../components/Fragments/DetailTransaksiModal";
import api from "../../../api";
import { Clock, Receipt, RefreshCw, Eye } from "lucide-react";

export default function UserRiwayat() {
    const [transaksi, setTransaksi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaksiId, setSelectedTransaksiId] = useState(null);

    const fetchRiwayat = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/transaksi");
            if (res.data?.success) {
                setTransaksi(res.data.data);
            }
        } catch (error) {
            console.error("Gagal load transaksi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRiwayat();
    }, []);

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

    return (
        <div className="flex min-h-screen bg-[#ECEAE6]">
            <Sidebar />

            <main className="flex-1 p-8 overflow-y-auto animate-page-enter">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900">Riwayat Transaksi</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Daftar transaksi penjualan kasir terbaru</p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchRiwayat}
                        className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer transition-all"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Content Table / Cards */}
                <div className="bg-white rounded-3xl p-6 shadow-sm">
                    {loading ? (
                        <p className="text-center py-12 text-sm text-gray-400">Memuat data riwayat...</p>
                    ) : transaksi.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock size={36} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm font-semibold text-gray-500">Belum ada transaksi</p>
                            <p className="text-xs text-gray-400 mt-1">Transaksi yang diselesaikan di kasir akan muncul di sini.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                                        <th className="pb-3 px-3">No. Transaksi</th>
                                        <th className="pb-3 px-3">Tanggal</th>
                                        <th className="pb-3 px-3">Total Belanja</th>
                                        <th className="pb-3 px-3">Uang Diterima</th>
                                        <th className="pb-3 px-3">Kembalian</th>
                                        <th className="pb-3 px-3 text-center">Status</th>
                                        <th className="pb-3 px-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {transaksi.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="py-3.5 px-3 font-bold text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <Receipt size={14} className="text-gray-400" />
                                                    <span>#{String(trx.id).padStart(4, "0")}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3 text-gray-600">
                                                {formatDate(trx.tanggal_transaksi || trx.created_at)}
                                            </td>
                                            <td className="py-3.5 px-3 font-bold text-gray-900">
                                                {formatRupiah(trx.total_harga)}
                                            </td>
                                            <td className="py-3.5 px-3 text-gray-600">
                                                {formatRupiah(trx.uang_bayar)}
                                            </td>
                                            <td className="py-3.5 px-3 text-emerald-600 font-semibold">
                                                {formatRupiah(trx.kembalian)}
                                            </td>
                                            <td className="py-3.5 px-3 text-center">
                                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                                                    Selesai
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedTransaksiId(trx.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-[#3D3D3D] hover:text-white text-gray-700 font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                                                >
                                                    <Eye size={13} />
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
