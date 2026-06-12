/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    // allowedDevOrigins is now a key within devIndicators
    allowedDevOrigins: ["http://192.168.29.112:3000"],
  },
};

export default nextConfig;
