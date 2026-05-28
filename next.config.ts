import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Sirve el HTML 16 directo en / mientras vamos migrando a React
        { source: "/", destination: "/verduleria-app.html" },
      ],
    };
  },
};

export default nextConfig;
