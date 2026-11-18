import type { Metadata, Viewport } from "next";
import type React from "react";
import "./globals.css";
import NativeInit from "@/components/NativeInit";

export const metadata: Metadata = {
  title: "Emergent Studio — describe an app, get a working app",
  description:
    "An open-source app builder that turns a prompt into a running HTML/CSS/JS app, with a live preview, real version history and a publishable URL.",
  applicationName: "Emergent Studio",
  appleWebApp: { capable: true, title: "Studio", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

/**
 * `interactiveWidget: "resizes-content"` makes Android Chrome shrink the layout
 * when the keyboard opens, so the chat composer stays above it instead of being
 * covered by it.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#06060a",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#06060a] text-zinc-100 antialiased">
        <NativeInit />
        {children}
      </body>
    </html>
  );
}
