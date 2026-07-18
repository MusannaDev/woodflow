import { Decimal } from 'decimal.js';

/**
 * Fura foydasi (per-shipment P&L) — TOZA funksiya, DB'ni bilmaydi.
 *
 * Formula (System Design §5.3 asosida, aniqlashtirilgan):
 *
 *   sof foyda = savdo tushumi (so'm)
 *             − sotilgan hajm tannarxi        ← butun kirim emas!
 *             − transport − bojxona
 *             − nuqson zarari (nuqson m³ × tannarx/m³)
 *
 * Nega "sotilgan hajm tannarxi": butun kirim tannarxini ayirsak, nuqson
 * zarari ikki marta sanaladi (u ham kirim ichida, ham alohida qatorda).
 * Sotilmagan (omborda yotgan) yog'och esa hali xarajat emas — u aktiv.
 */
export interface ShipmentPnlInput {
  salesUzs: Decimal.Value;        // shu fura lotlaridan sotilgan jami savdo
  soldCostUzs: Decimal.Value;     // sotilgan m³ × tannarx/m³
  transportUzs: Decimal.Value;
  customsUzs: Decimal.Value;
  defectLossUzs: Decimal.Value;   // nuqson m³ × tannarx/m³
}

export interface ShipmentPnlResult {
  salesUzs: Decimal;
  soldCostUzs: Decimal;
  transportUzs: Decimal;
  customsUzs: Decimal;
  defectLossUzs: Decimal;
  netProfitUzs: Decimal;
}

export function shipmentPnl(input: ShipmentPnlInput): ShipmentPnlResult {
  const salesUzs = new Decimal(input.salesUzs);
  const soldCostUzs = new Decimal(input.soldCostUzs);
  const transportUzs = new Decimal(input.transportUzs);
  const customsUzs = new Decimal(input.customsUzs);
  const defectLossUzs = new Decimal(input.defectLossUzs);

  const netProfitUzs = salesUzs
    .minus(soldCostUzs)
    .minus(transportUzs)
    .minus(customsUzs)
    .minus(defectLossUzs)
    .toDecimalPlaces(2);

  return { salesUzs, soldCostUzs, transportUzs, customsUzs, defectLossUzs, netProfitUzs };
}

/** Savdo qatori summasi: PER_PIECE → dona×narx, aks holda m³×narx. */
export function saleLineTotal(params: {
  perPiece: boolean;
  quantity: number;
  volumeM3: Decimal.Value;
  unitPriceUzs: Decimal.Value;
}): Decimal {
  const price = new Decimal(params.unitPriceUzs);
  const total = params.perPiece
    ? price.mul(params.quantity)
    : price.mul(new Decimal(params.volumeM3));
  return total.toDecimalPlaces(2);
}
