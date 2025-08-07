import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qdlqmvwhyceraxndxuiy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/menu-item-images/**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
