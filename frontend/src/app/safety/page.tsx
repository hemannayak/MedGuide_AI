import { ConnectedPage } from "@/components/marketing/experience/connected-pages";
import { marketingMetadata } from "@/lib/seo";
import { informationTitles } from "@/components/marketing/editorial/information-page";
export const metadata=marketingMetadata(informationTitles["safety"][0],informationTitles["safety"][1],"/safety");
export default function Page() { return <ConnectedPage kind="safety" />; }
