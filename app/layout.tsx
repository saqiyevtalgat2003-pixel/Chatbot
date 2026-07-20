import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KZ Resume — Admin',
  description: 'KZ Resume әкімші панелі',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk">
      <body className="font-sans text-ink bg-bg antialiased">{children}</body>
    </html>
  );
}
