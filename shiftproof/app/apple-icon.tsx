import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Indigo field, white inspection tag, indigo check. iOS rounds the corners itself.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
        }}
      >
        <svg width="124" height="124" viewBox="0 0 32 32">
          <path fill="#ffffff" d="M11 2H21L27 8V27A3 3 0 0 1 24 30H8A3 3 0 0 1 5 27V8Z" />
          <circle cx="16" cy="8.75" r="2.1" fill="#4f46e5" />
          <path
            d="M10 20.5L14.25 24.75L22 15.5"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
