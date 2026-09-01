import { Msg } from '../types';

/** Shablonlar va ichki transfer sahifalari. */
export const ops = {
  // Mahsulot shablonlari
  'tpl.title': ['Mahsulot shablonlari', 'Product templates'],
  'tpl.empty': [
    'Hozircha shablon yo‘q — o‘ngdan qo‘shing.',
    'No templates yet — add one on the right.',
  ],
  'tpl.col.name': ['NOMI', 'NAME'],
  'tpl.col.size': ['O‘LCHAM (m)', 'DIMENSIONS (m)'],
  'tpl.col.volume': ['HAJM / DONA', 'VOLUME / PIECE'],
  'tpl.new': ['+ Yangi shablon', '+ New template'],
  'tpl.namePh': ['Pol taxta 6m', 'Floorboard 6m'],
  'tpl.unit': ['{label} (m)', '{label} (m)'],
  'tpl.perPiece': ['Bir dona hajmi', 'Volume per piece'],
  'tpl.saved': ['Shablon «{name}» saqlandi.', 'Template “{name}” saved.'],
  'tpl.submit': ['Shablonni saqlash', 'Save template'],

  // Ichki transfer
  'tr.title': ['Ichki transfer', 'Internal transfer'],
  'tr.sendTo': ['Xomashyo yuborish →', 'Send raw material →'],
  'tr.fromLot': ['Ombordan (lot)', 'From stock (lot)'],
  'tr.pickLot': ['— Lot tanlang —', '— Select a lot —'],
  'tr.lotOption': [
    '{wood} · {grade} — qoldiq {vol} m³',
    '{wood} · {grade} — {vol} m³ left',
  ],
  'tr.volume': ['Hajm (m³)', 'Volume (m³)'],
  'tr.pieces': ['Dona (maks {max})', 'Pieces (max {max})'],
  'tr.internalPrice': ['Jami ichki narx (so‘m)', 'Total internal price (UZS)'],
  'tr.unitCostHint': [
    'Tannarx: {value} so‘m/m³ — qabul qiluvchida shu tannarx bilan lot ochiladi.',
    'Unit cost: {value} UZS/m³ — the receiving side opens a lot at this cost.',
  ],
  'tr.exceeds': [
    '⚠ Lotda yetarli emas — qoldiq {vol} m³',
    '⚠ Not enough in this lot — {vol} m³ remaining',
  ],
  'tr.sending': ['O‘tkazilmoqda…', 'Transferring…'],
  'tr.submit': ['Transfer qilish', 'Transfer'],
  'tr.done': [
    '{vol} m³ «{ws}»ga o‘tkazildi — {amount} so‘m (bu yerga daromad, u yerga xarajat).',
    '{vol} m³ transferred to “{ws}” — {amount} UZS (income here, cost there).',
  ],
  'tr.ownerOnly': [
    'Transfer yuborish faqat biznes egasiga ochiq. Quyida transferlar tarixi.',
    'Only the business owner can send transfers. The transfer history is below.',
  ],
  'tr.receiverNote': [
    'Xomashyo Yog‘och sotuvi tomonidan yuboriladi va bu yerda avtomatik Xomashyo omboriga tushadi (kirim sifatida). Quyida qabul qilingan transferlar tarixi.',
    'Raw material is sent from Timber trading and lands here in the raw material warehouse automatically (as a purchase). Received transfers are listed below.',
  ],
  'tr.history': ['Transferlar tarixi', 'Transfer history'],
  'tr.empty': ['Hozircha transfer yo‘q.', 'No transfers yet.'],
  'tr.col.date': ['SANA', 'DATE'],
  'tr.col.direction': ['YO‘NALISH', 'DIRECTION'],
  'tr.col.volume': ['HAJM', 'VOLUME'],
  'tr.col.pieces': ['DONA', 'PIECES'],
  'tr.col.price': ['ICHKI NARX', 'INTERNAL PRICE'],
  'tr.out': ['Chiqdi →', 'Sent →'],
  'tr.in': ['← Keldi', '← Received'],
} as const satisfies Record<string, Msg>;

/** Ombor (xomashyo) sahifasi. */
export const inventory = {
  'inv.title': ['Ombor', 'Inventory'],
  'inv.chip.remaining': ['Jami qoldiq', 'Total remaining'],
  'inv.chip.pieces': ['Jami dona', 'Total pieces'],
  'inv.chip.defect': ['Nuqson', 'Defects'],
  'inv.chip.lots': ['Lotlar', 'Lots'],

  'inv.col.woodSource': ['YOG‘OCH / MANBA', 'TIMBER / SOURCE'],
  'inv.col.grade': ['NAVI', 'GRADE'],
  'inv.col.remaining': ['QOLDIQ', 'REMAINING'],
  'inv.col.pieces': ['DONA', 'PIECES'],
  'inv.col.unitCost': ['TANNARX / m³', 'COST / m³'],
  'inv.col.status': ['HOLAT', 'STATUS'],
  'inv.col.action': ['AMAL', 'ACTION'],

  'lotStatus.AVAILABLE': ['Mavjud', 'Available'],
  'lotStatus.LOW': ['Kam', 'Low'],
  'lotStatus.RESERVED': ['Bron', 'Reserved'],
  'lotStatus.SOLD_OUT': ['Tugagan', 'Sold out'],
  'lotStatus.DEFECT': ['Nuqson', 'Defective'],

  'inv.markDefect': ['Nuqson belgilash', 'Mark as defective'],
  'inv.defectVol': [
    'Nuqson hajmi (m³) — maks {max}',
    'Defect volume (m³) — max {max}',
  ],
  'inv.defectQty': ['Dona (maks {max})', 'Pieces (max {max})'],
  'inv.defectReason': ['Sabab (ixtiyoriy)', 'Reason (optional)'],
  'inv.defectReasonPh': ['Chirigan, yorilgan…', 'Rotten, cracked…'],
  'inv.defectSubmit': ['Nuqsonni tasdiqlash', 'Confirm defect'],
  'inv.defectRange': [
    'Hajm 0 dan katta va qoldiqdan ({max} m³) oshmasligi kerak.',
    'The volume must be above 0 and no more than the {max} m³ remaining.',
  ],
  'inv.defectDone': [
    '{vol} m³ nuqson belgilandi — sotiladigan qoldiqdan chiqarildi, zarar furaga yozildi.',
    '{vol} m³ marked as defective — removed from sellable stock and charged to the shipment as a loss.',
  ],
} as const satisfies Record<string, Msg>;
