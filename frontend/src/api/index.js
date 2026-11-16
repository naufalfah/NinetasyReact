import axios from "axios";

// Mengambil URL API Backend dari Environment Variable (VITE_API_URL) saat deploy
// Fallback ke http://localhost:3000 jika dijalankan lokal di komputer
const backendUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const api = axios.create({
    baseURL: backendUrl,
});

// Interceptor untuk menambahkan info role user di setiap request
api.interceptors.request.use((config) => {
    try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user?.role) {
                config.headers["x-user-role"] = user.role;
            }
            if (user?.id) {
                config.headers["x-user-id"] = user.id;
            }
        }
    } catch (e) {
        // Abaikan jika parsing gagal
    }
    return config;
});

// Helper untuk format URL gambar dari storage backend publik
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Jika sudah full URL eksternal atau base64, kembalikan langsung
    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://") ||
        imagePath.startsWith("data:")
    ) {
        return imagePath;
    }
    // Jika path relatif storage publik (misal: /uploads/produk-123.jpg)
    const base = backendUrl;
    return `${base}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

export default api;
