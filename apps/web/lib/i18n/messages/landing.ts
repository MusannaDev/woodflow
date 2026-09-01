import { Msg } from '../types';

/** Bosh sahifa (landing) + auth brend paneli. */
export const landing = {
  'landing.nav.features': ['Imkoniyatlar', 'Features'],
  'landing.nav.how': ['Qanday ishlaydi', 'How it works'],
  'landing.nav.login': ['Kirish', 'Log in'],
  'landing.nav.signup': ['Ro‘yxatdan o‘tish', 'Sign up'],
  'landing.nav.dashboard': ['Dashboard →', 'Dashboard →'],

  'landing.badge': [
    '🪵 Yog‘och & taxta biznesi uchun maxsus',
    '🪵 Purpose-built for timber & lumber',
  ],
  'landing.hero.title1': ['Daftar va Telegram o‘rniga —', 'Instead of notebooks and Telegram —'],
  'landing.hero.title2': ['bitta platforma', 'one platform'],
  'landing.hero.sub': [
    'Kirim, ombor, savdo, qarz va xarajat — siz kiritasiz, RS Development hisoblaydi. Istalgan payt aniq foydangizni ko‘rasiz: telefonda ham, kompyuterda ham.',
    'Purchases, stock, sales, debts and expenses — you enter them, RS Development does the math. See your exact profit any time, on phone or desktop.',
  ],
  'landing.cta.start': ['Bepul boshlash', 'Start free'],
  'landing.cta.toDashboard': ['Dashboard’ga o‘tish', 'Go to dashboard'],
  'landing.cta.how': ['Qanday ishlaydi?', 'How does it work?'],

  'landing.preview.title': ['Yog‘och sotuvi · Dashboard', 'Timber trading · Dashboard'],
  'landing.preview.sales': ['BUGUNGI SAVDO', 'TODAY’S SALES'],
  'landing.preview.stock': ['OMBOR QOLDIG‘I', 'STOCK ON HAND'],
  'landing.preview.stockSub': ['yog‘och', 'timber'],
  'landing.preview.profit': ['KUTILAYOTGAN FOYDA', 'EXPECTED PROFIT'],
  'landing.preview.profitSub': ['shu oy', 'this month'],
  'landing.preview.debts': ['QARZLAR', 'RECEIVABLES'],
  'landing.preview.debtsSub': ['3 mijoz', '3 customers'],

  'landing.features.title': ['Biznesingiz uchun yaratilgan', 'Built for your business'],
  'landing.features.sub': [
    'Umumiy dastur emas — yog‘och importi va taxta ishlab chiqarishning har bir nozikligi hisobga olingan.',
    'Not a generic tool — every detail of timber importing and lumber production is accounted for.',
  ],

  'landing.f1.title': ['Har furadan aniq foyda', 'Exact profit per truck'],
  'landing.f1.text': [
    'Nomer, rang, ega, telefon — va eng muhimi: har fura alohida foyda markazi. Savdo − tannarx − transport − bojxona − nuqson = sof foyda.',
    'Plate, colour, owner, phone — and most importantly: every truck is its own profit centre. Sales − cost − freight − customs − defects = net profit.',
  ],
  'landing.f2.title': ['O‘lchamdan m³ avtomatik', 'Dimensions to m³, automatically'],
  'landing.f2.text': [
    '«6 metr, 200 dona, donasi 25 mingdan» deysiz — tizim 12 m³ deb hisoblab, ombordan o‘zi yechadi. Qo‘lda sanash yo‘q.',
    'Say “6 metres, 200 pieces, 25k each” — the system works out 12 m³ and deducts it from stock itself. No manual maths.',
  ],
  'landing.f3.title': ['RUB · USD · so‘m — to‘g‘ri', 'RUB · USD · UZS — done right'],
  'landing.f3.text': [
    'Import rublda, narx so‘mda, to‘lov dollarda bo‘lsa ham — har yozuv o‘z kursini muzlatib saqlaydi. «Qog‘ozda foyda, aslida zarar» bo‘lmaydi.',
    'Imports in roubles, prices in soum, payment in dollars — each record freezes its own rate. No more “profit on paper, loss in reality”.',
  ],
  'landing.f4.title': ['Ombor m³ hisobida', 'Stock tracked in m³'],
  'landing.f4.text': [
    'Har kirim omborni to‘ldiradi, har savdo avtomatik yechadi. Nuqsonli yog‘och ajratiladi va zarar sifatida furaga yoziladi.',
    'Every purchase fills the warehouse, every sale draws it down automatically. Defective timber is separated and charged back to the truck as a loss.',
  ],
  'landing.f5.title': ['Ishlab chiqarish va yield', 'Production and yield'],
  'landing.f5.text': [
    'Necha m³ xomashyodan qancha pol taxta chiqdi — chiqim foizi (yield) har partiyada. Ikki biznes ichki transfer bilan toza ajralgan.',
    'How much flooring came out of how much raw timber — yield percentage on every batch. Two businesses kept cleanly apart via internal transfers.',
  ],
  'landing.f6.title': ['Qarz va xarajat nazorati', 'Debt and expense control'],
  'landing.f6.text': [
    'Kim qancha qarz — ro‘yxat doim tayyor. Oylik, gaz, svet, soliq — kategoriya bo‘yicha, sof foydadan avtomatik ayiriladi.',
    'Who owes what — the list is always ready. Payroll, gas, electricity, tax — by category, deducted from net profit automatically.',
  ],

  'landing.steps.title1': ['Uch qadam —', 'Three steps —'],
  'landing.steps.title2': ['shu xolos', 'that’s all'],
  'landing.s1.t': ['Kiriting', 'Enter it'],
  'landing.s1.d': [
    'Fura keldi — kirim yozasiz. Mijoz oldi — savdo yozasiz. Bor-yo‘g‘i shu.',
    'A truck arrives — you log a purchase. A customer buys — you log a sale. That’s it.',
  ],
  'landing.s2.t': ['Tizim hisoblaydi', 'The system calculates'],
  'landing.s2.d': [
    'm³, kurs, ombor qoldig‘i, qarz — hammasi avtomatik, xatosiz.',
    'm³, exchange rates, stock balance, debts — all automatic, no mistakes.',
  ],
  'landing.s3.t': ['Foydani ko‘ring', 'See the profit'],
  'landing.s3.d': [
    'Har furadan, har oydan, har biznesdan — aniq raqam bilan.',
    'Per truck, per month, per business — with an exact number.',
  ],

  'landing.stat1': ['biznes, bitta login', 'businesses, one login'],
  'landing.stat2': ['avtomatik hisob', 'automatic calculation'],
  'landing.stat3': ['valyuta (RUB·USD·UZS)', 'currencies (RUB·USD·UZS)'],
  'landing.stat4': ['telefon va kompyuterda', 'on phone and desktop'],

  'landing.final.title': [
    'Bugun boshlang — foydangizni aniq biling',
    'Start today — know your profit exactly',
  ],
  'landing.final.sub': [
    'Bir daqiqada hisob yaratiladi, ikkala biznes makoni avtomatik tayyor.',
    'An account in under a minute, with both business workspaces ready to go.',
  ],
  'landing.final.cta': ['Ro‘yxatdan o‘tish — bepul', 'Sign up — it’s free'],
  'landing.footer': [
    'Yog‘och & Taxta biznes platformasi',
    'Timber & Lumber business platform',
  ],

  // Auth brend paneli
  'brand.title1': ['Yog‘och biznesingiz —', 'Your timber business —'],
  'brand.title2': ['bitta platformada', 'on one platform'],
  'brand.sub': [
    'Daftar va Telegram o‘rniga: kirim, ombor, savdo va foyda — hammasi avtomatik hisoblanadi.',
    'Instead of notebooks and Telegram: purchases, stock, sales and profit — all calculated automatically.',
  ],
  'brand.b1': ['Har furadan aniq sof foyda', 'Exact net profit on every truck'],
  'brand.b2': ['O‘lchamdan m³ avtomatik hisob', 'Dimensions converted to m³ automatically'],
  'brand.b3': ['RUB · USD · so‘m — kurs muzlatiladi', 'RUB · USD · UZS — rates frozen per record'],
  'brand.b4': [
    'Ikki biznes — bitta login, toza ajratilgan',
    'Two businesses — one login, cleanly separated',
  ],
} as const satisfies Record<string, Msg>;
