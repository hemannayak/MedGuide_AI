import { ConnectedPage } from "@/components/marketing/experience/connected-pages";
import { marketingMetadata } from "@/lib/seo";
import { informationTitles } from "@/components/marketing/editorial/information-page";
export const metadata=marketingMetadata(informationTitles["languages"][0],informationTitles["languages"][1],"/languages");
export default function Page() { return <ConnectedPage kind="languages" />; }
