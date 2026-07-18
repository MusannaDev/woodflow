import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { WoodflowApolloProvider } from '../lib/apollo-provider';
import './globals.css';

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
    <html lang="uz">
      <body>
        <WoodflowApolloProvider>{children}</WoodflowApolloProvider>
      </body>
    </html>
  );
}
