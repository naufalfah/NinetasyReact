// pages/admin/users/index.jsx — Kelola Data User (Admin)
import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Layouts/Sidebar";
import api from "../../../api";
import { Plus, Trash2, UsersRound, X } from "lucide-react";

export default function AdminUsers() {
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        pw: "",
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/users");
            if (res.data?.success) {
                setUserList(res.data.data);
            }
        } catch (error) {
            console.error("Gagal load users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openAddModal = () => {
        setFormData({ name: "", email: "", pw: "" });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/api/users", formData);
            alert("User baru berhasil ditambahkan!");
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Gagal tambah user:", error);
            const msg = error.response?.data?.message || "Gagal menambahkan user.";
            alert(msg);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Yakin ingin menghapus user "${name}"?`)) return;
        try {
            await api.delete(`/api/users/${id}`);
            alert("User berhasil dihapus!");
            fetchUsers();
        } catch (error) {
            console.error("Gagal hapus user:", error);
            alert("Gagal menghapus user.");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="flex min-h-screen bg-[#ECEAE6]">
            <Sidebar />

            <main className="flex-1 p-8 overflow-y-auto animate-page-enter">
                <div className="max-w-4xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Data User</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Manajemen akun kasir dan administrator sistem</p>
                        </div>

                        <button
                            type="button"
                            onClick={openAddModal}
                            className="flex items-center gap-2 bg-[#3D3D3D] text-white px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-black active:scale-95 transition-all shadow-sm cursor-pointer"
                        >
                            <Plus size={15} />
                            <span>Tambah User</span>
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm">
                        {loading ? (
                            <p className="text-center py-10 text-xs text-gray-400">Memuat data user...</p>
                        ) : userList.length === 0 ? (
                            <div className="text-center py-10">
                                <UsersRound size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-xs text-gray-400">Belum ada user terdaftar.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                                        <th className="pb-3 px-3">Nama Lengkap</th>
                                        <th className="pb-3 px-3">Email</th>
                                        <th className="pb-3 px-3">Terdaftar Sejak</th>
                                        <th className="pb-3 px-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {userList.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/60">
                                            <td className="py-3 px-3 font-bold text-gray-900">{user.name}</td>
                                            <td className="py-3 px-3 text-gray-600 font-medium">{user.email}</td>
                                            <td className="py-3 px-3 text-gray-400">{formatDate(user.created_at)}</td>
                                            <td className="py-3 px-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 cursor-pointer"
                                                    title="Hapus User"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal Tambah User */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-extrabold text-gray-900">Tambah User Baru</h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-black cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Nama</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nama kasir/admin"
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="kasir@ninetasy.com"
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Password (pw)</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.pw}
                                    onChange={(e) => setFormData({ ...formData, pw: e.target.value })}
                                    placeholder="••••••••"
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
                                    Tambah
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

