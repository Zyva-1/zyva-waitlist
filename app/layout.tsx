import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Zyva — Join the waitlist',
  description: 'Zyva is coming soon. Join the waitlist to get early access.',
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#000000' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#000' }}>{children}</body>
    </html>
  );
}
