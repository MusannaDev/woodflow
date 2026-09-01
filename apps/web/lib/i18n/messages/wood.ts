import { Msg } from '../types';

/** Furalar (shipments) sahifasi va fura P&L paneli. */
export const shipments = {
  'shp.title': ['Furalar', 'Shipments'],
  'shp.new': ['+ Yangi fura', '+ New shipment'],
  'shp.number': ['Fura nomeri', 'Truck number'],
  'shp.numberPh': ['AA777BB', 'AA777BB'],
  'shp.color': ['Rangi', 'Colour'],
  'shp.colorPh': ['qora', 'black'],
  'shp.ownerName': ['Ega ismi', 'Owner name'],
  'shp.ownerNamePh': ['Ravshan', 'Ravshan'],
  'shp.ownerPhone': ['Ega telefoni', 'Owner phone'],
  'shp.transport': ['Transport xarajati (so‘m)', 'Freight cost (UZS)'],
  'shp.transportPh': ['4 000 000', '4,000,000'],
  'shp.customs': ['Bojxona (so‘m)', 'Customs (UZS)'],
  'shp.customsPh': ['500 000', '500,000'],
  'shp.submit': ['Furani saqlash', 'Save shipment'],
  'shp.added': ['Fura {number} qo‘shildi.', 'Shipment {number} has been added.'],
  'shp.empty': [
    'Hozircha fura yo‘q — «+ Yangi fura» bilan qo‘shing.',
    'No shipments yet — add one with “+ New shipment”.',
  ],
  'shp.pickOne': ['Fura tanlang.', 'Select a shipment.'],
  'shp.pnlLoading': ['P&L hisoblanmoqda…', 'Calculating P&L…'],
  'shp.heading': ['Fura {number}', 'Shipment {number}'],
  'shp.owner': ['Ega: {name}', 'Owner: {name}'],
  'shp.pnlTitle': ['FOYDA HISOBI (P&L)', 'PROFIT & LOSS'],
  'shp.soldWood': [
    'Sotilgan yog‘och ({vol} m³)',
    'Timber sold ({vol} m³)',
  ],
  'shp.woodCost': ['Yog‘och tannarxi', 'Cost of timber'],
  'shp.transportRow': ['Transport', 'Freight'],
  'shp.customsRow': ['Bojxona', 'Customs'],
  'shp.defectLoss': ['Nuqson zarari ({vol} m³)', 'Defect loss ({vol} m³)'],
  'shp.netProfit': ['SOF FOYDA', 'NET PROFIT'],
  'shp.footnote': [
    'Sof foyda = sotilgan savdo − sotilgan hajm tannarxi − transport − bojxona − nuqson zarari. Sotilmagan yog‘och hali xarajat emas — u ombor aktivi.',
    'Net profit = sales − cost of the volume sold − freight − customs − defect loss. Unsold timber is not an expense yet — it is a warehouse asset.',
  ],
} as const satisfies Record<string, Msg>;

