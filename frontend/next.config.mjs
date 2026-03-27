/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // Static export for Firebase Hosting
  trailingSlash: true,       // Required for Firebase Hosting static rewrites
  images: {
    domains: [],
    unoptimized: true,       // Required for static export (no Next.js image server)
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint errors during CI/build
  },
  typescript: {
    ignoreBuildErrors: true,  // Skip TS errors during build
  },
};

export default nextConfig;
