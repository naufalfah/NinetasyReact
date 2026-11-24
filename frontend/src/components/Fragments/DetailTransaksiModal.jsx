// DetailTransaksiModal.jsx — Modal rincian nota transaksi & cetak struk thermal kasir
import React, { useState, useEffect } from "react";
import api, { getImageUrl } from "../../api";
import { X, Receipt, Calendar, ShoppingBag, CheckCircle2, Printer, FileText } from "lucide-react";
import defaultImage from "../../assets/gabin-ice-cream.png";
import "../../styles/receipt.css";

export default function DetailTransaksiModal({ transaksiId, onClose }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("menu"); // "menu" | "struk"

    // Ambil nama kasir yang sedang login
    const savedUser = localStorage.getItem("user");
    let kasirName = "Kasir Ninetasy";
    try {
        if (savedUser) {
            const u = JSON.parse(savedUser);
            kasirName = u.name || "Kasir Ninetasy";
        }
    } catch (e) {
        kasirName = "Kasir Ninetasy";
    }

    useEffect(() => {
        if (!transaksiId) return;

        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/api/transaksi/${transaksiId}`);
                if (res.data?.success) {
                    setDetail(res.data.data);
                }
            } catch (err) {
                console.error("Gagal load detail transaksi:", err);
                alert("Gagal memuat rincian transaksi.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [transaksiId]);

    if (!transaksiId) return null;

    const formatRupiah = (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
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

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-page-enter">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
                {/* Header Modal */}
                <div className="p-5 pb-3 border-b border-gray-100 flex items-center justify-between bg-[#F8F7F5]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#3D3D3D] text-white flex items-center justify-center">
                            <Receipt size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                                Nota Transaksi
                            </h2>
                            <p className="text-xs text-gray-400 font-semibold">
                                #{String(transaksiId).padStart(4, "0")}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-black p-1.5 rounded-xl hover:bg-gray-200/60 transition-colors cursor-pointer"
                        aria-label="Tutup"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tab Switcher: Detail Menu vs Preview Struk Thermal */}
                <div className="flex items-center justify-center gap-2 px-6 pt-3 pb-1 border-b border-gray-100 bg-white">
                    <button
                        type="button"
                        onClick={() => setActiveTab("menu")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "menu"
                                ? "bg-[#3D3D3D] text-white shadow-xs"
                                : "text-gray-500 hover:text-black hover:bg-gray-100"
                        }`}
                    >
                        <ShoppingBag size={14} />
                        <span>Rincian Menu</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("struk")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "struk"
                                ? "bg-[#3D3D3D] text-white shadow-xs"
                                : "text-gray-500 hover:text-black hover:bg-gray-100"
                        }`}
                    >
                        <FileText size={14} />
                        <span>Preview Struk Kasir</span>
                    </button>
                </div>

                {/* Content Modal */}
                <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#FAF9F7]/40">
                    {loading ? (
                        <div className="py-16 text-center text-xs text-gray-400 animate-pulse">
                            Memuat rincian transaksi...
                        </div>
                    ) : !detail ? (
                        <div className="py-16 text-center text-xs text-red-500">
                            Data transaksi tidak ditemukan.
                        </div>
                    ) : activeTab === "menu" ? (
                        /* TAB 1: Rincian Menu Modern */
                        <>
                            {/* Info Tanggal & Status */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between text-xs shadow-2xs">
                                <div className="flex items-center gap-2.5 text-gray-600">
                                    <Calendar size={15} className="text-gray-400" />
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {formatDateTime(detail.tanggal_transaksi || detail.created_at)}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            Waktu: {formatTime(detail.created_at || detail.tanggal_transaksi)} WIB
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded-full text-[11px]">
                                    <CheckCircle2 size={13} />
                                    <span>Lunas (Cash)</span>
                                </div>
                            </div>

                            {/* Daftar Barang yang Dibeli */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-800">
                                    <ShoppingBag size={15} className="text-gray-500" />
                                    <span>Barang yang Dibeli ({detail.items?.length || 0} Menu)</span>
                                </div>

                                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
                                    {detail.items && detail.items.length > 0 ? (
                                        detail.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3.5 flex items-center justify-between hover:bg-gray-50/60 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <img
                                                            src={getImageUrl(item.gambar) || defaultImage}
                                                            alt={item.nama_produk}
                                                            onError={(e) => {
                                                                if (e.currentTarget.src !== defaultImage) {
                                                                    e.currentTarget.src = defaultImage;
                                                                }
                                                            }}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900 leading-tight">
                                                            {item.nama_produk}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                                            {item.qty} × {formatRupiah(item.harga)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-xs font-extrabold text-gray-900">
                                                    {formatRupiah(item.subtotal)}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-4 text-center text-xs text-gray-400">
                                            Tidak ada rincian item.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Ringkasan Pembayaran */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 text-xs space-y-2.5 shadow-2xs">
                                <div className="flex justify-between text-gray-600">
                                    <span>Total Belanja</span>
                                    <span className="font-bold text-gray-900">{formatRupiah(detail.total_harga)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Uang Diterima</span>
                                    <span className="font-semibold text-gray-800">{formatRupiah(detail.uang_bayar)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-emerald-600 font-bold">
                                    <span>Uang Kembalian</span>
                                    {Number(detail.kembalian) === 0 ? (
                                        <span className="bg-emerald-50 px-2.5 py-0.5 rounded-md text-[11px]">
                                            Uang Pas
                                        </span>
                                    ) : (
                                        <span>{formatRupiah(detail.kembalian)}</span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* TAB 2: Preview Kertas Struk Thermal Kasir */
                        <div className="py-2">
                            <div className="receipt-paper">
                                <div className="receipt-center">
                                    <h2 className="text-base font-black tracking-wider m-0">NINETASY</h2>
                                    <p className="receipt-bold text-[10px] mt-0.5">COFFEE, DESSERT & STORE</p>
                                    <p className="text-[9.5px] text-gray-600">Jl. Raya Rungkut No. 99, Surabaya</p>
                                    <p className="text-[9.5px] text-gray-600">Telp: 0812-3456-7890</p>
                                </div>

                                <div className="receipt-line"></div>

                                <div className="receipt-row text-[10px]">
                                    <span>No. Nota:</span>
                                    <span className="receipt-bold">#{String(transaksiId).padStart(4, "0")}</span>
                                </div>
                                <div className="receipt-row text-[10px]">
                                    <span>Tanggal:</span>
                                    <span>
                                        {new Date(detail.created_at || detail.tanggal_transaksi).toLocaleString("id-ID", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <div className="receipt-row text-[10px]">
                                    <span>Kasir:</span>
                                    <span>{kasirName}</span>
                                </div>
                                <div className="receipt-row text-[10px]">
                                    <span>Metode:</span>
                                    <span>TUNAI (CASH)</span>
                                </div>

                                <div className="receipt-line"></div>

                                <p className="receipt-bold text-[10px] mb-1.5">RINCIAN PESANAN:</p>

                                {detail.items?.map((item, index) => (
                                    <div key={index} className="mb-2">
                                        <div className="receipt-row">
                                            <span className="receipt-bold">{item.nama_produk}</span>
                                            <span>{formatRupiah(item.subtotal)}</span>
                                        </div>
                                        <div className="text-[9.5px] text-gray-600">
                                            {item.qty} × {formatRupiah(item.harga)}
                                        </div>
                                    </div>
                                ))}

                                <div className="receipt-line"></div>

                                <div className="receipt-row text-[10px]">
                                    <span>Total Item:</span>
                                    <span>
                                        {detail.items?.reduce((acc, curr) => acc + Number(curr.qty || 1), 0)} pcs
                                    </span>
                                </div>
                                <div className="receipt-row receipt-bold text-xs mt-1">
                                    <span>TOTAL:</span>
                                    <span>{formatRupiah(detail.total_harga)}</span>
                                </div>
                                <div className="receipt-row text-[10px] mt-0.5">
                                    <span>TUNAI:</span>
                                    <span>{formatRupiah(detail.uang_bayar)}</span>
                                </div>
                                <div className="receipt-row receipt-bold text-[10px] mt-0.5 text-emerald-700">
                                    <span>KEMBALI:</span>
                                    <span>
                                        {Number(detail.kembalian) === 0 ? "UANG PAS" : formatRupiah(detail.kembalian)}
                                    </span>
                                </div>

                                <div className="receipt-line"></div>

                                <div className="receipt-center text-[10px] mt-3">
                                    <p className="receipt-bold">TERIMA KASIH</p>
                                    <p>ATAS KUNJUNGAN ANDA</p>
                                    <p className="text-[8.5px] text-gray-500 mt-1">
                                        Barang yang sudah dibeli tidak dapat ditukar
                                    </p>
                                    <p className="text-[8.5px] text-gray-400">www.ninetasy.com</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Area Print Khusus Thermal (hanya muncul saat window.print() dipanggil) */}
                {detail && (
                    <div className="receipt-print">
                        <div className="receipt-center">
                            <h2>NINETASY</h2>
                            <p className="receipt-bold">COFFEE, DESSERT & STORE</p>
                            <p>Jl. Raya Rungkut No. 99, Surabaya</p>
                            <p>Telp: 0812-3456-7890</p>
                        </div>

                        <div className="receipt-line"></div>

                        <div className="receipt-row">
                            <span>No. Nota:</span>
                            <span className="receipt-bold">#{String(transaksiId).padStart(4, "0")}</span>
                        </div>
                        <div className="receipt-row">
                            <span>Waktu:</span>
                            <span>
                                {new Date(detail.created_at || detail.tanggal_transaksi).toLocaleString("id-ID", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                        <div className="receipt-row">
                            <span>Kasir:</span>
                            <span>{kasirName}</span>
                        </div>
                        <div className="receipt-row">
                            <span>Metode:</span>
                            <span>TUNAI (CASH)</span>
                        </div>

                        <div className="receipt-line"></div>

                        <div className="receipt-bold" style={{ marginBottom: "4px" }}>
                            RINCIAN PESANAN:
                        </div>

                        {detail.items?.map((item, index) => (
                            <div key={index} style={{ marginBottom: "4px" }}>
                                <div className="receipt-row">
                                    <span className="receipt-bold">{item.nama_produk}</span>
                                    <span>{formatRupiah(item.subtotal)}</span>
                                </div>
                                <div style={{ color: "#333", fontSize: "9px" }}>
                                    {item.qty} × {formatRupiah(item.harga)}
                                </div>
                            </div>
                        ))}

                        <div className="receipt-line"></div>

                        <div className="receipt-row">
                            <span>Total Item:</span>
                            <span>
                                {detail.items?.reduce((acc, curr) => acc + Number(curr.qty || 1), 0)} pcs
                            </span>
                        </div>
                        <div className="receipt-row receipt-bold" style={{ fontSize: "12px", marginTop: "2px" }}>
                            <span>TOTAL:</span>
                            <span>{formatRupiah(detail.total_harga)}</span>
                        </div>
                        <div className="receipt-row">
                            <span>TUNAI:</span>
                            <span>{formatRupiah(detail.uang_bayar)}</span>
                        </div>
                        <div className="receipt-row receipt-bold">
                            <span>KEMBALI:</span>
                            <span>
                                {Number(detail.kembalian) === 0 ? "UANG PAS" : formatRupiah(detail.kembalian)}
                            </span>
                        </div>

                        <div className="receipt-line"></div>

                        <div className="receipt-center" style={{ marginTop: "6px" }}>
                            <p className="receipt-bold">TERIMA KASIH</p>
                            <p>ATAS KUNJUNGAN ANDA</p>
                            <p style={{ fontSize: "8.5px", marginTop: "3px", color: "#555" }}>
                                Barang yang sudah dibeli tidak dapat ditukar
                            </p>
                            <p style={{ fontSize: "8.5px", color: "#777" }}>www.ninetasy.com</p>
                        </div>
                    </div>
                )}

                {/* Footer Modal */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-[#F8F7F5]">
                    <span className="text-[11px] text-gray-400 hidden sm:inline">
                        Format siap cetak printer thermal 58mm / 80mm
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-gray-200/80 hover:bg-gray-300 text-gray-800 text-xs font-bold cursor-pointer transition-colors"
                        >
                            Tutup
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#3D3D3D] hover:bg-black text-white text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
                        >
                            <Printer size={15} />
                            <span>Cetak Struk</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
