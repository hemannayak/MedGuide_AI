import { InformationPage, informationTitles } from "@/components/marketing/editorial/information-page";
import { marketingMetadata } from "@/lib/seo";
export const metadata=marketingMetadata(informationTitles["disclaimer"][0],informationTitles["disclaimer"][1],"/legal/disclaimer");
export default function Page(){return <InformationPage kind="disclaimer"/>;}
