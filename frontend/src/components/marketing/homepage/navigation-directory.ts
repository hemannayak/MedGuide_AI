/** Public destinations and existing protected entry points; never direct API links. */
export const navigationDirectory = [
  { title: "Products", links: [
    ["Ask MedGuide", "/app/chat"], ["Symptom Check", "/app/symptoms"],
    ["Prescription OCR", "/app/prescriptions"], ["Health Dashboard", "/app/dashboard"],
    ["Medication support", "/app/medications"], ["Healthcare-worker approach", "/product#healthcare-workers"],
    ["Emergency information", "/app/emergency"],
  ] },
  { title: "Technology", links: [
    ["System architecture", "/technology#architecture"], ["RAG & vector search", "/technology#architecture"],
    ["APIs & models", "/technology#apis-models"], ["API service map", "/technology#service-map"],
    ["Speech to text", "/languages"], ["Text to speech", "/languages"],
    ["Document processing", "/product#solution"],
  ] },
  { title: "Resources", links: [
    ["How it works", "/how-it-works"], ["Medical sources", "/research#sources"],
    ["Clinical safety approach", "/safety"], ["FAQs", "/faq"], ["Accessibility", "/accessibility"],
  ] },
  { title: "Company", links: [
    ["About MedGuide", "/about"], ["Research & methodology", "/research#methodology"],
    ["Contact & feedback", "/contact"],
  ] },
  { title: "Legal & Safety", links: [
    ["Medical disclaimer", "/legal/disclaimer"], ["Privacy", "/privacy"],
    ["Terms", "/terms"], ["AI safety", "/safety"],
  ] },
] as const;
