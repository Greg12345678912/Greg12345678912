import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // Transpiling R3F packages ensures Next.js's webpack properly replaces
  // process.env.NODE_ENV and tree-shakes dev-only code paths that access
  // React.__SECRET_INTERNALS in ways that break in production chunks.
  transpilePackages: [
    "@react-three/fiber",
    "@react-three/drei",
    "@react-three/postprocessing",
    "react-reconciler",
  ],
  experimental: {
    optimizePackageImports: ["three"],
  },
};

export default nextConfig;
