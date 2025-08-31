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
  config.resolve = config.resolve || {}
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    // Map subpath imports used by some @ai-sdk/* packages to the root zod export.
    'zod/v4': 'zod',
    'zod/v3': 'zod',
  }
  return config
},
}

export default nextConfig
