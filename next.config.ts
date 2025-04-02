import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'deckofcardsapi.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;