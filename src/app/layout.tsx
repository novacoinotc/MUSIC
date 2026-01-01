import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synth Forge - AI-Powered Techno Generator",
  description: "Create unique melodic techno tracks with AI-powered synthesis. Generate kicks, basslines, melodies, and complete song structures.",
  keywords: ["techno", "music generator", "AI music", "synthesizer", "melodic techno", "music production"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-zinc-950 font-sans">
        {children}
      </body>
    </html>
  );
}
