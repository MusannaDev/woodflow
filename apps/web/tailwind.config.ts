import type { Config } from 'tailwindcss';

/**
 * Dizayn tizimi (UI hujjati §2): har workspace o'z rangi.
 * Rang CSS o'zgaruvchilar orqali — workspace almashganda butun UI o'zgaradi.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          soft: 'rgb(var(--brand-soft) / <alpha-value>)',
          faint: 'rgb(var(--brand-faint) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
