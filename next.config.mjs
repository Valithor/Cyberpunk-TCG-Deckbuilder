/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.PAGES_BASE_PATH,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dstcynss47vun.cloudfront.net",
      },
    ],
  },
}
export default nextConfig
