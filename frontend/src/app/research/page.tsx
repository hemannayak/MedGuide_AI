import { MarketingPage } from "@/components/marketing/pages/marketing-page";
import { marketingMetadata } from "@/lib/seo";
export const metadata=marketingMetadata("Research","Review MedGuide methodology, source provenance, evaluation plans, and research limitations.","/research");
export default function Page(){return <MarketingPage kind="research"/>;}
