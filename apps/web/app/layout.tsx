import type { Metadata, Viewport } from 'next';
import { Manrope, Playfair_Display } from 'next/font/google';
import { ReactNode } from 'react';
import { WoodflowApolloProvider } from '../lib/apollo-provider';
import './globals.css';

/** Luxury shrift juftligi: Manrope (UI) + Playfair Display (classic serif). */
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WoodFlow',
  description: "Yog'och & Taxta biznes platformasi",
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#b06a24',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" className={`${manrope.variable} ${playfair.variable}`}>
      <body>
        <WoodflowApolloProvider>{children}</WoodflowApolloProvider>
      </body>
    </html>
  );
}
