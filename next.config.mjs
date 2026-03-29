/** @type {import('next').NextConfig} */
const nextConfig = {
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
