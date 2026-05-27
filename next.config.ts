import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phaser accesses browser globals on import — keep it out of the server bundle
  // by importing it only via dynamic import inside client components.
};

export default nextConfig;
