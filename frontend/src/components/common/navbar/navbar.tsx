"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, PhoneCall, User } from "lucide-react";
import { NAV_ITEMS, NavItemData } from "./nav-data";
import { NavItem } from "./nav-item";
import { MegaMenu } from "./mega-menu";
import { MobileMenu } from "./mobile-menu";
import { useLanguage, Language } from "@/lib/i18n/context";

export const MegaNavbar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [clickedItemId, setClickedItemId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isAppRoute = pathname?.startsWith("/app");

  // Active Menu ID is hovered item OR clicked item
  const activeMenuId = hoveredItemId || clickedItemId;
  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeMenuId) || null;

  // Mouse Enter: Opens menu immediately on hover
  const handleMouseEnterItem = (id: string) => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    setHoveredItemId(id);
  };

  // Mouse Leave: Closes hover menu after brief delay (unless clicked)
  const handleMouseLeaveWrapper = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setHoveredItemId(null);
    }, 150);
  };

  // Click Item: Locks the menu open & displays the blue border box around the option
  const handleClickItem = (id: string) => {
    if (clickedItemId === id) {
      setClickedItemId(null);
    } else {
      setClickedItemId(id);
      setHoveredItemId(id);
    }
  };

  // Keep menu open when mouse moves inside mega menu dropdown
  const handleMouseEnterDropdown = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
  };

  // Close menu completely on navigation, outside click, or Escape key
  const handleCloseAll = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setHoveredItemId(null);
    setClickedItemId(null);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseAll();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const languagesList: { code: Language; name: string; script: string }[] = [
    { code: "en", name: "English", script: "English" },
    { code: "hi", name: "Hindi", script: "हिंदी" },
    { code: "te", name: "Telugu", script: "తెలుగు" },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // PATIENT APP HEADER (Internal /app/* routes)
  // ──────────────────────────────────────────────────────────────────────────
  if (isAppRoute) {
    return (
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#161A24]/10">
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            <Link href="/app/dashboard" className="flex items-center group">
              <Image
                src="/logo_navbar.png"
                alt="MedGuide Logo"
                width={240}
                height={64}
                className="h-10 sm:h-11 lg:h-12 w-auto object-contain"
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-full border border-slate-200/60 text-xs font-medium">
              <Link
                href="/app/dashboard"
                className={`px-4 py-1.5 rounded-full transition-all ${pathname === "/app/dashboard"
                    ? "bg-white text-[#161A24] shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Dashboard
              </Link>
              <Link
                href="/app/chat"
                className={`px-4 py-1.5 rounded-full transition-all ${pathname === "/app/chat"
                    ? "bg-white text-[#161A24] shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                AI Companion
              </Link>
              <Link
                href="/app/symptoms"
                className={`px-4 py-1.5 rounded-full transition-all ${pathname === "/app/symptoms"
                    ? "bg-white text-[#161A24] shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Symptoms
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/app/emergency"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors shadow-2xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>108 / 112</span>
              </Link>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                aria-label="Select language"
                className="bg-slate-100 border border-slate-200 text-[#161A24] text-xs font-medium rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#161A24] cursor-pointer"
              >
                {languagesList.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.script}
                  </option>
                ))}
              </select>

              <Link
                href="/app/dashboard"
                className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                title="Patient Profile"
              >
                <User className="w-4.5 h-4.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC MARKETING MEGA NAVBAR
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* PAGE BACKDROP BLUR & DIM OVERLAY (Fades in when Mega-Menu opens) */}
      <AnimatePresence>
        {activeMenuId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCloseAll}
            className="fixed inset-0 z-40 bg-slate-900/12 backdrop-blur-[6px] pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* FLOATING TRANSPARENT OUTER WRAPPER (Absolute/Fixed top-0 inset-x-0 w-full z-50 bg-transparent) */}
      <header
        className="absolute top-0 inset-x-0 z-50 w-full pt-4 sm:pt-5 px-4 sm:px-6 pointer-events-none bg-transparent"
        onMouseLeave={handleMouseLeaveWrapper}
      >
        <div className="max-w-[1240px] mx-auto relative pointer-events-auto">
          {/* FLOATING INNER PILL CONTAINER */}
          <div className={`relative ${pathname === "/" ? "bg-[#FFF5EA]/90 border-amber-900/10" : "bg-white/95 border-slate-200/90"} backdrop-blur-xl border rounded-[36px] shadow-sm px-6 sm:px-7 h-16 sm:h-[68px] flex items-center justify-between transition-all`}>
            {/* BRAND LOGO */}
            <Link href="/" onClick={handleCloseAll} className="flex items-center group shrink-0">
              <Image
                src="/logo_navbar.png"
                alt="MedGuide Logo"
                width={240}
                height={64}
                className="h-10 sm:h-11 lg:h-12 w-auto object-contain"
                priority
              />
            </Link>

            {/* CENTRAL NAVIGATION LINKS (Inter font, Uppercase, Wide letter spacing, font-medium) */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2 h-full font-sans">
              {NAV_ITEMS.map((item: NavItemData) => {
                const isHovered = hoveredItemId === item.id;
                const isClicked = clickedItemId === item.id;
                const isActive = activeMenuId === item.id;

                return (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={isActive}
                    isHovered={isHovered}
                    isClicked={isClicked}
                    onMouseEnter={() => handleMouseEnterItem(item.id)}
                    onMouseLeave={() => { }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleClickItem(item.id);
                    }}
                  />
                );
              })}
            </nav>

            {/* RIGHT SIDE ACTIONS (Title Case, Inter Font, No Icons) */}
            <div className="hidden md:flex items-center gap-5 font-sans shrink-0">
              <Link
                href="/login"
                onClick={handleCloseAll}
                className="text-sm font-medium text-slate-700 hover:text-[#161A24] transition-colors"
              >
                Sign in
              </Link>
              <Link href="/app/chat" onClick={handleCloseAll}>
                <button
                  type="button"
                  className="h-11 px-5 sm:px-6 rounded-full bg-[#161A24] hover:bg-slate-900 text-white text-base sm:text-lg italiana-regular font-bold tracking-tight transition-all duration-200 shadow-xs hover:-translate-y-0.5 inline-flex items-center justify-center cursor-pointer"
                >
                  Ask MedGuide
                </button>
              </Link>
            </div>

            {/* MOBILE MENU TOGGLE BUTTON */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-full text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* DESKTOP MEGA-MENU DROPDOWN */}
          <div className="hidden md:block">
            <MegaMenu
              activeItem={activeNavItem}
              onMouseEnter={handleMouseEnterDropdown}
              onMouseLeave={handleMouseLeaveWrapper}
              onLinkClick={handleCloseAll}
            />
          </div>

          {/* MOBILE NAVIGATION SHEET */}
          <div className="block md:hidden">
            <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      </header>
    </>
  );
};
