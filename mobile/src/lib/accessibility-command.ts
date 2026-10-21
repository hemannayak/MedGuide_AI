/** Explicit recorded commands only. Never sends navigation commands as medical questions. */
export function isGuidanceCommand(text: string): boolean {
  const normalized = text.normalize('NFKC').toLowerCase().replace(/[.!?,।]/g, '').replace(/\s+/g, ' ').trim();
  return ['medguide help', 'med guide help', 'मेडगाइड मदद', 'మెడ్‌గైడ్ సహాయం'].includes(normalized);
}
