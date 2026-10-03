export type DiscoverableQuestion = { question: string; answer: string; category: string; index: number };
/** Search only the authored questions and answers; preserve their stable accordion IDs. */
export function filterQuestions<T extends DiscoverableQuestion>(items: T[], query: string, category: string): T[] {
  const needle = query.trim().toLocaleLowerCase();
  return items.filter(item => (category === "All" || item.category === category) && `${item.question} ${item.answer}`.toLocaleLowerCase().includes(needle));
}
