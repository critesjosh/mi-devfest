import type { NextConfig } from "next";

// "standalone" bundles only the files the server needs, which keeps the container image small
// (the IBM Container Registry free tier allows 512 MB in total).
const nextConfig: NextConfig = { output: "standalone" };

export default nextConfig;
