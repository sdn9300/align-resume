import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlignResume",
  description: "Truthful AI-powered resume tailoring — match your resume to any job description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
