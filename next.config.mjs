/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.GITHUB_ACTIONS ? "export" : undefined,
  basePath: process.env.PAGES_BASE_PATH,
  images: {
    unoptimized: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false, //FIX: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout this is bad but i don't see a better solution atm
  },
}
export default nextConfig
