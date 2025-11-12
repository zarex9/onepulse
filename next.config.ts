const nextConfig = {
  reactStrictMode: true,
  experimental: {
    inlineCss: true,
  },
  turbopack: {},
  // Ensure TypeScript in spacetimedb's dev export (./src/*.ts) is transpiled by Turbopack
  // This fixes "Unknown module type" when the package's conditional export points to TS sources.
  transpilePackages: ["spacetimedb"],
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"],
};

export default nextConfig;
