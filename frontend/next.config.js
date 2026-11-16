/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_OUTPUT === "export";

const nextConfig = {
  reactStrictMode: true,
  // Server mode (default) keeps the Cerebras proxy at /api/llm working on Vercel.
  // Run `NEXT_OUTPUT=export npm run build` to produce a purely static `out/`
  // bundle (e.g. for the Capacitor wrapper) — the AI engine is then unavailable
  // and the builder falls back to its built-in templates.
  ...(isStaticExport ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    // Never bake a localhost default in: an empty value means "standalone mode".
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  },
};

module.exports = nextConfig;
