import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emergent — Build Monetizable Software with AI",
  description: "From concept to deployment, Emergent handles every aspect of software development so you can focus on what matters most - your vision!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050507] text-zinc-100 antialiased selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
