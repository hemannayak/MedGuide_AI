import { InformationPage, informationTitles } from "@/components/marketing/editorial/information-page";
import { marketingMetadata } from "@/lib/seo";
export const metadata=marketingMetadata(informationTitles["terms"][0],informationTitles["terms"][1],"/terms");
export default function Page(){return <InformationPage kind="terms"/>;}
