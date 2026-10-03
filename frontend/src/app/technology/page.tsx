import { MarketingPage } from "@/components/marketing/pages/marketing-page";
import { marketingMetadata } from "@/lib/seo";
export const metadata=marketingMetadata("Technology","Explore source provenance, RAG, pgvector, APIs, and the layered safety design.","/technology");
export default function Page(){return <MarketingPage kind="technology"/>;}
