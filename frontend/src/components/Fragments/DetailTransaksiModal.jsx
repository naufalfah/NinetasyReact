// DetailTransaksiModal.jsx — Modal rincian nota transaksi & cetak struk thermal kasir / PDF
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api, { getImageUrl } from "../../api";
import { X, Receipt, ShoppingBag, CheckCircle2, Printer, FileText } from "lucide-react";
import defaultImage from "../../assets/gabin-ice-cream.png";
import "../../styles/receipt.css";

export default function DetailTransaksiModal({ transaksiId, onClose }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("menu"); // "menu" | "struk"
    const [printSize, setPrintSize] = useState("80mm"); // "58mm" | "80mm" | "a4"

    // Ambil nama kasir yang sedang login
    const savedUser = localStorage.getItem("user");
    let kasirName = "Natasya Sandhyta A.P";
    try {
        if (savedUser) {
            const u = JSON.parse(savedUser);
            kasirName = u.name || "Natasya Sandhyta A.P";
        }
    } catch (e) {
        kasirName = "Natasya Sandhyta A.P";
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
        <>
            {/* MODAL ON SCREEN PREVIEW (Ada di dalam #root, disembunyikan saat cetak) */}
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
                    <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setActiveTab("menu")}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === "struk"
                                        ? "bg-[#3D3D3D] text-white shadow-xs"
                                        : "text-gray-500 hover:text-black hover:bg-gray-100"
                                }`}
                            >
                                <FileText size={14} />
                                <span>Preview Struk</span>
                            </button>
                        </div>

                        {/* Pengatur Ukuran Kertas */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setPrintSize("58mm")}
                                title="Format printer thermal kecil 58mm"
                                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                                    printSize === "58mm"
                                        ? "bg-[#3D3D3D] text-white shadow-xs"
                                        : "text-gray-500 hover:text-black"
                                }`}
                            >
                                58mm
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrintSize("80mm")}
                                title="Format printer kasir standar 80mm"
                                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                                    printSize === "80mm"
                                        ? "bg-[#3D3D3D] text-white shadow-xs"
                                        : "text-gray-500 hover:text-black"
                                }`}
                            >
                                80mm
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrintSize("a4")}
                                title="Format besar untuk kertas biasa / Microsoft Print to PDF"
                                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                                    printSize === "a4"
                                        ? "bg-[#3D3D3D] text-white shadow-xs"
                                        : "text-gray-500 hover:text-black"
                                }`}
                            >
                                A4 / PDF
                            </button>
                        </div>
                    </div>

                    {/* Body Modal */}
                    <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#FAF9F7]">
                        {loading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                                <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                                <span className="text-xs">Memuat detail transaksi...</span>
                            </div>
                        ) : !detail ? (
                            <div className="py-8 text-center text-xs text-gray-400">
                                Data transaksi tidak ditemukan.
                            </div>
                        ) : activeTab === "menu" ? (
                            /* TAB 1: Rincian Menu Modern */
                            <>
                                {/* Status Sukses */}
                                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 text-emerald-800">
                                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                                    <div className="text-xs">
                                        <span className="font-bold">Transaksi Selesai</span>
                                        <p className="text-[11px] text-emerald-600">
                                            {formatDateTime(detail.created_at || detail.tanggal_transaksi)} • {formatTime(detail.created_at || detail.tanggal_transaksi)}
                                        </p>
                                    </div>
                                </div>

                                {/* Info Kasir & Pembayaran */}
                                <div className="grid grid-cols-2 gap-2 text-xs bg-white border border-gray-100 p-3.5 rounded-2xl shadow-2xs">
                                    <div>
                                        <span className="text-gray-400 block text-[11px]">Kasir</span>
                                        <span className="font-bold text-gray-800">{kasirName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-[11px]">Metode Bayar</span>
                                        <span className="font-bold text-gray-800">Tunai (Cash)</span>
                                    </div>
                                </div>

                                {/* Daftar Barang */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 px-1">
                                        <span>Menu yang Dipesan</span>
                                        <span className="text-gray-400 font-medium">
                                            {detail.items?.reduce((acc, curr) => acc + Number(curr.qty || 1), 0)} Item
                                        </span>
                                    </div>

                                    <div className="bg-white border border-gray-100 rounded-2xl p-3 divide-y divide-gray-50 shadow-2xs">
                                        {detail.items?.length > 0 ? (
                                            detail.items.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between py-2.5 first:pt-1 last:pb-1"
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
                                <div className={`receipt-paper size-${printSize}`}>
                                    <div className="receipt-center">
                                        <h2 className="receipt-bold tracking-wider m-0">NINETASY</h2>
                                        <p className="receipt-bold mt-0.5">The Fairy Pantry</p>
                                        <p className="text-gray-600">Jl. Raya Pulorejo, Kec. Prajurit Kulon, Kota. Mojokerto</p>
                                        <p className="text-gray-600">Telp: 0821-4363-5239</p>
                                    </div>

                                    <div className="receipt-line"></div>

                                    <div className="receipt-row">
                                        <span>No. Nota:</span>
                                        <span className="receipt-bold">#{String(transaksiId).padStart(4, "0")}</span>
                                    </div>
                                    <div className="receipt-row">
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
                                    <div className="receipt-row">
                                        <span>Kasir:</span>
                                        <span>{kasirName}</span>
                                    </div>
                                    <div className="receipt-row">
                                        <span>Metode:</span>
                                        <span>TUNAI (CASH)</span>
                                    </div>

                                    <div className="receipt-line"></div>

                                    <p className="receipt-bold mb-1.5">RINCIAN PESANAN:</p>

                                    {detail.items?.map((item, index) => (
                                        <div key={index} className="mb-2">
                                            <div className="receipt-row receipt-bold">
                                                <span>{item.nama_produk}</span>
                                                <span>{formatRupiah(item.subtotal)}</span>
                                            </div>
                                            <div className="text-[0.85em] text-gray-600">
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
                                    <div className="receipt-row receipt-bold" style={{ fontSize: "1.15em", marginTop: "3px" }}>
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

                                    <div className="receipt-center mt-3">
                                        <p className="receipt-bold">TERIMA KASIH</p>
                                        <p>ATAS KUNJUNGAN ANDA</p>
                                        <p className="text-[0.82em] text-gray-500 mt-1">
                                            Barang yang sudah dibeli tidak dapat ditukar
                                        </p>
                                        <p className="text-[0.82em] text-gray-500">www.ninetasy.com</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Modal */}
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-[#F8F7F5]">
                        <span className="text-[11px] text-gray-500">
                            {printSize === "a4"
                                ? "Format: Kertas A4 / PDF (Besar & Jelas)"
                                : printSize === "80mm"
                                ? "Format: Thermal 80mm (Standar Kasir POS)"
                                : "Format: Thermal 58mm (Kecil)"}
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

            {/* TEMPLATE KHUSUS CETAK PRINTER THERMAL / PDF
                Di-portal langsung ke document.body (di luar #root)
                sehingga tidak tertimpa overlay / backdrop-blur modal yang membuat printer thermal nge-bug */}
            {detail && typeof document !== "undefined" && createPortal(
                <div id="receipt-print-container" className={`receipt-print size-${printSize}`}>
                    <div className="receipt-center">
                        <h2>NINETASY</h2>
                        <p className="receipt-bold">The Fairy Pantry</p>
                        <p>Jl. Raya Pulorejo, Kec. Prajurit Kulon, Kota. Mojokerto</p>
                        <p>Telp: 0821-4363-5239</p>
                    </div>

                    <div className="receipt-line"></div>

                    <div className="receipt-row">
                        <span>No. Nota:</span>
                        <span className="receipt-bold">#{String(transaksiId).padStart(4, "0")}</span>
                    </div>
                    <div className="receipt-row">
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
                    <div className="receipt-row">
                        <span>Kasir:</span>
                        <span>{kasirName}</span>
                    </div>
                    <div className="receipt-row">
                        <span>Metode:</span>
                        <span>TUNAI (CASH)</span>
                    </div>

                    <div className="receipt-line"></div>

                    <div className="receipt-bold" style={{ marginBottom: "5px" }}>
                        RINCIAN PESANAN:
                    </div>

                    {detail.items?.map((item, index) => (
                        <div key={index} style={{ marginBottom: "5px" }}>
                            <div className="receipt-row receipt-bold">
                                <span>{item.nama_produk}</span>
                                <span>{formatRupiah(item.subtotal)}</span>
                            </div>
                            {/* Warna murni hitam pekat dan bold agar jelas di printer thermal */}
                            <div style={{ color: "#000000", fontSize: "0.88em", fontWeight: "bold" }}>
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
                    <div className="receipt-row receipt-bold" style={{ fontSize: "1.2em", marginTop: "4px" }}>
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

                    <div className="receipt-center" style={{ marginTop: "8px" }}>
                        <p className="receipt-bold">TERIMA KASIH</p>
                        <p>ATAS KUNJUNGAN ANDA</p>
                        <p style={{ fontSize: "0.85em", marginTop: "3px", fontWeight: "bold" }}>
                            Barang yang sudah dibeli tidak dapat ditukar
                        </p>
                        <p style={{ fontSize: "0.85em" }}>www.ninetasy.com</p>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
