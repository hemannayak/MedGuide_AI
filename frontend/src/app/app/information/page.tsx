"use client";

import Link from "next/link";
import { Activity, ArrowRight, BookOpen, FileText, Pill, Settings, UserRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import styles from "@/components/workspace/workspace.module.css";

const tools = [
  { href: "/app/guide", label: "Using MedGuide", description: "Help, safety, languages and project information.", Icon: BookOpen },
  { href: "/app/prescriptions", label: "Documents", description: "View the sample document experience.", Icon: FileText },
  { href: "/app/medications", label: "Medications", description: "See sample medication information.", Icon: Pill },
  { href: "/app/symptoms", label: "Describe symptoms", description: "Organize what you have noticed and review the information you provide.", Icon: Activity },
  { href: "/app/profile", label: "Profile", description: "Review your profile →", Icon: UserRound },
  { href: "/app/settings", label: "Preferences", description: "Choose your preferred language.", Icon: Settings },
];

export default function InformationPage() {
  const { tr } = useLanguage();
  return <>
    <div className={`${styles.welcome} ${styles.informationIntro}`}>
      <h1>{tr("My information")}</h1>
      <p>{tr("Choose what you would like to view.")}</p>
    </div>
    <nav className={styles.informationList} aria-label={tr("Your everyday tools")}>
      {tools.map(({ href, label, description, Icon }) => <Link className={styles.informationItem} href={href} key={href}>
        <Icon size={24} aria-hidden="true" />
        <div><h2>{tr(label)}</h2><p>{tr(description)}</p></div>
        <ArrowRight size={20} aria-hidden="true" />
      </Link>)}
    </nav>
  </>;
}
