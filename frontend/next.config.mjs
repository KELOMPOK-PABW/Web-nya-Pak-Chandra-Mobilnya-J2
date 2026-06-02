/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API calls to backend during development to avoid CORS
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