/** Ishlab chiqarish (production) sahifasi. */
export const production = {
  'prod.title': ['Ishlab chiqarish', 'Production'],
  'prod.new': ['+ Yangi partiya', '+ New batch'],
  'prod.rawLot': ['Xomashyo (lot)', 'Raw material (lot)'],
  'prod.pickLot': ['— Lot tanlang —', '— Select a lot —'],
  'prod.lotOption': [
    '{wood} · {grade} — qoldiq {vol} m³',
    '{wood} · {grade} — {vol} m³ left',
  ],
  'prod.inputVol': ['Kirish hajmi (m³)', 'Input volume (m³)'],
  'prod.product': ['Mahsulot (shablon)', 'Product (template)'],
  'prod.pickProduct': ['— Tanlang —', '— Select —'],
  'prod.productOption': [
    '{name} ({vol} m³/dona)',
    '{name} ({vol} m³/piece)',
  ],
  'prod.outQty': ['Chiqqan dona soni', 'Pieces produced'],
  'prod.exceedsLot': [
    '⚠ Lotda yetarli emas — qoldiq {vol} m³',
    '⚠ Not enough in this lot — {vol} m³ remaining',
  ],
  'prod.exceedsInput': [
    '⚠ Chiqish hajmi ({vol} m³) kirishdan katta bo‘lishi mumkin emas.',
    '⚠ Output volume ({vol} m³) cannot exceed the input.',
  ],
  'prod.submit': ['Partiyani saqlash', 'Save batch'],
  'prod.saved': [
    'Partiya saqlandi — yield {yield}%. Tayyor mahsulot omborga tushdi.',
    'Batch saved — yield {yield}%. Finished goods added to the warehouse.',
  ],
  'prod.yieldPanel': ['Chiqim (yield) hisobi', 'Yield calculation'],
  'prod.inputRow': ['Kirish (xomashyo)', 'Input (raw material)'],
  'prod.outputRow': ['Chiqish', 'Output'],
  'prod.outputPieces': ['Chiqish ({n} dona)', 'Output ({n} pcs)'],
  'prod.yieldLabel': ['YIELD (CHIQIM %)', 'YIELD (%)'],
  'prod.waste': ['{vol} m³ chiqindi', '{vol} m³ waste'],
  'prod.history': ['Partiyalar tarixi', 'Batch history'],
  'prod.empty': ['Hozircha partiya yo‘q.', 'No batches yet.'],
  'prod.col.date': ['SANA', 'DATE'],
  'prod.col.product': ['MAHSULOT', 'PRODUCT'],
  'prod.col.raw': ['XOMASHYO', 'RAW MATERIAL'],
  'prod.col.output': ['CHIQISH', 'OUTPUT'],
  'prod.col.yield': ['YIELD', 'YIELD'],
} as const satisfies Record<string, Msg>;

