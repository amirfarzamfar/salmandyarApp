import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    const backendOrigin = process.env.NEXT_PUBLIC_DEV_API_ORIGIN?.trim() || "http://localhost:5016";

    return [
      {
        source: "/api/health",
        destination: "/api/health",
      },
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
