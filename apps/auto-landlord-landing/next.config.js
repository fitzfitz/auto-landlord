/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8787",
      },
    ],
    // Allow optimization of images from localhost
    domains: [],
    // Disable image optimization for local development if issues persist
    unoptimized: process.env.NODE_ENV === "development",
  },
};

module.exports = nextConfig;
