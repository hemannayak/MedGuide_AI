import { ConnectedPage } from "@/components/marketing/experience/connected-pages";
import { marketingMetadata } from "@/lib/seo";
import { informationTitles } from "@/components/marketing/editorial/information-page";
export const metadata=marketingMetadata(informationTitles["faq"][0],informationTitles["faq"][1],"/faq");
export default function Page() { return <ConnectedPage kind="faq" />; }
