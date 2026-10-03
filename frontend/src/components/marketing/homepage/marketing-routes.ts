export const marketingNavigation = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Safety", href: "/safety" },
  { label: "Languages", href: "/languages" },
  { label: "Technology", href: "/technology" },
  { label: "Research", href: "/research" },
  { label: "FAQs", href: "/faq" },
  { label: "About", href: "/about" },
] as const;
export const publicMarketingRoutes = [
  "/",
  "/product",
  "/how-it-works",
  "/technology",
  "/research",
  "/about",
  "/safety",
  "/languages",
  "/faq",
  "/contact",
  "/accessibility",
  "/privacy",
  "/terms",
  "/legal/privacy",
  "/legal/terms",
  "/legal/disclaimer",
];
export function usesReferenceMarketingLayout(pathname: string | null) {
  return !!pathname && [...publicMarketingRoutes, "/login", "/register", "/forgot-password", "/verify-email", "/onboarding"].includes(pathname);
}
