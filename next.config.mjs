/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
      poll: false,
    };
    return config;
  },
};

export default nextConfig;
