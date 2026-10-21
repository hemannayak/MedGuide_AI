/** Storage uses integer ml; display uses litres without inventing a target. */
export function formatLitres(ml: number): string {
  return `${Number((ml / 1000).toFixed(3))} L`;
}
export function hydrationLabel(ml: number, target: number | null): string {
  return `${formatLitres(ml)} / ${target ? formatLitres(target) : 'set target'}`;
}
export function litresToMl(value: string): number {
  if (!/^\d+(\.\d{1,3})?$/.test(value.trim())) throw new Error('Use litres with up to three decimal places.');
  const ml = Math.round(Number(value) * 1000);
  if (ml < 1 || ml > 20000) throw new Error('The storage limit is 0.001–20 L. This is not a recommended intake.');
  return ml;
}
export function liveStepTotal(manual: number, savedForeground: number, session: number, savedSession: number) {
  return manual + savedForeground + Math.max(0, session - savedSession);
}
