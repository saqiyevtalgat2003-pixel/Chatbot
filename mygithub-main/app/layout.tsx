import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "git-dashboard",
  description: "Репозиторийлерді басқару панелі",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-ink text-text antialiased">{children}</body>
    </html>
  );
}
