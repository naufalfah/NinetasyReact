// ProductCard.jsx — Grid kartu produk dengan filter pencarian & kategori
// Mendukung data dinamis dari API backend (/api/produk) dengan fallback lokal

import { useState, useEffect, useMemo } from "react";
import initialProduks from "../../data/produk";
import Card from "../Elements/Card";
import api from "../../api";

export default function ProductCard({
    data,
    searchQuery = "",
    selectedKategori = "Semua",
    onCardClick,
    refreshTrigger,
}) {
    // Tunggu data backend pada render pertama agar produk contoh tidak sempat tampil.
    const hasProvidedData = data !== undefined && data !== null;
    const [apiProducts, setApiProducts] = useState([]);
    const [loading, setLoading] = useState(!hasProvidedData);
    const products = hasProvidedData ? data : apiProducts;

    // Ambil data produk live dari backend jika tersedia
    useEffect(() => {
        if (hasProvidedData) return;

        let isActive = true;

        api.get("/api/produk")
            .then((res) => {
                if (isActive && res.data?.success && Array.isArray(res.data.data)) {
                    setApiProducts(res.data.data);
                }
            })
            .catch(() => {
                // Fallback ke data lokal jika backend belum berjalan
                if (isActive) setApiProducts(initialProduks);
            })
            .finally(() => {
                if (isActive) setLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, [hasProvidedData, refreshTrigger]);

    // Filter produk berdasarkan keyword dan kategori
    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();

        return products.filter((p) => {
            const productName = (p.name || p.nama_produk || "").toLowerCase();
            const productKategori = p.kategori || "Makanan";

            const matchSearch = !q || productName.includes(q);
            const matchKategori = selectedKategori === "Semua" || productKategori === selectedKategori;

            return matchSearch && matchKategori;
        });
    }, [products, searchQuery, selectedKategori]);

    return (
        <div className="@container">
            {(!hasProvidedData && loading) ? (
                <div className="text-center py-16">
                    <p className="text-gray-400 text-sm">Memuat produk...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 @md:grid-cols-2 @xl:grid-cols-3 gap-4 sm:gap-5">
                    {filtered.map((produk, index) => (
                        <Card
                            key={produk.id || index}
                            produk={produk}
                            onClick={onCardClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-400 text-sm">Produk tidak ditemukan</p>
                </div>
            )}
        </div>
    );
}
