"use client";

import "./globals.css";
import React, { useEffect } from "react";
import { initNative } from "@/lib/capacitor";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initNative();
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <title>Emergent — Build Monetizable Software with AI</title>
        <meta
          name="description"
          content="From concept to deployment, Emergent handles every aspect of software development so you can focus on what matters most - your vision!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen bg-[#050507] text-zinc-100 antialiased selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
