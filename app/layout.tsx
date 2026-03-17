import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampFinder — The Summer Puzzle, Solved",
  description: "AI-powered summer camp planning for families with multiple kids. Logistics, costs, carpools — all solved.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cf-warm font-sans text-cf-text antialiased">{children}</body>
    </html>
  );
}
