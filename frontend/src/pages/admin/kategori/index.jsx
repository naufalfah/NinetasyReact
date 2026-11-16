// pages/admin/kategori/index.jsx — Kelola Kategori (Admin CRUD)
import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Layouts/Sidebar";
import api from "../../../api";
import { Plus, Edit2, Trash2, FolderKanban, X } from "lucide-react";

export default function AdminKategori() {
    const [kategoriList, setKategoriList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [namaKategori, setNamaKategori] = useState("");

    const fetchKategori = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/kategori");
            if (res.data?.success) {
                setKategoriList(res.data.data);
            }
        } catch (error) {
            console.error("Gagal load kategori:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKategori();
    }, []);

    const openAddModal = () => {
        setEditId(null);
        setNamaKategori("");
        setIsModalOpen(true);
    };

    const openEditModal = (kat) => {
        setEditId(kat.id);
        setNamaKategori(kat.nama_kategori);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/api/kategori/${editId}`, { nama_kategori: namaKategori });
                alert("Kategori berhasil diperbarui!");
            } else {
                await api.post("/api/kategori", { nama_kategori: namaKategori });
                alert("Kategori berhasil ditambahkan!");
            }
            setIsModalOpen(false);
            fetchKategori();
        } catch (error) {
            console.error("Gagal simpan kategori:", error);
            alert("Terjadi kesalahan saat menyimpan kategori.");
        }
    };

    const handleDelete = async (id, nama) => {
        if (!window.confirm(`Yakin ingin menghapus kategori "${nama}"?`)) return;
        try {
            await api.delete(`/api/kategori/${id}`);
            alert("Kategori berhasil dihapus!");
            fetchKategori();
        } catch (error) {
            console.error("Gagal hapus kategori:", error);
            alert("Gagal menghapus kategori.");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#ECEAE6]">
            <Sidebar />

            <main className="flex-1 p-8 overflow-y-auto animate-page-enter">
                <div className="max-w-4xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Kelola Kategori</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Klasifikasi menu makanan dan minuman Ninetasy</p>
                        </div>

                        <button
                            type="button"
                            onClick={openAddModal}
                            className="flex items-center gap-2 bg-[#3D3D3D] text-white px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-black active:scale-95 transition-all shadow-sm cursor-pointer"
                        >
                            <Plus size={15} />
                            <span>Tambah Kategori</span>
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm">
                        {loading ? (
                            <p className="text-center py-10 text-xs text-gray-400">Memuat kategori...</p>
                        ) : kategoriList.length === 0 ? (
                            <div className="text-center py-10">
                                <FolderKanban size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-xs text-gray-400">Belum ada kategori.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                                        <th className="pb-3 px-3">ID</th>
                                        <th className="pb-3 px-3">Nama Kategori</th>
                                        <th className="pb-3 px-3">Jumlah Produk</th>
                                        <th className="pb-3 px-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {kategoriList.map((kat) => (
                                        <tr key={kat.id} className="hover:bg-gray-50/60">
                                            <td className="py-3 px-3 font-bold text-gray-400">#{kat.id}</td>
                                            <td className="py-3 px-3 font-bold text-gray-900">{kat.nama_kategori}</td>
                                            <td className="py-3 px-3">
                                                <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                                                    {kat.count_produk || 0} Produk
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(kat)}
                                                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(kat.id, kat.nama_kategori)}
                                                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 cursor-pointer"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal Form Tambah / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-extrabold text-gray-900">
                                {editId ? "Ubah Kategori" : "Tambah Kategori Baru"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-black cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Nama Kategori</label>
                                <input
                                    type="text"
                                    required
                                    value={namaKategori}
                                    onChange={(e) => setNamaKategori(e.target.value)}
                                    placeholder="Contoh: Dessert"
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-gray-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-[#3D3D3D] hover:bg-black text-white font-bold cursor-pointer"
                                >
                                    {editId ? "Simpan" : "Tambah"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

