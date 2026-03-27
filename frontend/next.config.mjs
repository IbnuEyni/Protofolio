/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    // BACKEND_URL is a runtime server-side env var — never baked into the bundle
    const backend = process.env.BACKEND_URL ?? "http://backend:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
