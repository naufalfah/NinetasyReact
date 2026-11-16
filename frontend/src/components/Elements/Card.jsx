// Card.jsx — Komponen kartu produk dengan penampil stok dan harga
// Klik seluruh area kartu untuk menambahkan produk ke keranjang belanja

import React from "react"; // Import React untuk JSX
import defaultImage from "../../assets/gabin-ice-cream.png"; // Fallback gambar
import { getImageUrl } from "../../api"; // Helper URL storage backend

// Komponen Card menerima props `produk` dan `onClick`
export default function Card({ produk, onClick }) {

    // Ambil nama produk
    const productName = produk?.name || produk?.nama_produk || "Produk";

    // Ambil harga produk (cek harga lalu price)
    const rawPrice = produk?.harga ?? produk?.price ?? 0;

    // Ambil jumlah stok produk
    const stock = produk?.stok ?? 0;

    // Ambil deskripsi produk
    const productDesc =
        produk?.deskripsi ||
        produk?.description ||
        "Deskripsi produk belum tersedia.";

    // Ambil URL gambar produk (mendukung path storage lokal /uploads/ atau URL eksternal)
    const rawImage = produk?.image || produk?.gambar;
    const productImage = getImageUrl(rawImage) || defaultImage;

    // Format harga menjadi singkatan ribuan (contoh: 8000 -> "8RB")
    const formatPrice = (val) => {
        if (typeof val === "string") return val;
        if (typeof val === "number" && val >= 1000) {
            const rb = val / 1000;
            return `${Number.isInteger(rb) ? rb : rb.toFixed(1)}RB`;
        }
        return `Rp ${val.toLocaleString("id-ID")}`;
    };

    // Handler klik kartu produk
    const handleClick = () => {
        if (stock <= 0) {
            alert(`Stok "${productName}" sedang habis!`);
            return;
        }
        if (onClick) {
            onClick(produk);
        }
    };

    return (
        // Seluruh kartu bisa diklik sebagai tombol
        <button
            type="button"
            onClick={handleClick}
            disabled={stock <= 0} // Nonaktifkan jika stok habis
            className={[
                "bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-left w-full",
                "shadow-[0_10px_25px_-5px_rgba(0,0,0,0.07),0_8px_10px_-6px_rgba(0,0,0,0.04)]",
                "flex flex-col justify-between transition-all duration-200",
                stock > 0
                    ? "hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] cursor-pointer group"
                    : "opacity-60 cursor-not-allowed",
            ].join(" ")}
        >
            {/* Baris atas: Badge Stok di kiri & Harga di kanan */}
            <div className="flex items-center justify-between mb-1 gap-2">
                {/* Badge stok produk */}
                <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        stock <= 0
                            ? "bg-red-50 text-red-500" // Warna merah jika habis
                            : stock <= 5
                            ? "bg-amber-50 text-amber-600" // Warna oranye jika stok menipis
                            : "bg-gray-100 text-gray-600" // Warna netral jika stok aman
                    }`}
                >
                    {stock <= 0 ? "Habis" : `Stok: ${stock}`}
                </span>

                {/* Teks harga di sudut kanan atas */}
                <span className="text-sm font-extrabold text-black tracking-tight flex-shrink-0">
                    {formatPrice(rawPrice)}
                </span>
            </div>

            {/* Gambar produk — centered, seragam, dengan tinggi responsif agar terlihat jelas */}
            <div className="flex justify-center items-center my-3 h-36 sm:h-40 w-full overflow-hidden rounded-2xl bg-gray-50">
                <img
                    src={productImage}
                    alt={productName}
                    onError={(e) => {
                        if (e.currentTarget.src !== defaultImage) {
                            e.currentTarget.src = defaultImage;
                        }
                    }}
                    className="h-full w-full object-cover select-none rounded-2xl"
                    draggable={false}
                />
            </div>

            {/* Nama produk */}
            <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">
                {productName}
            </h3>

            {/* Deskripsi produk */}
            <p className="text-gray-500 text-[11px] leading-relaxed mt-1 line-clamp-2">
                {productDesc}
            </p>

            {/* Teks ajakan di bagian bawah */}
            <p
                className={`text-center text-[11px] mt-3.5 transition-colors duration-200 ${
                    stock > 0
                        ? "text-gray-300 group-hover:text-gray-600"
                        : "text-red-400 font-medium"
                }`}
            >
                {stock > 0 ? "Klik untuk menambahkan" : "Stok tidak tersedia"}
            </p>
        </button>
    );
}
