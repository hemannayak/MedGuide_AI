import { InformationPage, informationTitles } from "@/components/marketing/editorial/information-page";
import { marketingMetadata } from "@/lib/seo";
export const metadata=marketingMetadata(informationTitles["contact"][0],informationTitles["contact"][1],"/contact");
export default function Page(){return <InformationPage kind="contact"/>;}
