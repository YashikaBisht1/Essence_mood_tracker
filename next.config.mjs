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
  webpack: (config) => {
    // Handle the transformers library
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    }
    return config
  },
  experimental: {
    // Enable server-side actions for API routes
    serverComponentsExternalPackages: ['@xenova/transformers'],
  },
}

export default nextConfig
