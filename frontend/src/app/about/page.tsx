import { MarketingPage } from "@/components/marketing/pages/marketing-page";
import { marketingMetadata } from "@/lib/seo";
export const metadata=marketingMetadata("About","A student-led project for understandable healthcare information in rural and underserved communities.","/about");
export default function Page(){return <MarketingPage kind="about"/>;}
