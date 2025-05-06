/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
      },
    ],
  },
  env: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
}

export default nextConfig
