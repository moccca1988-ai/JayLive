import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import InstallPrompt from '@/components/InstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#0B0B0F',
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
      <body className="bg-[#0B0B0F] text-white antialiased overflow-hidden selection:bg-indigo-500/30" suppressHydrationWarning>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
