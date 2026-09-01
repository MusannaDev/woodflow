import { account } from './account';
import { auth } from './auth';
import { ceo } from './ceo';
import { common } from './common';
import { domain } from './domain';
import { employees, finance, payroll } from './finance';
import { landing } from './landing';
import { pages, pages2 } from './pages';
import { nav } from './nav';
import { inventory, ops } from './ops';
import { shell } from './shell';
import { production, purchases, sales, shipments } from './wood';

/**
 * Barcha xabarlar bitta obyektda. Har kalit — [o'zbekcha, inglizcha] juftligi,
 * shuning uchun bir tilda kalit qolib ketishi mumkin emas.
 */
export const messages = {
  ...common,
  ...nav,
  ...landing,
  ...auth,
  ...shell,
  ...domain,
  ...pages,
  ...pages2,
  ...ops,
  ...inventory,
  ...finance,
  ...payroll,
  ...employees,
  ...shipments,
  ...production,
  ...purchases,
  ...sales,
  ...account,
  ...ceo,
};

export type Messages = typeof messages;
export type MsgKey = keyof Messages;
