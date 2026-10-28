import type { Metadata } from 'next';
import { Orbitron, Rajdhani } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Velocity Dash Pro - Cyber Runner',
  description: 'High-octane endless cyber runner with customizable heroes, rich environments, upgrades, dynamic power-ups, and synthesized audio.',
  openGraph: {
    title: 'Velocity Dash Pro - Cyber Runner',
    description: 'High-octane endless cyber runner with customizable heroes, rich environments, upgrades, dynamic power-ups, and synthesized audio.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Velocity Dash Pro - Cyber Runner',
    description: 'High-octane endless cyber runner with customizable heroes, rich environments, upgrades, dynamic power-ups, and synthesized audio.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${orbitron.variable} ${rajdhani.variable} dark`}>
      <body className="bg-[#05050d] text-slate-100 font-rajdhani antialiased min-h-screen selection:bg-cyan-500 selection:text-black overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
