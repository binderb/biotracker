/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.BASE_PATH,
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig
