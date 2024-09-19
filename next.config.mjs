/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false, 
      tls: false 
    };
    return config;
  },
  // Adicione isso se você estiver usando o App Router e quiser desativá-lo
  // experimental: {
  //   appDir: false,
  // },
}

export default nextConfig;