import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["three", "@react-three/fiber", "@react-three/drei", "@react-three/postprocessing"],
  },
};

export default nextConfig;
