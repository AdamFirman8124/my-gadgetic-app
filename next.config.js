/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pastikan Next.js tahu bahwa modul ini hanya untuk server
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false, // Jangan sertakan 'fs' di client-side
        path: false, // Jangan sertakan 'path' di client-side
        // Anda mungkin juga perlu menambahkan 'util' atau 'stream' jika ada error lain
      };
    }
    return config;
  },
  // Opsi lain, jika ada error N3/Comunica yang terkait dengan Node polyfills
  // experimental: {
  //   serverComponentsExternalPackages: ['n3', '@comunica/query-sparql']
  // }
};

module.exports = nextConfig;