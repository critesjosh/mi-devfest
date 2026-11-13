import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ShiftProof",
    short_name: "ShiftProof",
    start_url: "/",
    display: "standalone",
    background_color: "#e7ebf5",
    theme_color: "#16171e",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
