import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://shblog.shhome.synology.me/api/:path*",
      },
    ];
  },
};

export default nextConfig;
