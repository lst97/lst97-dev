import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Memory optimization for build
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  
  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Reduce memory usage during build
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000,
          },
        },
      },
    }
    
    // Resolve path alias for better bundling
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    }
    
    return config
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Reduce bundle size
  compress: true,
  
  // Enable static optimization
  output: 'standalone',
}

export default withPayload(nextConfig)