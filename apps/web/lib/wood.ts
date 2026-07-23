/**
 * Yog'och hajm hisobi.
 *  - Taxta (kub): V = uzunlik × en × qalinlik  (hammasi metrda)
 *  - Yumaloq yog'och (kesik konus): bosh yo'g'on (D), uch ingichka (d)
 *      V = (π × L / 12) × (D² + D·d + d²)   — D,d metrda
 */

/** Bitta yumaloq yog'och hajmi (m³). Diametrlar sm, uzunlik m. */
export function roundLogVolumeM3(
  baseCm: number,
  topCm: number,
  lengthM: number,
): number {
  const D = baseCm / 100;
  const d = topCm / 100;
  const L = lengthM;
  if (!(D > 0) || !(d > 0) || !(L > 0)) return 0;
  return (Math.PI * L * (D * D + D * d + d * d)) / 12;
}
