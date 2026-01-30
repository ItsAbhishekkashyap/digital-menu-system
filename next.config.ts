import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/', 
        destination: '/onboarding', 
        permanent: true, 
      },
    ]
  },

  images: {
    // 'domains' wala array hata diya (Deprecated tha)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qdlqmvwhyceraxndxuiy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**', // ✅ FIXED: Ab ye saare buckets (logos, items, etc) ko allow karega
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['gsap', 'framer-motion']
};

export default nextConfig;