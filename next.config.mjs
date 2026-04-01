/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.GITHUB_ACTIONS ? "export" : undefined,
  basePath: process.env.PAGES_BASE_PATH,
  images: {
    unoptimized: true,
  },
}
export default nextConfig
