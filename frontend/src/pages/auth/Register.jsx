// pages/auth/Register.jsx — Halaman Registrasi Akun Baru Ninetasy POS
// Desain sesuai mockup: background organic wave (#E6E2D6 & #EFEFEF) + floating card putih
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api";

export default function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);
            const res = await api.post("/api/auth/register", { name, email, pw });

            if (res.data?.success) {
                alert("Registrasi berhasil! Silakan login.");
                navigate("/login");
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Gagal terhubung ke server!";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#EFEFEF] overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
            {/* Background Organic Wave Curve (Kiri: #E6E2D6, Kanan: #EFEFEF) */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                <svg
                    className="w-full h-full object-cover"
                    viewBox="0 0 1440 900"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0 0H700C630 140 560 220 560 320C560 440 730 450 730 560C730 680 650 780 660 900H0V0Z"
                        fill="#E6E2D6"
                    />
                </svg>
            </div>

            {/* Container Konten Dua Sisi */}
            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-16 px-4 sm:px-8">
                {/* ====== SISI KIRI: Branding ====== */}
                <div className="w-full md:w-1/2 flex flex-col justify-center text-left md:pl-6 lg:pl-12 select-none">
                    <p className="text-xl sm:text-2xl font-normal text-gray-800 tracking-tight">
                        Bergabung bersama
                    </p>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight my-1 sm:my-2 leading-none">
                        Ninetasy
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-700 font-normal mt-1 max-w-sm">
                        Kelola transaksi anda dengan cepat dan mudah
                    </p>
                </div>

                {/* ====== SISI KANAN: Floating Register Card ====== */}
                <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                    <div className="bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.07)] p-8 sm:p-10 w-full max-w-md border border-gray-100/60">
                        {/* Header Card */}
                        <div className="mb-6">
                            <h2 className="text-2xl sm:text-[26px] font-black text-gray-900 tracking-tight leading-tight">
                                Daftar Akun
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Buat akun Transaksiku Anda.
                            </p>
                        </div>

                        {/* Pesan Error */}
                        {error && (
                            <div className="bg-red-50 text-red-600 text-xs font-semibold px-4 py-2.5 rounded-xl mb-4 border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Input Nama Lengkap */}
                            <div>
                                <label className="block text-xs font-bold text-[#847D44] mb-1.5">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nama Lengkap Anda"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-[#847D44] focus:ring-1 focus:ring-[#847D44]/30 text-xs text-gray-800 placeholder:text-gray-400 bg-white transition-all"
                                />
                            </div>

                            {/* Input Email */}
                            <div>
                                <label className="block text-xs font-bold text-[#847D44] mb-1.5">
                                    Masukan Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Anda"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-[#847D44] focus:ring-1 focus:ring-[#847D44]/30 text-xs text-gray-800 placeholder:text-gray-400 bg-white transition-all"
                                />
                            </div>

                            {/* Input Password */}
                            <div>
                                <label className="block text-xs font-bold text-[#847D44] mb-1.5">
                                    Kata Sandi
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={pw}
                                    onChange={(e) => setPw(e.target.value)}
                                    placeholder="Kata Sandi"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-[#847D44] focus:ring-1 focus:ring-[#847D44]/30 text-xs text-gray-800 placeholder:text-gray-400 bg-white transition-all"
                                />
                            </div>

                            {/* Tombol Daftar */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs ${
                                        loading
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-[#E6E2D6] hover:bg-[#DCD7C9] active:scale-[0.98] text-gray-900"
                                    }`}
                                >
                                    {loading ? "Memproses..." : "Daftar"}
                                </button>
                            </div>
                        </form>

                        {/* Link ke Login */}
                        <p className="text-center text-xs text-gray-500 mt-6">
                            Sudah punya akun?{" "}
                            <Link
                                to="/login"
                                className="font-bold text-[#847D44] hover:underline"
                            >
                                Masuk
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
