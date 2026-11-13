import type { NextConfig } from "next";

// "standalone" bundles only the files the server needs, which keeps the container image small
// (the IBM Container Registry free tier allows 500 MB in total).
// devIndicators off: the dev badge sat on the Compare tab in the phone view.
const nextConfig: NextConfig = { output: "standalone", devIndicators: false };

export default nextConfig;
