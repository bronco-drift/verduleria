import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // En Next 16 app router toma control de "/" si no hay rewrite explícito,
  // aunque exista public/index.html. Forzamos el static HTML como root.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/index.html" }],
    };
  },
};

export default nextConfig;