/** Kirim (purchases) sahifasi — import va mahalliy. */
export const purchases = {
  'pur.title': ['Kirim', 'Purchases'],
  'pur.lumberNote': [
    'Bu bo‘limda faqat mahalliy kirim qilinadi. Rossiya importi (furalar bilan) — «Yog‘och sotuvi» bo‘limida; xomashyo esa asosan «Ichki transfer» orqali keladi.',
    'Only local purchases are entered here. Russian imports (with trucks) belong to the “Timber trading” workspace, and raw material mostly arrives via “Internal transfer”.',
  ],
  'pur.src.import.title': ['Rossiya importi', 'Russian import'],
  'pur.src.import.desc': [
    'Furaga bog‘lanadi · narx RUB · kurs muzlatiladi',
    'Linked to a truck · priced in RUB · rate frozen',
  ],
  'pur.src.local.title': ['Mahalliy ulgurji', 'Local wholesale'],
  'pur.src.local.desc': ['Furasiz · narx so‘mda', 'No truck · priced in UZS'],

  'pur.shipment': ['Fura', 'Shipment'],
  'pur.pickShipment': ['— Fura tanlang —', '— Select a shipment —'],
  'pur.newShipment': ['➕ Yangi fura qo‘shish', '➕ Add a new shipment'],
  'pur.newShipmentTitle': ['🚛 Yangi fura ma’lumotlari', '🚛 New shipment details'],
  'pur.fTruckPh': ['Fura raqami (AA777BB)', 'Truck number (AA777BB)'],
  'pur.fColorPh': ['Rang (ixtiyoriy)', 'Colour (optional)'],
  'pur.fOwnerPh': ['Ega ismi', 'Owner name'],
  'pur.fPhonePh': ['Telefon', 'Phone'],
  'pur.fTransportPh': ['Transport (so‘m)', 'Freight (UZS)'],
  'pur.fCustomsPh': ['Bojxona (so‘m)', 'Customs (UZS)'],
  'pur.addingShipment': ['Qo‘shilmoqda…', 'Adding…'],
  'pur.addShipment': ['Furani qo‘shish', 'Add shipment'],
  'pur.cancelShort': ['Bekor', 'Cancel'],
  'pur.needShipmentFields': [
    'Fura raqami va ega ismini kiriting.',
    'Enter the truck number and owner name.',
  ],
  'pur.shipmentAdded': [
    'Fura {number} qo‘shildi va tanlandi.',
    'Shipment {number} added and selected.',
  ],
  'pur.shipmentError': ['Fura qo‘shishda xato.', 'Could not add the shipment.'],
  'pur.noShipments': [
    'Fura yo‘q — «➕ Yangi fura qo‘shish»ni tanlab shu yerda qo‘shing.',
    'No shipments yet — pick “➕ Add a new shipment” to create one here.',
  ],

  'pur.woodType': ['Yog‘och turi', 'Timber type'],
  'pur.woodTypePh': ['Qarag‘ay', 'Pine'],
  'pur.grade': ['Navi', 'Grade'],
  'pur.gradePh': ['1-nav', 'Grade 1'],
  'pur.volume': ['Hajm (m³)', 'Volume (m³)'],
  'pur.pieces': ['Dona soni (ixtiyoriy)', 'Piece count (optional)'],
  'pur.priceLabel': ['Narx /', 'Price /'],
  'pur.perPiece': ['dona', 'piece'],
  'pur.needPieces': ['Dona sonini kiriting', 'Enter the piece count'],
  'pur.rate': ['Kurs (1 RUB = ? so‘m)', 'Rate (1 RUB = ? UZS)'],
  'pur.applyRate': [
    'Bugungi kurs: {rate} — qo‘llash',
    'Today’s rate: {rate} — apply',
  ],

  'pur.calcTitle': [
    '🪵 Yumaloq yog‘och hajm kalkulyatori',
    '🪵 Round log volume calculator',
  ],
  'pur.shape.cyl': ['🪵 Silindr', '🪵 Cylinder'],
  'pur.shape.cone': ['📐 Konus', '📐 Cone'],
  'pur.shape.board': ['🟫 Taxta', '🟫 Board'],
  'pur.calc.diameter': ['Diametr ⌀ (sm)', 'Diameter ⌀ (cm)'],
  'pur.calc.base': ['Bosh ⌀ (sm)', 'Butt ⌀ (cm)'],
  'pur.calc.top': ['Uch ⌀ (sm)', 'Top ⌀ (cm)'],
  'pur.calc.length': ['Uzunlik (m)', 'Length (m)'],
  'pur.calc.width': ['En (m)', 'Width (m)'],
  'pur.calc.thickness': ['Qalinlik (m)', 'Thickness (m)'],
  'pur.calc.qty': ['Dona', 'Pieces'],
  'pur.calc.result': [
    'Bir dona: {per} m³ · Jami: {total} m³ —',
    'Per piece: {per} m³ · Total: {total} m³ —',
  ],
  'pur.calc.autofilled': [
    'Hajm avtomatik to‘ldirildi ✓',
    'Volume filled in automatically ✓',
  ],

  'pur.submit': ['Kirimni saqlash', 'Save purchase'],
  'pur.saved': [
    'Kirim saqlandi — {vol} m³ {wood} omborga LOT bo‘lib tushdi (tannarx {cost} so‘m/m³).',
    'Purchase saved — {vol} m³ of {wood} added to stock as a lot (cost {cost} UZS/m³).',
  ],

  'pur.panelTitle': ['Tizim avtomatik hisoblaydi', 'Calculated automatically'],
  'pur.panel.volume': ['Hajm', 'Volume'],
  'pur.panel.pieces': ['Dona', 'Pieces'],
  'pur.panel.totalRub': ['Jami (RUB)', 'Total (RUB)'],
  'pur.panel.totalUzs': ['Jami (so‘m)', 'Total (UZS)'],
  'pur.panel.rate': ['Kurs', 'Rate'],
  'pur.panel.costPerM3': ['Tannarx / m³', 'Cost / m³'],
  'pur.panel.grandTotal': ['JAMI TANNARX', 'TOTAL COST'],
  'pur.panel.importNote': [
    'Kurs shu kirim uchun muzlatiladi — keyin kurs o‘zgarsa ham bu partiya o‘z tannarxida qoladi.',
    'The rate is frozen for this purchase — later rate changes won’t affect this batch’s cost.',
  ],
  'pur.panel.localNote': [
    'Mahalliy kirim so‘mda — kurs ishlatilmaydi.',
    'Local purchases are in UZS — no exchange rate is used.',
  ],
  'pur.panel.lotNote': [
    'Saqlangach omborda yangi LOT paydo bo‘ladi.',
    'A new lot appears in the warehouse once saved.',
  ],

  'pur.history': ['Kirimlar tarixi', 'Purchase history'],
  'pur.empty': ['Hozircha kirim yo‘q.', 'No purchases yet.'],
  'pur.col.date': ['SANA', 'DATE'],
  'pur.col.source': ['MANBA', 'SOURCE'],
  'pur.col.wood': ['YOG‘OCH', 'TIMBER'],
  'pur.col.volume': ['HAJM', 'VOLUME'],
  'pur.col.pieces': ['DONA', 'PIECES'],
  'pur.col.price': ['NARX', 'PRICE'],
  'pur.col.total': ['JAMI (SO‘M)', 'TOTAL (UZS)'],
  'pur.localTag': ['🏠 Mahalliy', '🏠 Local'],
  'pur.rateTag': ['kurs {rate}', 'rate {rate}'],
} as const satisfies Record<string, Msg>;

