import interfaceCopy from "./dictionaries/interface.json";

/** Authored interface copy only: never translate patient data or model responses. */
export function translateInterface(text: string, language: "en" | "hi" | "te"): string {
  const copy = (interfaceCopy as Record<string, string[]>)[text];
  const translated = language === "en" || !copy ? text : copy[language === "hi" ? 0 : 1];
  return translated.replace(/&bull;/g, "•").replace(/&rarr;/g, "→").replace(/&ndash;/g, "–").replace(/&ldquo;/g, "“").replace(/&rdquo;/g, "”");
}
