import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Overr Super League",
  description: "Private online football management league.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
