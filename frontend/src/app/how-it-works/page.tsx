import { ConnectedPage } from "@/components/marketing/experience/connected-pages";
import { marketingMetadata } from "@/lib/seo";
export const metadata=marketingMetadata("How it works","Follow the Ask, Understand, Guide, Act journey through MedGuide.","/how-it-works");
export default function Page() { return <ConnectedPage kind="how-it-works" />; }
