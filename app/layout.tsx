import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShBlog",
  description: "Black & White minimal blog",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
