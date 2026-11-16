// pages/admin/produk/index.jsx — Kelola Produk (Admin CRUD) + Fitur Tambah Stok Incremental + Upload Gambar Storage
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../../components/Layouts/Sidebar";
import api, { getImageUrl } from "../../../api";
import { Plus, Edit2, Trash2, Search, X, Package, PackagePlus, ArrowRight, Upload, Image as ImageIcon } from "lucide-react";
import defaultImage from "../../../assets/gabin-ice-cream.png";

export default function AdminProduk() {
    const [produkList, setProdukList] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // State Modal Form Tambah / Edit Produk
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        nama_produk: "",
        harga: "",
        stok: "",
        kategori_id: "",
        deskripsi: "",
        gambar: "",
    });

    // State Upload Gambar ke Storage
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const fileInputRef = useRef(null);

    // State untuk fitur restock incremental di dalam modal edit
    const [stokAsli, setStokAsli] = useState(0);
    const [tambahStokInput, setTambahStokInput] = useState("");

    // State Modal Khusus Tambah Stok Cepat (Quick Restock)
    const [isStokModalOpen, setIsStokModalOpen] = useState(false);
    const [selectedProdukStok, setSelectedProdukStok] = useState(null);
    const [quickTambahStok, setQuickTambahStok] = useState("");
    const [stokLoading, setStokLoading] = useState(false);

    // Ambil data produk & kategori dari backend
    const fetchData = async () => {
        try {
            setLoading(true);
            const [resProd, resKat] = await Promise.all([
                api.get("/api/produk"),
                api.get("/api/kategori"),
            ]);
            if (resProd.data?.success) setProdukList(resProd.data.data);
            if (resKat.data?.success) setKategoriList(resKat.data.data);
        } catch (error) {
            console.error("Gagal mengambil data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Buka Modal Tambah Produk Baru
    const openAddModal = () => {
        setEditId(null);
        setStokAsli(0);
        setTambahStokInput("");
        setSelectedFile(null);
        setPreviewUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFormData({
            nama_produk: "",
            harga: "",
            stok: "",
            kategori_id: kategoriList[0]?.id || "",
            deskripsi: "",
            gambar: "",
        });
        setIsModalOpen(true);
    };

    // Buka Modal Edit Produk
    const openEditModal = (prod) => {
        setEditId(prod.id);
        const currentStok = Number(prod.stok ?? 0);
        setStokAsli(currentStok);
        setTambahStokInput("");
        setSelectedFile(null);
        const currentImg = prod.gambar || prod.image || "";
        setPreviewUrl(getImageUrl(currentImg) || "");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFormData({
            nama_produk: prod.nama_produk || prod.name || "",
            harga: prod.harga || "",
            stok: currentStok,
            kategori_id: prod.kategori_id || "",
            deskripsi: prod.deskripsi || "",
            gambar: currentImg,
        });
        setIsModalOpen(true);
    };

    // Handle pilih file gambar dari perangkat
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("File yang dipilih harus berupa file gambar (JPG, PNG, WebP)!");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran gambar maksimal 5MB!");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Handle hapus/reset preview gambar
    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl("");
        setFormData((prev) => ({ ...prev, gambar: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Buka Modal Khusus Tambah Stok Cepat
    const openQuickStokModal = (prod) => {
        setSelectedProdukStok(prod);
        setQuickTambahStok("");
        setIsStokModalOpen(true);
    };

    // Submit Tambah / Edit Produk
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Hitung stok final jika dalam mode edit dan ada input penambahan stok
            let finalStok = Number(formData.stok);
            if (editId && tambahStokInput !== "") {
                finalStok = Number(stokAsli) + Number(tambahStokInput || 0);
            }

            // Gunakan FormData untuk upload multipart/form-data ke storage publik backend
            const formDataObj = new FormData();
            formDataObj.append("nama_produk", formData.nama_produk);
            formDataObj.append("harga", formData.harga);
            formDataObj.append("stok", finalStok);
            if (formData.kategori_id) formDataObj.append("kategori_id", formData.kategori_id);
            if (formData.deskripsi) formDataObj.append("deskripsi", formData.deskripsi);

            if (selectedFile) {
                // File baru yang diunggah pengguna ke storage /uploads/
                formDataObj.append("gambar", selectedFile);
            } else if (formData.gambar) {
                // Pertahankan gambar lama
                formDataObj.append("gambar", formData.gambar);
            }

            if (editId) {
                await api.put(`/api/produk/${editId}`, formDataObj, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("Produk berhasil diperbarui!");
            } else {
                await api.post("/api/produk", formDataObj, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("Produk berhasil ditambahkan!");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Gagal simpan produk:", error);
            const msg = error.response?.data?.message || "Terjadi kesalahan saat menyimpan produk.";
            alert(msg);
        }
    };

    // Submit Penambahan Stok Cepat (Quick Restock)
    const handleQuickStokSubmit = async (e) => {
        e.preventDefault();
        const jumlah = Number(quickTambahStok);

        if (!jumlah || jumlah <= 0) {
            alert("Masukkan jumlah penambahan stok yang valid (lebih dari 0)!");
            return;
        }

        try {
            setStokLoading(true);
            const res = await api.post(`/api/produk/${selectedProdukStok.id}/tambah-stok`, {
                tambah_stok: jumlah,
            });

            if (res.data?.success) {
                alert(` Berhasil menambahkan ${jumlah} unit!\nTotal stok "${selectedProdukStok.nama_produk || selectedProdukStok.name}" sekarang: ${res.data.data.stok} unit.`);
                setIsStokModalOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error("Gagal menambah stok:", error);
            const msg = error.response?.data?.message || "Gagal menambahkan stok.";
            alert(msg);
        } finally {
            setStokLoading(false);
        }
    };

    // Hapus Produk
    const handleDelete = async (id, nama) => {
        if (!window.confirm(`Yakin ingin menghapus produk "${nama}"?`)) return;
        try {
            await api.delete(`/api/produk/${id}`);
            alert("Produk berhasil dihapus!");
            fetchData();
        } catch (error) {
            console.error("Gagal hapus produk:", error);
            alert("Gagal menghapus produk.");
        }
    };

    // Filter produk berdasarkan pencarian nama
    const filteredProduk = produkList.filter((p) => {
        const name = (p.nama_produk || p.name || "").toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    const formatRupiah = (val) => `Rp ${Number(val).toLocaleString("id-ID")}`;

    return (
        <div className="flex min-h-screen bg-[#ECEAE6]">
            <Sidebar />

            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto animate-page-enter">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Kelola Produk</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Tambah, ubah, dan kelola penambahan stok produk menu</p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="flex items-center justify-center gap-2 bg-[#3D3D3D] text-white px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-black active:scale-95 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
                    >
                        <Plus size={15} />
                        <span>Tambah Produk</span>
                    </button>
                </div>

                {/* Filter / Search Bar */}
                <div className="bg-white rounded-2xl px-4 py-2.5 shadow-sm flex items-center gap-3 mb-6 w-full max-w-md">
                    <Search size={16} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari nama produk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-xs outline-none text-gray-700 placeholder:text-gray-400"
                    />
                </div>

                {/* Tabel Produk */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
                    {loading ? (
                        <p className="text-center py-12 text-xs text-gray-400">Memuat data produk...</p>
                    ) : filteredProduk.length === 0 ? (
                        <div className="text-center py-12">
                            <Package size={36} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm font-semibold text-gray-500">Tidak ada produk ditemukan</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                                        <th className="pb-3 px-3">Produk</th>
                                        <th className="pb-3 px-3">Kategori</th>
                                        <th className="pb-3 px-3">Harga</th>
                                        <th className="pb-3 px-3">Stok Saat Ini</th>
                                        <th className="pb-3 px-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredProduk.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <img
                                                            src={getImageUrl(item.gambar || item.image) || defaultImage}
                                                            alt={item.nama_produk || item.name}
                                                            onError={(e) => {
                                                                if (e.currentTarget.src !== defaultImage) {
                                                                    e.currentTarget.src = defaultImage;
                                                                }
                                                            }}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{item.nama_produk || item.name}</p>
                                                        <p className="text-[10px] text-gray-400 line-clamp-1 max-w-xs">{item.deskripsi || "-"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-gray-600 font-medium">
                                                <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                                                    {item.kategori || "Makanan"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 font-bold text-gray-900">{formatRupiah(item.harga)}</td>
                                            <td className="py-3 px-3">
                                                <span
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${
                                                        item.stok <= 0
                                                            ? "bg-red-50 text-red-500"
                                                            : item.stok <= 5
                                                            ? "bg-amber-50 text-amber-600"
                                                            : "bg-emerald-50 text-emerald-600"
                                                    }`}
                                                >
                                                    {item.stok} unit
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Tombol Tambah Stok Cepat */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openQuickStokModal(item)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors cursor-pointer"
                                                        title="Tambah Stok Produk (+)"
                                                    >
                                                        <PackagePlus size={13} />
                                                        <span>+ Stok</span>
                                                    </button>

                                                    {/* Tombol Edit Produk */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                                                        title="Edit Produk"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>

                                                    {/* Tombol Hapus Produk */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item.id, item.nama_produk || item.name)}
                                                        className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                                                        title="Hapus Produk"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL 1: Tambah / Edit Produk Lengkap — Responsif Tablet & Mobile */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 md:p-6 animate-page-enter">
                    <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg md:max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h2 className="text-base font-extrabold text-gray-900">
                                    {editId ? "Ubah Produk" : "Tambah Produk Baru"}
                                </h2>
                                <p className="text-[11px] text-gray-400">
                                    {editId ? "Kelola informasi produk dan penyesuaian stok" : "Tambahkan menu baru ke katalog"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-black cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form Modal dengan Body Scrollable & Layout Responsif 2 Kolom di Tablet */}
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Kolom Kiri: Informasi Produk & Stok */}
                                    <div className="space-y-3.5">
                                        <div>
                                            <label className="block font-bold text-gray-700 mb-1">Nama Produk</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.nama_produk}
                                                onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-gray-500 text-gray-800 bg-white"
                                                placeholder="Contoh: Gabin Ice Cream"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div>
                                                <label className="block font-bold text-gray-700 mb-1">Harga (Rp)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.harga}
                                                    onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-gray-500 text-gray-800 bg-white"
                                                    placeholder="8000"
                                                />
                                            </div>

                                            <div>
                                                <label className="block font-bold text-gray-700 mb-1">Kategori</label>
                                                <select
                                                    value={formData.kategori_id}
                                                    onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-gray-500 bg-white text-gray-800 cursor-pointer"
                                                >
                                                    <option value="">Pilih Kategori</option>
                                                    {kategoriList.map((kat) => (
                                                        <option key={kat.id} value={kat.id}>
                                                            {kat.nama_kategori}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Jika Tambah Baru: Input Stok Awal */}
                                        {!editId && (
                                            <div>
                                                <label className="block font-bold text-gray-700 mb-1">Stok Awal</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.stok}
                                                    onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-gray-500 text-gray-800 bg-white"
                                                    placeholder="20"
                                                />
                                            </div>
                                        )}

                                        {/* JIKA EDIT PRODUK: Kotak Stok Asli + Input Tambah Stok = Total Baru */}
                                        {editId && (
                                            <div className="bg-[#FAF9F7] border border-gray-200/80 rounded-2xl p-3">
                                                <label className="block font-bold text-gray-800 mb-2">
                                                    Perhitungan Penambahan Stok
                                                </label>

                                                <div className="grid grid-cols-3 gap-2 items-center text-center">
                                                    {/* Kotak Stok Asli */}
                                                    <div className="bg-white border border-gray-200 p-2 rounded-xl shadow-2xs">
                                                        <p className="text-[10px] text-gray-400 font-semibold mb-0.5">Stok Asli</p>
                                                        <p className="text-sm font-black text-gray-800">{stokAsli}</p>
                                                    </div>

                                                    {/* Input Tambah Stok (+20) */}
                                                    <div className="bg-white border border-emerald-300 p-1.5 rounded-xl shadow-2xs focus-within:ring-2 focus-within:ring-emerald-400">
                                                        <p className="text-[10px] text-emerald-600 font-bold mb-0.5">+ Tambah</p>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={tambahStokInput}
                                                            onChange={(e) => setTambahStokInput(e.target.value)}
                                                            placeholder="0"
                                                            className="w-full text-center text-sm font-black text-emerald-700 outline-none bg-transparent"
                                                        />
                                                    </div>

                                                    {/* Kotak Total Stok Baru (66) */}
                                                    <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl shadow-2xs">
                                                        <p className="text-[10px] text-emerald-700 font-semibold mb-0.5">Stok Baru</p>
                                                        <p className="text-sm font-black text-emerald-800">
                                                            {Number(stokAsli) + Number(tambahStokInput || 0)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-[10px] text-gray-400 mt-2 text-center">
                                                    Stok asli {stokAsli} + {tambahStokInput || 0} = Total stok {Number(stokAsli) + Number(tambahStokInput || 0)} unit.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Kolom Kanan: Upload Gambar Storage & Deskripsi */}
                                    <div className="space-y-3.5 flex flex-col justify-between">
                                        {/* Upload Gambar ke Storage Backend */}
                                        <div>
                                            <label className="block font-bold text-gray-700 mb-1">
                                                Gambar Produk (Storage Publik)
                                            </label>

                                            {previewUrl ? (
                                                <div className="relative border border-gray-200 rounded-2xl p-2.5 bg-gray-50 flex items-center gap-3">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                                                        <img
                                                            src={previewUrl}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                if (e.currentTarget.src !== defaultImage) {
                                                                    e.currentTarget.src = defaultImage;
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-800 text-[11px] truncate">
                                                            {selectedFile
                                                                ? selectedFile.name
                                                                : formData.gambar
                                                                ? formData.gambar.split("/").pop()
                                                                : "Gambar Produk"}
                                                        </p>
                                                        <p className="text-[10px] text-emerald-600 font-medium">
                                                            {selectedFile
                                                                ? "File baru dipilih (siap diupload)"
                                                                : "Tersimpan di storage publik"}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="text-[10px] text-[#3D3D3D] font-bold underline cursor-pointer hover:text-black"
                                                            >
                                                                Ganti Gambar
                                                            </button>
                                                            <span className="text-gray-300">•</span>
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveImage}
                                                                className="text-[10px] text-red-500 font-bold underline cursor-pointer hover:text-red-700"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="border-2 border-dashed border-gray-300 hover:border-gray-500 rounded-2xl p-3.5 text-center cursor-pointer transition-colors bg-[#FAF9F7] hover:bg-gray-50"
                                                >
                                                    <Upload size={18} className="mx-auto text-gray-400 mb-1" />
                                                    <p className="font-bold text-gray-700 text-xs">
                                                        Upload gambar produk
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        JPG, PNG, WebP (Maks. 5MB)
                                                    </p>
                                                </div>
                                            )}

                                            {/* Hidden file input */}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <label className="block font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
                                            <textarea
                                                rows={3}
                                                value={formData.deskripsi}
                                                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-gray-500 text-gray-800 bg-white flex-1 resize-none"
                                                placeholder="Deskripsi cita rasa produk..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Modal Sticky: Tombol Batal & Simpan */}
                            <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/70 flex items-center justify-end gap-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold cursor-pointer text-xs transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#3D3D3D] hover:bg-black text-white font-bold cursor-pointer transition-all active:scale-95 text-xs shadow-sm"
                                >
                                    {editId ? "Simpan Perubahan" : "Tambahkan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: Modal Khusus Tambah Stok Cepat (+ Stok) — Responsif Tablet & Mobile */}
            {isStokModalOpen && selectedProdukStok && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 animate-page-enter">
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <PackagePlus size={18} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-extrabold text-gray-900 leading-tight">
                                        Tambah Stok
                                    </h2>
                                    <p className="text-[11px] text-gray-500 truncate max-w-[200px]">
                                        {selectedProdukStok.nama_produk || selectedProdukStok.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsStokModalOpen(false)}
                                className="text-gray-400 hover:text-black cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleQuickStokSubmit} className="space-y-4 text-xs">
                            {/* Kotak Perhitungan Interaktif */}
                            <div className="bg-[#FAF9F7] border border-gray-200/80 rounded-2xl p-4">
                                <div className="flex items-center justify-between gap-2 text-center">
                                    {/* Stok Asli Saat Ini */}
                                    <div className="flex-1 bg-white border border-gray-200 p-2.5 rounded-xl shadow-2xs">
                                        <p className="text-[10px] text-gray-400 font-semibold mb-0.5">Stok Asli</p>
                                        <p className="text-base font-black text-gray-800">
                                            {selectedProdukStok.stok || 0}
                                        </p>
                                    </div>

                                    <span className="text-sm font-bold text-gray-400">+</span>

                                    {/* Input Tambahan Stok */}
                                    <div className="flex-1 bg-white border-2 border-emerald-400 p-2 rounded-xl shadow-2xs">
                                        <p className="text-[10px] text-emerald-600 font-bold mb-0.5">Tambah</p>
                                        <input
                                            type="number"
                                            autoFocus
                                            min="1"
                                            required
                                            value={quickTambahStok}
                                            onChange={(e) => setQuickTambahStok(e.target.value)}
                                            placeholder="20"
                                            className="w-full text-center text-base font-black text-emerald-700 outline-none bg-transparent"
                                        />
                                    </div>

                                    <span className="text-sm font-bold text-gray-400">=</span>

                                    {/* Total Stok Baru */}
                                    <div className="flex-1 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl shadow-2xs">
                                        <p className="text-[10px] text-emerald-700 font-semibold mb-0.5">Hasil</p>
                                        <p className="text-base font-black text-emerald-800">
                                            {Number(selectedProdukStok.stok || 0) + Number(quickTambahStok || 0)}
                                        </p>
                                    </div>
                                </div>

                                {/* Preset Tombol Cepat: +5, +10, +20, +50 */}
                                <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-gray-200/60">
                                    <span className="text-[10px] text-gray-400 font-semibold mr-1">Cepat:</span>
                                    {[5, 10, 20, 50].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setQuickTambahStok(String(preset))}
                                            className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-emerald-100 hover:text-emerald-700 text-gray-600 font-bold text-[10px] transition-colors cursor-pointer"
                                        >
                                            +{preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsStokModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={stokLoading || !quickTambahStok || Number(quickTambahStok) <= 0}
                                    className={`px-4 py-2 rounded-xl font-bold text-white transition-all cursor-pointer ${
                                        stokLoading || !quickTambahStok || Number(quickTambahStok) <= 0
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-sm"
                                    }`}
                                >
                                    {stokLoading ? "Menyimpan..." : "Simpan Stok Baru"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
