"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Activity, FileText, Pill, Settings, LayoutDashboard, MessageSquare, UserRound, LogOut, Menu, X, ArrowUpRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { EmergencyBanner } from "@/components/common/emergency-banner";
import { clearSession } from "@/lib/auth/session";
import { isMockMode } from "@/lib/api/config";
import { useLanguage, type Language } from "@/lib/i18n/context";
import styles from "./workspace.module.css";
const destinations = [
  {href:"/app/dashboard",label:"Home",Icon:LayoutDashboard},
  {href:"/app/chat",label:"Ask MedGuide",Icon:MessageSquare},
  {href:"/app/symptoms",label:"Symptom input",Icon:Activity},
  {href:"/app/prescriptions",label:"Documents",Icon:FileText},
  {href:"/app/medications",label:"Medications",Icon:Pill},
  {href:"/app/timeline",label:"Health timeline",Icon:Activity},
  {href:"/app/follow-ups",label:"Follow-ups",Icon:Activity},
  {href:"/app/profile",label:"Profile",Icon:UserRound},
  {href:"/app/settings",label:"Preferences",Icon:Settings},
];
const workerDestinations = [
  { href: "/hcw/patients", label: "Authorized patients", Icon: UserRound },
  { href: "/hcw/follow-ups", label: "Follow-ups", Icon: Activity },
];
export function WorkspaceShell({children, mode = "patient"}:{children:ReactNode;mode?:"patient"|"worker"}) {
  const items = mode === "worker" ? workerDestinations : destinations;
  const pathname=usePathname(),router=useRouter();
  const {language,setLanguage,tr}=useLanguage();
  const [collapsed,setCollapsed]=useState(false);
  const [open,setOpen]=useState(false);const trigger=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(!open)return;const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);trigger.current?.focus();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[open]);
  const current=items.find(item=>pathname===item.href||pathname.startsWith(item.href+'/'));
  return <div className={`${styles.workspace} ${collapsed?styles.collapsed:""}`}>
    <a className={styles.skip} href="#workspace-content">Skip to workspace</a>
    {open&&<button className={styles.backdrop} aria-label="Close workspace navigation" onClick={()=>setOpen(false)}/>}
    <aside id="workspace-navigation" className={`${styles.sidebar} ${open?styles.open:''}`} aria-label="Workspace navigation">
      <Link href={mode === "worker" ? "/hcw/patients" : "/app/dashboard"} aria-label="MedGuide AI overview" className={styles.brand} onClick={()=>setOpen(false)}><Image src="/medguide-mark.svg" alt="" width={32} height={32}/><span>MedGuide AI</span></Link>

      <p className={styles.label}>{mode === "worker" ? "HEALTHCARE WORKER WORKSPACE" : "YOUR HEALTH WORKSPACE"}</p>
      <nav>{items.map(({href,label,Icon})=><Link key={href} href={href} aria-label={label} title={collapsed?label:undefined} aria-current={current?.href===href?'page':undefined} onClick={()=>setOpen(false)}><Icon size={19} aria-hidden="true"/><span>{label}</span></Link>)}</nav>
      <div className={styles.sidebarBottom}><Link href="/app/emergency" aria-label="Emergency information" title={collapsed?"Emergency information":undefined}><ArrowUpRight size={18} aria-hidden="true"/><span>Emergency information</span></Link><Link href="/safety">Understand MedGuide’s limits</Link><button className={styles.collapseButton} type="button" aria-label={collapsed?"Expand sidebar":"Collapse sidebar"} aria-expanded={!collapsed} aria-controls="workspace-navigation" onClick={()=>setCollapsed(!collapsed)}>{collapsed?<PanelLeftOpen size={20}/>:<PanelLeftClose size={20}/>}</button><button aria-label="Sign out" title={collapsed?"Sign out":undefined} onClick={()=>{clearSession();router.replace('/login');}}><LogOut size={18} aria-hidden="true"/><span>Sign out</span></button></div>
    </aside>
    <div className={styles.main}>
      <EmergencyBanner withinWorkspace />
      <header className={styles.topbar}><div><button ref={trigger} className={styles.menu} aria-label={open?tr("Close navigation"):tr("Open navigation")} aria-expanded={open} aria-controls="workspace-navigation" onClick={()=>setOpen(!open)}>{open?<X size={22}/>:<Menu size={22}/>}</button><span>{tr(current?.label||"MedGuide workspace")}</span></div><label className={styles.language}>{tr("Language")}<select value={language} onChange={event=>setLanguage(event.target.value as Language)} aria-label={tr("Workspace language preference")}><option value="en">{tr("English")}</option><option value="hi">हिंदी</option><option value="te">తెలుగు</option></select></label></header>
      {isMockMode()&&<details className={styles.preview}><summary>{tr("Demo mode")}<span>{tr("Sample data · Mock services")}</span></summary><p>{tr("This workspace uses synthetic data and simulated responses. No live account verification or clinical assessment takes place. Please use sample information.")}</p></details>}
      <div id="workspace-content" className={styles.content}>{children}</div>
      <nav className={styles.bottomNav} aria-label={tr("Mobile workspace navigation")}>{destinations.map(({href,label,Icon})=><Link key={href} href={href} aria-label={tr(label)} aria-current={current?.href===href?"page":undefined} onClick={()=>setOpen(false)}><Icon size={21} aria-hidden="true"/><span>{tr(label)}</span></Link>)}</nav>
      <p className={styles.boundary}>{tr("MedGuide supports understanding. It does not replace a qualified healthcare professional.")}</p>
    </div>
  </div>;
}
