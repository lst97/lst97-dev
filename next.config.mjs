/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
    ],
  },
  env: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  turbopack: {
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.css'],
  },
  webpack: (config, { isServer }) => {
    // Only apply to client-side builds
    if (!isServer) {
      // Add a rule for worker files
      config.module.rules.push({
        test: /\.worker\.ts$/,
        use: {
          loader: 'worker-loader',
          options: {
            filename: 'static/chunks/[id].worker.js',
            publicPath: '/_next/',
          },
        },
      })

      // Handle heic-convert properly by transpiling it through babel-loader
      // Explicitly include the heic-convert package in the webpack build
      config.module.rules.push({
        test: /node_modules\/heic-convert\/dist\/.*\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      })

      // Prevent worker import chunks from being excluded from the build
      config.output.filename = (pathData) => {
        return pathData.chunk.name === 'main'
          ? 'static/chunks/[name].js'
          : 'static/chunks/[name].[contenthash].js'
      }
    }

    // Return the modified config
    return config
  },
}

export default nextConfig
