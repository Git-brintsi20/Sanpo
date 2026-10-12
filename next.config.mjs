/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow base64 data URIs for photo previews
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
