/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 200000, // 200KB limit
        minSize: 10000,  // 10KB minimum
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
            maxSize: 200000,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: -10,
            maxSize: 200000,
            enforce: true,
          },
          // Split large libraries separately
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
            maxSize: 200000,
            enforce: true,
          },
          ui: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
            maxSize: 200000,
            enforce: true,
          },
          google: {
            test: /[\\/]node_modules[\\/]@google[\\/]/,
            name: 'google',
            chunks: 'all',
            priority: 10,
            maxSize: 200000,
            enforce: true,
          },
        },
      }
    }
    return config
  },
}

export default nextConfig
