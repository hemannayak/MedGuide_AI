"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Brand } from "./shared";
import styles from "./premium-navbar.module.css";

// Keep discovery in the header; the footer owns the complete resource directory.
const links = [["Product", "/product"], ["How it works", "/how-it-works"], ["Safety", "/safety"], ["About", "/about"]] as const;

export function PremiumNavbar({ enhanced = false }: { enhanced?: boolean }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const header = useRef<HTMLElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); mobileTrigger.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", close);
    window.addEventListener("pointerdown", outside);
    return () => { window.removeEventListener("keydown", close); window.removeEventListener("pointerdown", outside); };
  }, [open]);
  const dismiss = () => setOpen(false);
  const active = (href: string) => pathname === href;
  const navigation = links.map(([label, href]) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} onClick={dismiss}>{label}</Link>);
  return <header ref={header} className={`${styles.header} ${pathname === "/" ? styles.heroHeader : ""} ${enhanced ? styles.fixed : ""} ${enhanced && scrolled ? styles.scrolled : ""}`}>
    <Link href="/" aria-label="MedGuide AI home" onClick={dismiss} className={styles.brand}><Brand /></Link>
    <nav aria-label="Main navigation" className={styles.desktop}>{navigation}</nav>
    <div className={styles.actions}>
      <Link href="/login" aria-current={active("/login") ? "page" : undefined} className={styles.login} onClick={dismiss}>Sign in</Link>
      <Link href="/login" className={styles.primary} onClick={dismiss}>Try MedGuide<ArrowUpRight size={16} aria-hidden="true" /></Link>
      <button type="button" ref={mobileTrigger} className={styles.menu} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="marketing-navigation" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    </div>
    <AnimatePresence>{open && <motion.nav id="marketing-navigation" aria-label="Mobile navigation" className={styles.mobile} initial={{ opacity: 0, y: reduced ? 0 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}>
      {navigation}
      <div className={styles.mobileActions}><Link href="/register" onClick={dismiss}>Create an account<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    </motion.nav>}</AnimatePresence>
  </header>;
}
