import { Msg } from '../types';

/** Dashboard va tayyor mahsulot ombori sahifalari. */
export const pages = {
  // Dashboard
  'dash.error': [
    'Xato: {msg}. Backend ishlayaptimi (port 4010)?',
    'Error: {msg}. Is the backend running (port 4010)?',
  ],
  'dash.kpi.today': ['BUGUNGI SAVDO', 'TODAY’S SALES'],
  'dash.kpi.total': ['JAMI SAVDO', 'TOTAL SALES'],
  'dash.kpi.stock': ['OMBOR QOLDIG‘I', 'STOCK ON HAND'],
  'dash.kpi.debt': ['QARZLAR', 'RECEIVABLES'],
  'dash.debtors': ['{n} mijoz', '{n} customers'],
  'dash.recentSales': ['So‘nggi savdolar', 'Recent sales'],
  'dash.noSales': ['Hozircha savdo yo‘q.', 'No sales yet.'],
  'dash.debtBadge': ['Qarz {amount}', 'Debt {amount}'],
  'dash.inventory': ['Ombor (lotlar)', 'Inventory (lots)'],
  'dash.emptyStock': ['Ombor bo‘sh.', 'The warehouse is empty.'],

  // Tayyor mahsulot ombori
  'fg.title': ['Tayyor mahsulot ombori', 'Finished goods warehouse'],
  'fg.totalPieces': ['JAMI MAHSULOT', 'TOTAL GOODS'],
  'fg.totalValue': ['OMBOR QIYMATI', 'STOCK VALUE'],
  'fg.atCost': ['so‘m (tannarxda)', 'UZS (at cost)'],
  'fg.empty': [
    'Tayyor mahsulot yo‘q — «Ishlab chiqarish» bo‘limida partiya yarating.',
    'No finished goods yet — create a batch under “Production”.',
  ],
  'fg.col.product': ['MAHSULOT', 'PRODUCT'],
  'fg.col.date': ['SANA', 'DATE'],
  'fg.col.remaining': ['QOLDIQ', 'REMAINING'],
  'fg.col.unitCost': ['TANNARX / DONA', 'COST / PIECE'],
  'fg.col.totalValue': ['JAMI QIYMAT', 'TOTAL VALUE'],
} as const satisfies Record<string, Msg>;

/** Mijozlar va konsolidatsiya sahifalari. */
export const pages2 = {
  // Mijozlar
  'cust.title': ['Mijozlar', 'Customers'],
  'cust.all': ['Barcha mijozlar ({n})', 'All customers ({n})'],
  'cust.totalDebt': ['Jami qarz: {amount} so‘m', 'Total debt: {amount} UZS'],
  'cust.empty': ['Hozircha mijoz yo‘q.', 'No customers yet.'],
  'cust.col.customer': ['MIJOZ', 'CUSTOMER'],
  'cust.col.phone': ['TELEFON', 'PHONE'],
  'cust.col.sales': ['SAVDOLAR', 'SALES'],
  'cust.col.debt': ['QARZ BALANSI', 'DEBT BALANCE'],
  'cust.noDebt': ['Qarz yo‘q', 'No debt'],
  'cust.new': ['+ Yangi mijoz', '+ New customer'],
  'cust.name': ['Ism', 'Name'],
  'cust.namePh': ['Alisher Karimov', 'Alisher Karimov'],
  'cust.added': ['Mijoz «{name}» qo‘shildi.', 'Customer “{name}” has been added.'],
  'cust.submit': ['Mijoz qo‘shish', 'Add customer'],

  // Konsolidatsiya
  'cons.title': ['Konsolidatsiya', 'Consolidation'],
  'cons.sub': [
    'Ikkala biznes birga — faqat egaga ko‘rinadi.',
    'Both businesses combined — visible to the owner only.',
  ],
  'cons.totalSales': ['JAMI SAVDO', 'TOTAL SALES'],
  'cons.totalExpenses': ['JAMI XARAJAT', 'TOTAL EXPENSES'],
  'cons.totalNet': ['JAMI SOF FOYDA', 'TOTAL NET PROFIT'],
  'cons.woodTag': ['yog‘och savdosi', 'timber trading'],
  'cons.lumberTag': ['taxta ishlab chiqarish', 'lumber production'],
  'cons.salesRevenue': ['Savdo tushumi', 'Sales revenue'],
  'cons.transferIn': ['Ichki transfer daromadi', 'Internal transfer income'],
  'cons.soldCost': ['Sotilgan tannarx', 'Cost of goods sold'],
  'cons.expenses': [
    'Xarajatlar (umumiy ulush bilan)',
    'Expenses (incl. shared allocation)',
  ],
  'cons.net': ['Sof foyda', 'Net profit'],
  'cons.footnote': [
    'Umumiy (ikkala biznesga tegishli) xarajatlar teng taqsimlanadi. Ichki transfer: 1-biznesga daromad, 2-bizneda xomashyo tannarxiga aylanadi — pul ikki marta sanalmaydi.',
    'Shared expenses (belonging to both businesses) are split evenly. An internal transfer is income for the first business and raw-material cost for the second — money is never counted twice.',
  ],
} as const satisfies Record<string, Msg>;
