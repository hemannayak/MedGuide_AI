import Link from "next/link";
export function FeatureAvailability({ title, description }: {
    title: string;
    description: string;
}) { return <section className="max-w-3xl mx-auto px-6 py-16 text-[#073d37]"><p className="text-xs uppercase tracking-widest mb-5">MedGuide · Feature availability</p><h1 className="text-4xl font-serif mb-6">{title}</h1><p className="leading-8 mb-8">{description}</p><p className="leading-7 mb-8">This feature is not connected in the current web version. No document processing or history retrieval takes place on this page.</p><div className="flex flex-wrap gap-5"><Link className="min-h-[44px] underline" href="/app/medications">Medication overview</Link><Link className="min-h-[44px] underline" href="/product#solution">Explore the document preview</Link><Link className="min-h-[44px] underline" href="/app/dashboard">Back to dashboard</Link></div></section>; }
