import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORGE — Industrial AI Control Plane",
  description: "Industrial AI that proposes. You decide. Sovereign, evidence-grounded control plane for critical operations.",
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
