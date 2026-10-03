import { InformationPage, informationTitles } from "@/components/marketing/editorial/information-page";
import { marketingMetadata } from "@/lib/seo";
export const metadata=marketingMetadata(informationTitles["accessibility"][0],informationTitles["accessibility"][1],"/accessibility");
export default function Page(){return <InformationPage kind="accessibility"/>;}
