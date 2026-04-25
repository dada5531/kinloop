const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Webpack config to stub Clerk when keys are not available
  webpack: (config) => {
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      const stubPath = path.resolve(__dirname, "src/lib/clerk-stub.js");
      config.resolve.alias = {
        ...config.resolve.alias,
        "@clerk/nextjs/server": stubPath,
        "@clerk/nextjs": stubPath,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
