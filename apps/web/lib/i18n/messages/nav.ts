import { Msg } from '../types';

/** Sidebar, mobil tab-bar va CEO navigatsiyasi. */
export const nav = {
  'nav.dashboard': ['Dashboard', 'Dashboard'],
  'nav.furalar': ['Furalar', 'Shipments'],
  'nav.kirim': ['Kirim', 'Purchases'],
  'nav.ombor': ['Ombor', 'Inventory'],
  'nav.omborRaw': ['Xomashyo ombori', 'Raw material stock'],
  'nav.savdo': ['Savdo', 'Sales'],
  'nav.tolovlar': ['To‘lovlar', 'Payments'],
  'nav.transfer': ['Ichki transfer', 'Internal transfer'],
  'nav.mijozlar': ['Mijozlar', 'Customers'],
  'nav.xarajatlar': ['Xarajatlar', 'Expenses'],
  'nav.ishchilar': ['Ishchilar', 'Employees'],
  'nav.oylik': ['Oylik', 'Payroll'],
  'nav.konsolidatsiya': ['Konsolidatsiya', 'Consolidation'],
  'nav.ishlabChiqarish': ['Ishlab chiqarish', 'Production'],
  'nav.shablonlar': ['Shablonlar', 'Templates'],
  'nav.tayyorOmbor': ['Tayyor ombor', 'Finished goods'],
  'nav.obuna': ['Obuna', 'Subscription'],
  'nav.sozlamalar': ['Sozlamalar', 'Settings'],

  // Mobil tab-bar (qisqartirilgan)
  'nav.tab.home': ['Asosiy', 'Home'],
  'nav.tab.ombor': ['Ombor', 'Stock'],
  'nav.tab.savdo': ['Savdo', 'Sale'],
  'nav.tab.tolov': ['To‘lov', 'Payment'],
  'nav.tab.prod': ['Ishlab ch.', 'Production'],
  'nav.tab.tayyor': ['Tayyor', 'Finished'],
  'nav.tab.mijozlar': ['Mijozlar', 'Customers'],

  // CEO paneli
  'nav.ceo.umumiy': ['Umumiy', 'Overview'],
  'nav.ceo.sorovlar': ['So‘rovlar', 'Requests'],
  'nav.ceo.tolovlar': ['To‘lovlar', 'Payments'],
  'nav.ceo.ownerlar': ['Ownerlar', 'Owners'],
  'nav.ceo.users': ['Foydalanuvchilar', 'Users'],
  'nav.ceo.panel': ['CEO Panel', 'CEO Panel'],
  'nav.ceo.platformOwner': ['Platforma egasi', 'Platform owner'],
} as const satisfies Record<string, Msg>;
