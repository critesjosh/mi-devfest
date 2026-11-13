import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Graphite field with the paper-stock milled-pass mark. iOS rounds the corners itself.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1b1e1f" }}>
        <svg width="126" height="126" viewBox="0 0 64 64">
          <path fill="#f2f3ef" d="M4 4H60V12H16A4 4 0 0 0 12 16V32A4 4 0 0 0 16 36H44V44H16A4 4 0 0 0 16 52H48A4 4 0 0 0 52 48V32A4 4 0 0 0 48 28H20V20H60V60H4Z" />
        </svg>
      </div>
    ),
    size,
  );
}
