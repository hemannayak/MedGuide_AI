import { InformationPage, informationTitles } from "@/components/marketing/editorial/information-page";
import { marketingMetadata } from "@/lib/seo";
export const metadata=marketingMetadata(informationTitles["privacy"][0],informationTitles["privacy"][1],"/privacy");
export default function Page(){return <InformationPage kind="privacy"/>;}
