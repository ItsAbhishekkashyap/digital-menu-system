import type { NextConfig } from "next";

const nextConfig: NextConfig = {

   async redirects() {
    return [
      {
        source: '/', // The incoming request path
        destination: '/onboarding', // The path to redirect to
        permanent: true, // Use a permanent redirect (HTTP 308)
      },
    ]
  },

  
  images: {
    domains: ['placehold.co', 'images.unsplash.com'], 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qdlqmvwhyceraxndxuiy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/menu-item-images/**',
      },
      {
        protocol: 'https',
        hostname: 'qdlqmvwhyceraxndxuiy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/restaurant-logos/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },

       // Add this line
  
      
    ],
  },
  transpilePackages: ['gsap', 'framer-motion']
};

export default nextConfig;
