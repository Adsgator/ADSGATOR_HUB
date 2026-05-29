import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Portal do Cliente | Adsgator',
  description: 'Acesso seguro ao dashboard do seu cliente',
};

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="bg-surface-base text-ink-primary min-h-screen">
        {children}
      </body>
    </html>
  );
}
