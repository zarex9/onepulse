const nextConfig = {
  // Opt into Turbopack configuration (Next 16+)
  turbopack: {},
  // Mark node-specific optional deps as external on the server to avoid bundling issues
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"],
}

export default nextConfig
