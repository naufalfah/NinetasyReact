// pages/user/pos/index.jsx — Halaman POS Kasir / Transaksi untuk User
import React, { useState, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import ProductCard from "../../../components/Fragments/ProductCard";
import Sidebar from "../../../components/Layouts/Sidebar";
import CartSidebar from "../../../components/Fragments/CartSidebar";
import produks from "../../../data/produk";

export default function UserPOS() {
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedKategori, setSelectedKategori] = useState("Semua");
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const kategoriList = useMemo(() => {
        const unique = [...new Set(produks.map((p) => p.kategori))];
        return ["Semua", ...unique];
    }, []);

    const handleCardClick = useCallback((produk) => {
        setCart((prev) => {
            const idx = prev.findIndex((item) => item.id === produk.id);
            if (idx >= 0) {
                if (produk.stok !== undefined && prev[idx].qty >= produk.stok) {
                    alert(`Jumlah pemesanan sudah mencapai batas stok yang tersedia (${produk.stok})!`);
                    return prev;
                }
                const updated = [...prev];
                updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 };
                return updated;
            }
            return [...prev, { ...produk, qty: 1 }];
        });
    }, []);

    const handleUpdateQty = useCallback((id, newQty) => {
        setCart((prev) => {
            if (newQty <= 0) return prev.filter((item) => item.id !== id);
            return prev.map((item) => (item.id === id ? { ...item, qty: newQty } : item));
        });
    }, []);

    const handleRemoveItem = useCallback((id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const handleClearCart = useCallback(() => {
        setCart([]);
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    return (
        <div className="flex min-h-screen bg-[#ECEAE6]">
            {/* Sidebar Kasir */}
            <Sidebar />

            {/* Konten Utama */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto animate-page-enter">
                {/* Search bar + filter kategori responsif */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mb-6">
                    <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-sm flex-1">
                        <Search size={18} className="text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
                        />
                    </div>

                    <select
                        value={selectedKategori}
                        onChange={(e) => setSelectedKategori(e.target.value)}
                        className="bg-white px-4 py-2.5 rounded-2xl shadow-sm text-sm text-gray-700 outline-none cursor-pointer self-start sm:self-auto"
                    >
                        {kategoriList.map((kat) => (
                            <option key={kat} value={kat}>
                                {kat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Grid Produk */}
                <ProductCard
                    searchQuery={searchQuery}
                    selectedKategori={selectedKategori}
                    onCardClick={handleCardClick}
                    refreshTrigger={refreshTrigger}
                />
            </main>

            {/* Sidebar Keranjang */}
            <CartSidebar
                cart={cart}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
            />
        </div>
    );
}

