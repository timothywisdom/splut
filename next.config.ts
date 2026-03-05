import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/splut", // your repo name
  images: {
    unoptimized: true, // required for static export
  },
};

export default nextConfig;
