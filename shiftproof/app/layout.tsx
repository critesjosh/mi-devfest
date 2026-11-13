import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "ShiftProof", description: "Turn a veteran's know-how into approved guide cards." };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      {/* Browser extensions such as Grammarly add attributes to <body> before React loads. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
