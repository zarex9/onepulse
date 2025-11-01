const nextConfig = {
  reactStrictMode: true,
  experimental: {
    inlineCss: true,
  },
  // Opt into Turbopack configuration (Next 16+)
  turbopack: {},
  // Ensure TypeScript in spacetimedb's dev export (./src/*.ts) is transpiled by Turbopack
  // This fixes "Unknown module type" when the package's conditional export points to TS sources.
  transpilePackages: ["spacetimedb"],
  // Mark node-specific optional deps as external on the server to avoid bundling issues
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"],
}

export default nextConfig
