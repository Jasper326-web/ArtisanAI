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
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude large dependencies from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        '@google-cloud/aiplatform': 'commonjs @google-cloud/aiplatform',
        '@google-cloud/vertexai': 'commonjs @google-cloud/vertexai',
      });

      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 150000, // 150KB limit - more aggressive
        minSize: 5000,   // 5KB minimum
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
            maxSize: 150000,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: -10,
            maxSize: 150000,
            enforce: true,
          },
          // Split large libraries separately
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
            maxSize: 150000,
            enforce: true,
          },
          ui: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
            maxSize: 150000,
            enforce: true,
          },
          google: {
            test: /[\\/]node_modules[\\/]@google[\\/]/,
            name: 'google',
            chunks: 'all',
            priority: 10,
            maxSize: 150000,
            enforce: true,
          },
        },
      }
    }
    return config
  },
}

export default nextConfig
