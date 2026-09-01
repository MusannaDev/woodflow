import type { Metadata, Viewport } from 'next';
import { Manrope, Playfair_Display } from 'next/font/google';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import { WoodflowApolloProvider } from '../lib/apollo-provider';
import { I18nProvider } from '../lib/i18n';
import { isLang, LANG_KEY } from '../lib/i18n/types';
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

/** Sarlavha/tavsif ham cookie'dagi tilga qarab chiqadi. */
export function generateMetadata(): Metadata {
  const stored = cookies().get(LANG_KEY)?.value;
  const uz = !isLang(stored) || stored === 'uz';

  return {
    title: 'RS Development',
    description: uz
      ? "Yog'och & Taxta biznes platformasi"
      : 'Timber & Lumber business platform',
    manifest: '/manifest.webmanifest',
    icons: {
      icon: '/rs-icon.png',
      apple: '/rs-icon.png',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Til cookie'dan server tomonda o'qiladi — shu sabab birinchi render'da
  // ham to'g'ri tilda chiqadi (miltillash va hydration nomuvofiqligi yo'q).
  const stored = cookies().get(LANG_KEY)?.value;
  const lang = isLang(stored) ? stored : 'uz';

  return (
    <html lang={lang} className={`${manrope.variable} ${playfair.variable}`}>
      <body>
        <I18nProvider initialLang={lang}>
          <WoodflowApolloProvider>{children}</WoodflowApolloProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
