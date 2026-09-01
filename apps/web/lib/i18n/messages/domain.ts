import { Msg } from '../types';

/**
 * Domen atamalari: yog'och manbalari, savdo turlari, valyuta, o'lchov
 * birliklari va shunga o'xshash takrorlanuvchi enum yorliqlari.
 */
export const domain = {
  // Lot manbasi
  'src.RUSSIA_IMPORT': ['Rossiya importi', 'Russian import'],
  'src.LOCAL': ['Mahalliy', 'Local'],
  'src.INTERNAL_TRANSFER': ['Ichki transfer', 'Internal transfer'],
  'src.PRODUCTION': ['Ishlab chiqarish', 'Production'],

  // Savdo turi
  'saleType.RAW': ['Xomashyo', 'Raw timber'],
  'saleType.FINISHED': ['Tayyor mahsulot', 'Finished goods'],
  'saleType.RAW_WOOD': ['Xomashyo', 'Raw timber'],
  'saleType.FINISHED_GOODS': ['Tayyor mahsulot', 'Finished goods'],

  // Umumiy domen atamalari
  'term.woodType': ['Yog‘och turi', 'Timber type'],
  'term.grade': ['Nav', 'Grade'],
  'term.source': ['Manba', 'Source'],
  'term.volume': ['Hajm', 'Volume'],
  'term.remaining': ['Qoldiq', 'Remaining'],
  'term.unitCost': ['Tannarx', 'Unit cost'],
  'term.cost': ['Tannarx', 'Cost'],
  'term.revenue': ['Tushum', 'Revenue'],
  'term.profit': ['Foyda', 'Profit'],
  'term.netProfit': ['Sof foyda', 'Net profit'],
  'term.debt': ['Qarz', 'Debt'],
  'term.paid': ['To‘landi', 'Paid'],
  'term.customer': ['Mijoz', 'Customer'],
  'term.supplier': ['Yetkazib beruvchi', 'Supplier'],
  'term.shipment': ['Fura', 'Shipment'],
  'term.lot': ['Lot', 'Lot'],
  'term.product': ['Mahsulot', 'Product'],
  'term.rate': ['Kurs', 'Rate'],
  'term.length': ['Uzunlik', 'Length'],
  'term.width': ['En', 'Width'],
  'term.thickness': ['Qalinlik', 'Thickness'],
  'term.diameterBase': ['Bosh diametr', 'Butt diameter'],
  'term.diameterTop': ['Uch diametr', 'Top diameter'],
  'term.defect': ['Nuqson', 'Defect'],
  'term.yield': ['Chiqim (yield)', 'Yield'],
} as const satisfies Record<string, Msg>;
