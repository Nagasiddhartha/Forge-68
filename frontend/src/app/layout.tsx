import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORGE // Sovereign Industrial AI Control Plane",
  description: "Air-gapped, zero-cloud on-premise industrial AI control plane and agent orchestration runtime.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
