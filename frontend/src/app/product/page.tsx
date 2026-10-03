import { MarketingPage } from "@/components/marketing/pages/marketing-page";
import { marketingMetadata } from "@/lib/seo";
export const metadata=marketingMetadata("Product","Explore symptom input, the health companion, prescription review, and continuity of care.","/product");
export default function Page(){return <MarketingPage kind="product"/>;}
