"use client";
import { usePathname } from "next/navigation";
import { usesReferenceMarketingLayout } from "@/components/marketing/homepage/marketing-routes";
import { MarketingFooter } from "@/components/marketing/homepage/marketing-footer";
export function Footer(){const pathname=usePathname();return (pathname==="/start"||usesReferenceMarketingLayout(pathname)||pathname.startsWith("/app")||pathname==="/hcw"||pathname.startsWith("/hcw/"))?null:<MarketingFooter/>;}
