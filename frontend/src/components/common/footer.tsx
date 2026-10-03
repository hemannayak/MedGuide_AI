"use client";
import { usePathname } from "next/navigation";
import { usesReferenceMarketingLayout } from "@/components/marketing/homepage/marketing-routes";
import { MarketingFooter } from "@/components/marketing/homepage/marketing-footer";
export function Footer(){const pathname=usePathname();return (usesReferenceMarketingLayout(pathname)||pathname.startsWith("/app"))?null:<MarketingFooter/>;}
