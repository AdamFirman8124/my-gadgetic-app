/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        // Modul Node.js yang dieksklusi dari client-side:
        fs: false, 
        path: false,
        util: false, // Tambahan: seringkali digunakan oleh library Node
        stream: false, // Tambahan: seringkali digunakan untuk I/O
        // Tambahkan 'crypto' atau 'buffer' jika masih ada error
      };
    }
    // Jika Anda menggunakan versi Next.js yang lebih baru (misalnya 14 ke atas)
    // Anda mungkin perlu menambahkan ini untuk meng-eksternalisasi Communica dan N3
    // experiments: {
    //   topLevelAwait: true,
    // },
    return config;
  },
};

module.exports = nextConfig;