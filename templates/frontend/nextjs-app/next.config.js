/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:__BE_PORT__/api/:path*',
      },
    ];
  },
};

export default nextConfig;
