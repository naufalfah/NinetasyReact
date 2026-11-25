// CartSidebar.jsx — Panel keranjang "Detail Transaksi" di sisi kanan
// Terhubung langsung ke database MySQL (db_react_ninetasy) via API backend

import React, { useState, useMemo } from "react"; // Import React dan hooks
import { Trash2, Plus, Minus } from "lucide-react"; // Import ikon dari lucide-react
import api, { getImageUrl } from "../../api"; // Instance axios & helper gambar backend
import defaultImage from "../../assets/gabin-ice-cream.png";
import DetailTransaksiModal from "./DetailTransaksiModal";

// Props yang diterima komponen:
//   - cart: array item keranjang [{...produk, qty: number}]
//   - onUpdateQty: fungsi update jumlah (id, newQty)
//   - onRemoveItem: fungsi hapus item (id)
//   - onClearCart: fungsi kosongkan keranjang
export default function CartSidebar({ cart = [], onUpdateQty, onRemoveItem, onClearCart }) {

    // State input jumlah uang yang dibayarkan pelanggan
    const [uang, setUang] = useState("");

    // State loading saat request pembayaran sedang dikirim ke database
    const [loading, setLoading] = useState(false);

    // State untuk membuka modal struk otomatis setelah pembayaran berhasil
    const [successTransaksiId, setSuccessTransaksiId] = useState(null);

    // Hitung subtotal seluruh item di keranjang
    const subtotal = useMemo(() => {
        return cart.reduce((total, item) => {
            const harga = item.harga ?? item.price ?? 0;
            return total + harga * item.qty;
        }, 0);
    }, [cart]);

    // Parse input uang ke angka murni
    const uangNum = parseInt(uang, 10) || 0;

    // Hitung kembalian (jika uang kurang dari subtotal, kembalian = 0)
    const kembali = uangNum > subtotal ? uangNum - subtotal : 0;

    // Format angka ke format mata uang Indonesia
    const formatRupiah = (val) => `Rp. ${val.toLocaleString("id-ID")},00`;

    // Handler tombol bayar: validasi dan simpan ke database
    const handleBayar = async () => {
        // Validasi keranjang tidak boleh kosong
        if (cart.length === 0) {
            alert("Keranjang masih kosong! Silakan pilih produk terlebih dahulu.");
            return;
        }

        // Validasi uang bayar tidak boleh kurang dari subtotal
        if (uangNum < subtotal) {
            alert(`Uang pembayaran kurang!\nTotal: ${formatRupiah(subtotal)}\nUang diterima: ${formatRupiah(uangNum)}`);
            return;
        }

        try {
            setLoading(true); // Aktifkan indikator loading

            // Siapkan payload data transaksi untuk dikirim ke backend
            const payload = {
                total_harga: subtotal, // Total biaya belanja
                uang_bayar: uangNum, // Nominal uang yang diterima
                kembalian: kembali, // Nilai uang kembalian
                items: cart.map((item) => ({
                    id: item.id || null, // ID produk
                    name: item.name, // Nama produk
                    harga: item.harga ?? item.price ?? 0, // Harga satuan
                    qty: item.qty, // Jumlah item yang dibeli
                })),
            };

            // Kirim request POST ke endpoint backend /api/transaksi
            const response = await api.post("/api/transaksi", payload);

            if (response.data?.success) {
                const trxId = response.data.data?.transaksi_id || "";
                // Tampilkan Modal Struk Transaksi secara otomatis
                setSuccessTransaksiId(trxId);

                // Kosongkan keranjang belanja setelah berhasil
                if (onClearCart) onClearCart();
                // Reset input uang pembayaran
                setUang("");
            }
        } catch (error) {
            console.error("Gagal menyimpan transaksi:", error);
            const errorMsg =
                error.response?.data?.message ||
                "Gagal terhubung ke server backend! Pastikan backend Express sudah berjalan di port 3000.";
            alert(` Error: ${errorMsg}`);
        } finally {
            setLoading(false); // Matikan loading setelah selesai
        }
    };

    // Nomor order sederhana berdasarkan jumlah item saat ini
    const orderNumber = `#${String(cart.length).padStart(3, "0")}`;

    return (
        <>
        {/* Sidebar kanan — flex-shrink-0, sticky mengikuti scroll */}
        <aside className="w-72 min-h-screen flex-shrink-0 relative">
            <div className="sticky top-0 h-screen pt-20">
                {/* Panel putih dengan sudut bulat di kiri atas */}
                <div className="h-full w-72 rounded-tl-[50px] bg-white shadow-xl flex flex-col">
                    {/* Header: Judul panel dan nomor order */}
                    <div className="p-6 pb-3">
                        <h2 className="text-lg font-bold text-gray-900">Detail Transaksi</h2>
                        <p className="text-xs text-gray-400 mt-1">{orderNumber}</p>
                    </div>

                    {/* Garis pemisah */}
                    <hr className="border-gray-100 mx-6" />

                    {/* Daftar item belanja di keranjang — scrollable */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        {/* Pesan jika keranjang masih kosong */}
                        {cart.length === 0 && (
                            <p className="text-center text-gray-300 text-xs py-10">
                                Belum ada item di keranjang
                            </p>
                        )}

                        {/* Loop seluruh item di keranjang */}
                        {cart.map((item) => {
                            const harga = item.harga ?? item.price ?? 0;
                            return (
                                <div key={item.id} className="flex items-start gap-3">
                                    {/* Thumbnail gambar produk */}
                                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img
                                            src={getImageUrl(item.image || item.gambar) || defaultImage}
                                            alt={item.name || item.nama_produk}
                                            onError={(e) => {
                                                if (e.currentTarget.src !== defaultImage) {
                                                    e.currentTarget.src = defaultImage;
                                                }
                                            }}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info produk: nama, kategori, harga */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                                        <p className="text-[10px] text-gray-400">{item.kategori || "Lainnya"}</p>
                                        <p className="text-[11px] font-semibold text-gray-700 mt-0.5">
                                            {formatRupiah(harga)}
                                        </p>
                                        {/* Kontrol kuantitas (- angka +) */}
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQty && onUpdateQty(item.id, item.qty - 1)}
                                                className="w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer"
                                                aria-label="Kurangi qty"
                                            >
                                                <Minus size={10} />
                                            </button>
                                            <span className="text-[11px] font-semibold min-w-4 text-center">{item.qty}</span>
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQty && onUpdateQty(item.id, item.qty + 1)}
                                                className="w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer"
                                                aria-label="Tambah qty"
                                            >
                                                <Plus size={10} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tombol hapus item */}
                                    <button
                                        type="button"
                                        onClick={() => onRemoveItem && onRemoveItem(item.id)}
                                        className="text-red-400 hover:text-red-600 cursor-pointer p-1 mt-1"
                                        aria-label="Hapus item"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Ringkasan pembayaran dan tombol submit */}
                    <div className="px-6 pb-6 pt-3 border-t border-gray-100 space-y-2">
                        {/* Subtotal */}
                        <div className="flex justify-between text-xs">
                            <span className="font-bold text-gray-600">Subtotal</span>
                            <span className="text-gray-700">{formatRupiah(subtotal)}</span>
                        </div>
                        {/* Input uang pembayaran */}
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-600">Uang</span>
                            <input
                                type="number"
                                value={uang}
                                onChange={(e) => setUang(e.target.value)}
                                placeholder="0"
                                className="w-28 text-right text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-gray-400"
                            />
                        </div>
                        {/* Kembalian */}
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-600">Kembali</span>
                            {subtotal > 0 && uangNum === subtotal ? (
                                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    Uang Pas
                                </span>
                            ) : (
                                <span className="text-gray-700 font-medium">{formatRupiah(kembali)}</span>
                            )}
                        </div>
                        {/* Tombol bayar / simpan transaksi */}
                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleBayar}
                            className={`w-full py-2.5 rounded-2xl font-bold text-sm bg-[#3D3D3D] text-white hover:bg-[#2D2D2D] active:scale-[0.98] transition-all cursor-pointer mt-2 ${
                                loading ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                        >
                            {loading ? "Menyimpan..." : "Bayar"}
                        </button>
                    </div>
                </div>
            </div>
        </aside>

        {/* Modal Cetak Struk Otomatis setelah transaksi berhasil */}
        {successTransaksiId && (
            <DetailTransaksiModal
                transaksiId={successTransaksiId}
                autoPrint={true}
                onClose={() => setSuccessTransaksiId(null)}
            />
        )}
        </>
    );
}
