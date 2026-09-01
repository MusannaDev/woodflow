import { Lang } from './types';

/**
 * Backend (NestJS) xato xabarlari o'zbekcha keladi. Bu yerda ular ingliz
 * tiliga o'giriladi — server'ni o'zgartirmasdan.
 *
 * Ishlash tartibi:
 *  1. Aynan mos kelish (EXACT) — apostrof/bo'shliq normallashtirilgandan keyin.
 *  2. Shablonli xabarlar (PATTERNS) — regex, raqamlar $1,$2… bilan ko'chiriladi.
 *  3. Topilmasa — xabar o'zgarishsiz qaytariladi (ma'lumot yo'qolmaydi).
 */

/** Barcha apostrof variantlarini bittaga keltirib, bo'shliqlarni tozalaydi. */
function normalize(s: string): string {
  return s
    .replace(/[‘’ʻʼ`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const EXACT: Record<string, string> = {
  // Auth / ruxsat
  'Autentifikatsiya talab qilinadi.': 'Authentication required.',
  'Telefon yoki parol noto\'g\'ri.': 'Incorrect phone number or password.',
  'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan.':
    'This phone number is already registered.',
  'Bu telefon raqam band.': 'This phone number is already taken.',
  'Biznes nomini kiriting.': 'Enter a business name.',
  'Bu amal faqat CEO uchun.': 'This action is available to the CEO only.',
  'CEO hisobini o\'chirib bo\'lmaydi.': 'The CEO account cannot be deleted.',
  'Sizda biznes yo\'q.': 'You don’t have a business.',
  'Bu workspace\'ga ruxsatingiz yo\'q.': 'You don’t have access to this workspace.',
  'Qabul qiluvchi workspace\'ga ruxsatingiz yo\'q.':
    'You don’t have access to the receiving workspace.',
  'x-workspace-id header yuborilmagan.': 'The x-workspace-id header was not sent.',
  'Workspace konteksti o\'rnatilmagan (workspaceId yo\'q).':
    'Workspace context is not set (workspaceId missing).',
  'JWT_SECRET .env da o\'rnatilmagan.': 'JWT_SECRET is not set in .env.',
  'Konsolidatsiya faqat egaga (OWNER) ochiq.':
    'Consolidation is available to the owner (OWNER) only.',
  'OWNER workspace topilmadi.': 'Owner workspace not found.',

  // Topilmadi
  'Biznes topilmadi.': 'Business not found.',
  'Foydalanuvchi topilmadi.': 'User not found.',
  'Fura topilmadi.': 'Shipment not found.',
  'Ko\'rsatilgan fura topilmadi.': 'The specified shipment was not found.',
  'Ishchi topilmadi.': 'Employee not found.',
  'Lot topilmadi.': 'Lot not found.',
  'Manba lot topilmadi.': 'Source lot not found.',
  'Xomashyo lot topilmadi.': 'Raw material lot not found.',
  'Mahsulot shabloni topilmadi.': 'Product template not found.',
  'Oylik yozuvi topilmadi.': 'Payroll record not found.',
  'Savdo topilmadi.': 'Sale not found.',
  'So\'rov topilmadi.': 'Request not found.',
  'To\'lov topilmadi.': 'Payment not found.',
  'Kurs topilmadi — avval setExchangeRate bilan kiriting.':
    'Exchange rate not found — set it first with setExchangeRate.',

  // Holat
  'So\'rov allaqachon hal qilingan.': 'This request has already been handled.',
  'To\'lov allaqachon hal qilingan.': 'This payment has already been handled.',

  // Kirim / valyuta
  'Import kirimi uchun fura (shipmentId) majburiy.':
    'A shipment (shipmentId) is required for an import purchase.',
  'Import kirimi uchun kurs (exchangeRate) majburiy.':
    'An exchange rate is required for an import purchase.',
  'Import kirimi valyutasi RUB bo\'lishi kerak.':
    'Import purchases must be in RUB.',
  'Mahalliy kirim furaga bog\'lanmaydi.':
    'A local purchase cannot be linked to a shipment.',
  'Mahalliy kirim valyutasi UZS bo\'lishi kerak.':
    'Local purchases must be in UZS.',
  'To\'lov faqat UZS yoki USD bo\'ladi.': 'Payments can only be in UZS or USD.',
  'USD to\'lov uchun kurs (exchangeRate) majburiy.':
    'An exchange rate is required for USD payments.',

  // Ombor / o'lchov
  'Bu lotda dona hisobi yuritilmaydi.': 'This lot is not tracked by pieces.',
  'Dona soni musbat butun son bo\'lishi kerak.':
    'The piece count must be a positive whole number.',
  'Hajm (m³) nol bo\'lishi mumkin emas.': 'Volume (m³) cannot be zero.',
  'Kirish hajmi (m³) nol bo\'lishi mumkin emas.':
    'Input volume (m³) cannot be zero.',
  'lotId yoki finishedLotId kerak.': 'Either lotId or finishedLotId is required.',
  'Xomashyo savdosida uzunlik + (en va qalinlik) yoki (bosh va uch diametri) majburiy.':
    'A raw timber sale needs length plus either width and thickness, or butt and top diameter.',
  'O\'zi-o\'ziga transfer qilib bo\'lmaydi.': 'You cannot transfer to the same workspace.',

  // Fayl
  'Rasm fayli kerak (png/jpg/webp/svg, maks 2MB).':
    'An image file is required (png/jpg/webp/svg, max 2MB).',
};

/** Shablonli (o'zgaruvchili) xabarlar. */
const PATTERNS: [RegExp, string][] = [
  [
    /^Bu amal uchun ruxsat yo'q\. Kerakli rol: (.+)\.$/,
    'You don’t have permission for this action. Required role: $1.',
  ],
  [
    /^Chiqish hajmi \((.+?) m³\) kirish hajmidan \((.+?) m³\) katta bo'lishi mumkin emas\.$/,
    'Output volume ($1 m³) cannot exceed input volume ($2 m³).',
  ],
  [
    /^Dona yetarli emas: so'ralgan (.+?), qoldiq (.+?)\.$/,
    'Not enough pieces: requested $1, remaining $2.',
  ],
  [/^Lot topilmadi: (.+)$/, 'Lot not found: $1'],
  [
    /^Nuqson \((.+?)\) qoldiqdan \((.+?)\) oshib ketdi\.$/,
    'Defect volume ($1) exceeds the remaining $2.',
  ],
  [
    /^Nuqson dona \((.+?)\) qoldiq donadan \((.+?)\) oshib ketdi\.$/,
    'Defective pieces ($1) exceed the $2 remaining.',
  ],
  [
    /^Omborda dona yetarli emas: so'ralgan (.+?) dona, qoldiq (.+?) dona \(lot (.+?)\)\.$/,
    'Not enough pieces in stock: requested $1, remaining $2 (lot $3).',
  ],
  [
    /^Omborda yetarli emas: so'ralgan (.+?) m³, qoldiq (.+?) m³ \(lot (.+?)\)\.$/,
    'Not enough stock: requested $1 m³, remaining $2 m³ (lot $3).',
  ],
  [
    /^Omborda yetarli emas: so'ralgan (.+?) m³, qoldiq (.+?) m³\.$/,
    'Not enough stock: requested $1 m³, remaining $2 m³.',
  ],
  [/^Tayyor mahsulot topilmadi: (.+)$/, 'Finished product not found: $1'],
  [
    /^Tayyor mahsulot yetarli emas: so'ralgan (.+?) dona, qoldiq (.+?) dona\.$/,
    'Not enough finished goods: requested $1 pcs, remaining $2 pcs.',
  ],
  [
    /^To'lov \((.+?) so'm\) qarzdan \((.+?) so'm\) ortiq\.$/,
    'The payment ($1 UZS) is larger than the debt ($2 UZS).',
  ],
  [
    /^Xomashyo yetarli emas: so'ralgan (.+?) m³, qoldiq (.+?) m³\.$/,
    'Not enough raw material: requested $1 m³, remaining $2 m³.',
  ],
];

/** Apollo "…: message" ko'rinishidagi prefikslarni tozalaydi. */
const stripPrefix = (s: string): string =>
  s.replace(/^(?:GraphQL error|ApolloError|Error):\s*/i, '');

/**
 * Server xabarini joriy tilga o'giradi. O'zbek tilida — o'zgarishsiz;
 * inglizchada — lug'atdan, topilmasa asl xabar qaytadi.
 */
export function translateServerMessage(raw: string, lang: Lang): string {
  const msg = stripPrefix(raw.trim());
  if (lang === 'uz') return msg;

  const key = normalize(msg);
  const exact = EXACT[key];
  if (exact) return exact;

  for (const [re, out] of PATTERNS) {
    if (re.test(key)) return key.replace(re, out);
  }
  return msg;
}
