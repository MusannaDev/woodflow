import { Msg } from '../types';

/** Sozlamalar va obuna (billing) sahifalari. */
export const account = {
  // Sozlamalar
  'set.title': ['Sozlamalar', 'Settings'],
  'set.sub': ['Biznesingiz brendi — nom va logo.', 'Your business brand — name and logo.'],
  'set.logo': ['Biznes logosi', 'Business logo'],
  'set.logoHint': [
    'PNG, JPG yoki WEBP — maks 2MB. Menyu va sarlavhada ko‘rinadi.',
    'PNG, JPG or WEBP — max 2MB. Shown in the menu and header.',
  ],
  'set.uploading': ['Yuklanmoqda…', 'Uploading…'],
  'set.replaceLogo': ['Logoni almashtirish', 'Replace logo'],
  'set.uploadLogo': ['Logo yuklash', 'Upload logo'],
  'set.logoDone': [
    'Logo yuklandi. Sahifa yangilanganda menyuda ko‘rinadi.',
    'Logo uploaded. It appears in the menu after a refresh.',
  ],
  'set.logoError': [
    'Yuklashda xato — rasm (png/jpg/webp, maks 2MB) tanlang.',
    'Upload failed — choose an image (png/jpg/webp, max 2MB).',
  ],
  'set.uploadFailed': ['Yuklashda xato.', 'Upload failed.'],
  'set.bizName': ['Biznes nomi', 'Business name'],
  'set.bizNamePh': ['Masalan: Premium Wood', 'For example: Premium Wood'],
  'set.nameDone': [
    'Biznes nomi saqlandi. Sahifa yangilanganda menyuda ko‘rinadi.',
    'Business name saved. It appears in the menu after a refresh.',
  ],
  'set.saveName': ['Nomni saqlash', 'Save name'],

  // Obuna
  'sub.title': ['Obunani tanlang', 'Choose your plan'],
  'sub.sub': [
    'Platformadan uzluksiz foydalanish uchun tarif tanlab, kartaga to‘lov qiling. CEO tasdiqlagach obuna avtomatik uzayadi.',
    'Pick a plan and pay by card to keep using the platform. Your subscription extends automatically once the CEO approves.',
  ],
  'sub.free.title': ['🎁 Tekin ruxsat faol', '🎁 Free access active'],
  'sub.free.text': [
    'CEO sizga to‘lovsiz foydalanish ruxsatini bergan.',
    'The CEO has granted you free access.',
  ],
  'sub.blocked.title': [
    '🔒 Obuna tugagan — platforma bloklangan',
    '🔒 Subscription expired — platform locked',
  ],
  'sub.blocked.text': [
    'Davom etish uchun quyidan tarif tanlab to‘lov qiling.',
    'Choose a plan below and pay to continue.',
  ],
  'sub.active.title': ['✓ Obuna faol', '✓ Subscription active'],
  'sub.active.text': [
    '{date} gacha ochiq. Muddatni oldindan uzaytirishingiz mumkin.',
    'Open until {date}. You can extend it in advance.',
  ],
  'sub.none.title': ['Hali to‘lov qilinmagan', 'No payment yet'],
  'sub.none.text': [
    'Boshlash uchun quyidan tarif tanlang.',
    'Choose a plan below to get started.',
  ],

  'plan.1': ['1 oylik', '1 month'],
  'plan.3': ['3 oylik', '3 months'],
  'plan.6': ['6 oylik', '6 months'],
  'plan.12': ['12 oylik', '12 months'],
  'plan.popular': ['⭐ Ommabop', '⭐ Popular'],
  'plan.save': ['🔥 {discount} tejaysiz', '🔥 Save {discount}'],
  'plan.starter': ['Boshlang‘ich', 'Starter'],
  'plan.desc': [
    '{months} oylik to‘liq kirish · barcha bo‘limlar · cheksiz foydalanish',
    '{months} months of full access · every section · unlimited use',
  ],
  'plan.pick': ['Tanlash', 'Choose'],

  'pm.title': ['Kartaga to‘lov qilish', 'Pay by card'],
  'pm.copy': ['Nusxa olish', 'Copy'],
  'pm.copied': ['✓ nusxa olindi', '✓ copied'],
  'pm.recipient': ['Qabul qiluvchi', 'Recipient'],
  'pm.forMonths': ['{months} oy uchun', 'For {months} months'],
  'pm.agree': [
    'Xizmat ko‘rsatish shartlari va maxfiylik siyosati bilan tanishdim.',
    'I have read the terms of service and the privacy policy.',
  ],
  'pm.agreeTerms': ['shartlari', 'terms of service'],
  'pm.agreePrivacy': ['maxfiylik siyosati', 'privacy policy'],
  'pm.agreePre': ['Xizmat ko‘rsatish', 'I have read the'],
  'pm.agreeMid': ['va', 'and the'],
  'pm.agreePost': ['bilan tanishdim.', '.'],
  'pm.paidPre': ['Yuqoridagi kartaga', 'I have transferred'],
  'pm.paidPost': ['to‘lovni amalga oshirdim.', 'to the card above.'],
  'pm.notePh': [
    'Chek raqami yoki izoh (ixtiyoriy)',
    'Receipt number or note (optional)',
  ],
  'pm.sending': ['Yuborilmoqda…', 'Sending…'],
  'pm.submit': ['To‘lovni tasdiqlash', 'Confirm payment'],
  'pm.footnote': [
    'To‘lov CEO tomonidan tekshirilib tasdiqlanadi.',
    'The CEO reviews and approves the payment.',
  ],
  'pm.defaultNote': ['{title} tarifi', '{title} plan'],

  'sub.history': ['To‘lovlar tarixi ({n})', 'Payment history ({n})'],
  'sub.historyEmpty': ['Hali to‘lov yo‘q.', 'No payments yet.'],
  'sub.months': ['· {n} oy', '· {n} months'],
  'payStatus.PENDING': ['⏳ Kutilmoqda', '⏳ Pending'],
  'payStatus.APPROVED': ['✓ Tasdiqlandi', '✓ Approved'],
  'payStatus.REJECTED': ['✕ Rad etildi', '✕ Rejected'],
} as const satisfies Record<string, Msg>;
