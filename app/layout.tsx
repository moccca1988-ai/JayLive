import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#FAFAFA',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Jay Jaym Live',
  description: 'Premium Fashion Live Shopping Experience',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Jay Jaym Live',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-[#FAFAFA] text-gray-900 antialiased overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