/** Savdo (sales) sahifasi. */
export const sales = {
  'sale.title': ['Yangi savdo', 'New sale'],
  'sale.type.PER_PIECE': ['Donaga', 'Per piece'],
  'sale.type.PER_CUBE': ['Kub bilan', 'Per cubic metre'],
  'sale.type.WHOLESALE': ['Ulgurji', 'Wholesale'],

  'sale.srcShort.RUSSIA_IMPORT': ['Import', 'Import'],
  'sale.srcShort.INTERNAL_TRANSFER': ['Transfer', 'Transfer'],
  'sale.srcShort.LOCAL': ['Mahalliy', 'Local'],
  'sale.srcShort.PRODUCTION': ['Ishlab chiqarish', 'Production'],

  'sale.customer': ['Mijoz (ixtiyoriy)', 'Customer (optional)'],
  'sale.noCustomer': ['— Tanlanmagan —', '— Not selected —'],
  'sale.newCustomer': ['➕ Yangi mijoz qo‘shish…', '➕ Add a new customer…'],
  'sale.saleType': ['Savdo turi', 'Sale type'],
  'sale.custName': ['Mijoz ismi', 'Customer name'],
  'sale.custNamePh': ['Alisher Karimov', 'Alisher Karimov'],
  'sale.custPhone': ['Telefon (ixtiyoriy)', 'Phone (optional)'],
  'sale.custNote': [
    'Savdo saqlanganda mijoz avtomatik yaratiladi va «Mijozlar» sahifasida ko‘rinadi.',
    'The customer is created automatically when the sale is saved and appears under “Customers”.',
  ],
  'sale.custAdded': [
    ' Yangi mijoz «{name}» qo‘shildi.',
    ' New customer “{name}” added.',
  ],

  'sale.fromFinished': ['Tayyor ombordan (mahsulot)', 'From finished goods'],
  'sale.fromLot': ['Ombordan (lot)', 'From stock (lot)'],
  'sale.pickProduct': ['— Mahsulot tanlang —', '— Select a product —'],
  'sale.pickLot': ['— Lot tanlang —', '— Select a lot —'],
  'sale.finishedOption': [
    '{name} — qoldiq {qty} dona · tannarx {cost} so‘m',
    '{name} — {qty} pcs left · cost {cost} UZS',
  ],
  'sale.lotOption': [
    '{wood} · {grade} · {source} — qoldiq {vol} m³',
    '{wood} · {grade} · {source} — {vol} m³ left',
  ],
  'sale.noFinished': [
    'Tayyor mahsulot yo‘q — avval «Ishlab chiqarish»da partiya yarating.',
    'No finished goods — create a batch under “Production” first.',
  ],

  'sale.dimsLegend': [
    'O‘LCHAM (avtomatik m³ ga aylanadi)',
    'DIMENSIONS (converted to m³ automatically)',
  ],
  'sale.shape.cyl.title': ['Silindr', 'Cylinder'],
  'sale.shape.cyl.desc': ['Ikki uch teng', 'Both ends equal'],
  'sale.shape.cone.title': ['Konus', 'Cone'],
  'sale.shape.cone.desc': ['Ingichkalanadi', 'Tapers'],
  'sale.shape.box.title': ['Taxta', 'Board'],
  'sale.shape.box.desc': ['En × qalinlik', 'Width × thickness'],
  'sale.perPieceHint': [
    'Bir dona ≈ {vol} m³ · {shape}',
    'Per piece ≈ {vol} m³ · {shape}',
  ],
  'sale.cylNote': [
    'ikki uchi bir xil yo‘g‘onlik (silindr).',
    'both ends the same thickness (cylinder).',
  ],
  'sale.coneNote': [
    'bosh yo‘g‘on, uch ingichka (kesik konus).',
    'thick butt, thin top (truncated cone).',
  ],

  'sale.qty': ['Dona soni', 'Piece count'],
  'sale.pricePerPiece': ['Narx / dona (so‘m)', 'Price / piece (UZS)'],
  'sale.pricePerM3': ['Narx / m³ (so‘m)', 'Price / m³ (UZS)'],

  'sale.payLegend': ['TO‘LOV', 'PAYMENT'],
  'sale.pay.cash.title': ['Naqd', 'Cash'],
  'sale.pay.cash.desc': ['Hozir to‘laydi', 'Pays now'],
  'sale.pay.debt.title': ['Qarz', 'Credit'],
  'sale.pay.debt.desc': ['Keyin to‘laydi', 'Pays later'],
  'sale.usdReceived': ['Qabul qilingan USD', 'USD received'],
  'sale.allCash': [
    'Jami summa ({total} so‘m) to‘liq naqd sifatida yoziladi.',
    'The full amount ({total} UZS) is recorded as cash.',
  ],
  'sale.overPaid': [
    ' — jami summadan ({total}) oshib ketdi!',
    ' — exceeds the total ({total})!',
  ],
  'sale.remainingDebt': [
    ' · qolgan QARZ: {debt} so‘m',
    ' · remaining debt: {debt} UZS',
  ],
  'sale.coversAll': [' · to‘liq qoplaydi', ' · covers it fully'],
  'sale.submit': ['Savdoni saqlash', 'Save sale'],
  'sale.saved': ['Savdo saqlandi — {total} so‘m.', 'Sale saved — {total} UZS.'],
  'sale.fullDebt': [' To‘liq QARZ: {total} so‘m.', ' Fully on credit: {total} UZS.'],
  'sale.partialPaid': [
    ' Qisman to‘landi, qarz: {debt} so‘m.',
    ' Partially paid, debt: {debt} UZS.',
  ],
  'sale.fullyPaid': [' To‘liq to‘landi.', ' Paid in full.'],

  'sale.panelTitle': ['Tizim avtomatik hisoblaydi', 'Calculated automatically'],
  'sale.volPerPiece': ['Bir dona hajmi', 'Volume per piece'],
  'sale.totalVol': ['Jami hajm', 'Total volume'],
  'sale.totalVolQty': ['Jami hajm ({n} dona)', 'Total volume ({n} pcs)'],
  'sale.deducted': ['Ombordan yechiladi', 'Deducted from stock'],
  'sale.piecesSold': ['Sotiladigan dona', 'Pieces sold'],
  'sale.piecesLeft': ['Qolgan dona', 'Pieces left'],
  'sale.volLeft': ['Qolgan qoldiq', 'Volume left'],
  'sale.exceedsPieces': [
    '⚠ Omborda dona yetarli emas! Qoldiq: {qty} dona',
    '⚠ Not enough pieces in stock! {qty} remaining',
  ],
  'sale.exceedsVol': [
    '⚠ Omborda yetarli emas! Lot qoldig‘i: {vol} m³',
    '⚠ Not enough stock! The lot has {vol} m³ left',
  ],
  'sale.grandTotal': ['JAMI SAVDO', 'SALE TOTAL'],
  'sale.allDebtNote': ['📝 To‘liq qarzga yoziladi', '📝 Recorded entirely on credit'],
  'sale.cashNote': ['💵 Naqd: {amount} so‘m', '💵 Cash: {amount} UZS'],
  'sale.cashDebtNote': [' · qarz: {debt}', ' · debt: {debt}'],
  'sale.footnote': [
    'Narx doim so‘mda qoladi — USD faqat to‘lov sifatida, kurs bilan so‘mga aylantiriladi.',
    'Prices always stay in UZS — USD is only a payment method, converted at the given rate.',
  ],

  'sale.recent': ['So‘nggi savdolar', 'Recent sales'],
  'sale.empty': ['Hozircha savdo yo‘q.', 'No sales yet.'],
  'sale.col.date': ['SANA', 'DATE'],
  'sale.col.type': ['TURI', 'TYPE'],
  'sale.col.volQty': ['HAJM/DONA', 'VOLUME/PCS'],
  'sale.col.amount': ['SUMMA', 'AMOUNT'],
  'sale.col.status': ['HOLAT', 'STATUS'],
  'sale.debtBadge': ['Qarz {amount}', 'Debt {amount}'],
} as const satisfies Record<string, Msg>;
