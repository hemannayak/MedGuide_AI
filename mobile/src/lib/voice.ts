/** Split on word boundaries without changing the order of reply text. */
export function speechSegments(text: string): string[] {
  const segments: string[] = [];
  let rest = text.trim();
  while (rest.length > 1800) {
    let end = rest.lastIndexOf(' ', 1800);
    if (end < 1) end = 1800;
    if (/[\uD800-\uDBFF]/.test(rest[end - 1])) end--;
    segments.push(rest.slice(0, end).trim()); rest = rest.slice(end).trim();
  }
  if (rest) segments.push(rest);
  return segments;
}

export function decodeAudio(base64: string): Uint8Array {
  const binary = atob(base64);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}
