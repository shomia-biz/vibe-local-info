import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  allowedDevOrigins: ["172.30.1.27", "localhost"],
};

export default nextConfig;
