"use client";
import { useLanguage } from "@/lib/i18n/context";
import { FeatureAvailability } from "@/components/common/feature-availability";
export default function Page(){
 const { tr } = useLanguage();
return <FeatureAvailability title={tr("Prescription documents")} description={tr("Prescription review is part of MedGuide’s approved scope. Extracted medicine details will need verification before they are used.")}/>}
