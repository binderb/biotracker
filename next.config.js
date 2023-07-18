/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.BASE_PATH,
  images: {
    path: `${process.env.BASE_PATH}/_next/image`,
  }
}

module.exports = nextConfig
