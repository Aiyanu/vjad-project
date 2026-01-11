import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  webpack: (config, { isServer }) => {
    config.optimization.usedExports = true;
    return config;
  },
};

export default nextConfig;
