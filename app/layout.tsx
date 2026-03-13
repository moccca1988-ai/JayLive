import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import InstallPrompt from '@/components/InstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Jay Jaym Live',
  description: 'Premium Fashion Live Shopping Experience',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Jay Jaym Live',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-[#0A0A0A] text-white antialiased overflow-hidden" suppressHydrationWarning>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
