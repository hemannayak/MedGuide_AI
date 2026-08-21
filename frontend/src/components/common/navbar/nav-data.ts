import {
  MessageSquareHeart,
  Activity,
  FileText,
  LayoutDashboard,
  Mic,
  Globe2,
  BookOpenCheck,
  ShieldAlert,
  ShieldCheck,
  Eye,
  LockKeyhole,
  FileSpreadsheet,
  BookOpen,
  HelpCircle,
  HelpCircle as HowToIcon,
  Accessibility,
  Code2,
  PhoneCall,
  Languages as LanguagesIcon,
  Users,
} from "lucide-react";
import React from "react";

export interface NavLinkItem {
  id: string;
  title: string;
  description?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
  stepNumber?: string;
  iconBg: string;
  iconColor: string;
}

export interface NavSection {
  title: string;
  items: NavLinkItem[];
}

export interface FeaturedCardData {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  type: "how-it-works" | "safety" | "languages" | "faq" | "about";
  bgGradient: string;
}

export interface NavItemData {
  id: string;
  label: string;
  sections: NavSection[];
  featured: FeaturedCardData;
}

export const NAV_ITEMS: NavItemData[] = [
  {
    id: "how-it-works",
    label: "HOW IT WORKS",
    sections: [
      {
        title: "PRODUCTS & CARE JOURNEY",
        items: [
          {
            id: "ask-medguide",
            title: "Ask MedGuide",
            description: "Conversational voice & text health companion",
            href: "/app/chat",
            icon: MessageSquareHeart,
            iconBg: "bg-orange-50 border-orange-100",
            iconColor: "text-orange-500",
          },
          {
            id: "symptom-check",
            title: "Symptom Check",
            description: "Understand symptoms & identify triage urgency",
            href: "/app/symptoms",
            icon: Activity,
            iconBg: "bg-purple-50 border-purple-100",
            iconColor: "text-purple-600",
          },
          {
            id: "prescription-ocr",
            title: "Prescription OCR",
            description: "Extract & translate medication details from photos",
            href: "/app/chat",
            icon: FileText,
            iconBg: "bg-rose-50 border-rose-100",
            iconColor: "text-rose-500",
          },
          {
            id: "health-dashboard",
            title: "Health Dashboard",
            description: "View recent health interactions & care history",
            href: "/app/dashboard",
            icon: LayoutDashboard,
            iconBg: "bg-emerald-50 border-emerald-100",
            iconColor: "text-emerald-600",
          },
        ],
      },
      {
        title: "THE 4-STEP WORKFLOW",
        items: [
          {
            id: "step-1",
            stepNumber: "01",
            title: "ASK",
            description: "Speak or type your health question naturally in your language.",
            href: "/how-it-works",
            icon: Mic,
            iconBg: "bg-orange-50 border-orange-100",
            iconColor: "text-orange-600",
          },
          {
            id: "step-2",
            stepNumber: "02",
            title: "UNDERSTAND",
            description: "MedGuide interprets symptom context & checks clinical guidelines.",
            href: "/how-it-works",
            icon: Activity,
            iconBg: "bg-purple-50 border-purple-100",
            iconColor: "text-purple-600",
          },
          {
            id: "step-3",
            stepNumber: "03",
            title: "GUIDE",
            description: "Receive clear, source-backed guidance with evidence citations.",
            href: "/how-it-works",
            icon: BookOpenCheck,
            iconBg: "bg-emerald-50 border-emerald-100",
            iconColor: "text-emerald-600",
          },
          {
            id: "step-4",
            stepNumber: "04",
            title: "ACT",
            description: "Know when to monitor at home, visit a clinic, or seek urgent care.",
            href: "/how-it-works",
            icon: PhoneCall,
            iconBg: "bg-red-50 border-red-100",
            iconColor: "text-red-600",
          },
        ],
      },
    ],
    featured: {
      type: "how-it-works",
      title: "From Question to Next Step",
      subtitle: "Structured Care Flow",
      description: "A clear 4-step workflow bridging voice input, WHO retrieval, and triage escalation.",
      ctaText: "Explore How It Works",
      ctaHref: "/how-it-works",
      bgGradient: "from-amber-500 via-orange-500 to-rose-500",
    },
  },
  {
    id: "safety",
    label: "SAFETY",
    sections: [
      {
        title: "CLINICAL SAFETY",
        items: [
          {
            id: "safety-first",
            title: "Safety-First Guidance",
            description: "Engineered to eliminate overconfident or fabricated medical claims",
            href: "/safety",
            icon: ShieldCheck,
            iconBg: "bg-emerald-50 border-emerald-100",
            iconColor: "text-emerald-600",
          },
          {
            id: "red-flag",
            title: "Red-Flag Detection",
            description: "Deterministic rules identify critical symptoms instantly",
            href: "/safety",
            icon: ShieldAlert,
            iconBg: "bg-red-50 border-red-100",
            iconColor: "text-red-600",
          },
          {
            id: "emergency-escalation",
            title: "Emergency Escalation",
            description: "Direct dial pathways to national 108 / 112 emergency response",
            href: "/app/emergency",
            icon: PhoneCall,
            iconBg: "bg-rose-50 border-rose-100",
            iconColor: "text-rose-600",
          },
        ],
      },
      {
        title: "TRUST & PRIVACY",
        items: [
          {
            id: "trusted-sources",
            title: "Trusted Medical Sources",
            description: "Grounding in WHO, NHM, & ICMR primary healthcare guidelines",
            href: "/safety",
            icon: BookOpenCheck,
            iconBg: "bg-amber-50 border-amber-100",
            iconColor: "text-amber-600",
          },
          {
            id: "evidence-visibility",
            title: "Evidence Visibility",
            description: "Inspect source documents and confidence scoring transparently",
            href: "/safety",
            icon: Eye,
            iconBg: "bg-blue-50 border-blue-100",
            iconColor: "text-blue-600",
          },
          {
            id: "privacy-protection",
            title: "Privacy Protection",
            description: "Strict data minimization with no exposure of sensitive records",
            href: "/legal/privacy",
            icon: LockKeyhole,
            iconBg: "bg-purple-50 border-purple-100",
            iconColor: "text-purple-600",
          },
          {
            id: "medical-disclaimer",
            title: "Medical Disclaimer",
            description: "Clear boundaries — supporting healthcare workers, not replacing doctors",
            href: "/legal/disclaimer",
            icon: FileSpreadsheet,
            iconBg: "bg-slate-100 border-slate-200",
            iconColor: "text-slate-700",
          },
        ],
      },
    ],
    featured: {
      type: "safety",
      title: "Safety & Boundaries",
      subtitle: "Grounded Intelligence",
      description: "Deterministic triage rules, WHO corpus grounding, and zero ungrounded medical claims.",
      ctaText: "Safety Architecture",
      ctaHref: "/safety",
      bgGradient: "from-teal-600 via-emerald-600 to-cyan-700",
    },
  },
  {
    id: "languages",
    label: "LANGUAGES",
    sections: [
      {
        title: "SUPPORTED LANGUAGES",
        items: [
          {
            id: "lang-en",
            title: "English",
            description: "Clear, accessible primary health guidance in English",
            href: "/languages",
            icon: Globe2,
            tag: "EN",
            iconBg: "bg-blue-50 border-blue-100",
            iconColor: "text-blue-600",
          },
          {
            id: "lang-hi",
            title: "हिंदी (Hindi)",
            description: "हिंदी में सहज और भरोसेमंद स्वास्थ्य जानकारी और मार्गदर्शन",
            href: "/languages",
            icon: Globe2,
            tag: "HI",
            iconBg: "bg-orange-50 border-orange-100",
            iconColor: "text-orange-600",
          },
          {
            id: "lang-te",
            title: "తెలుగు (Telugu)",
            description: "తెలుగులో పూర్తి ఆరోగ్య సమాచారం మరియు మార్గదర్శకత్వం",
            href: "/languages",
            icon: Globe2,
            tag: "TE",
            iconBg: "bg-purple-50 border-purple-100",
            iconColor: "text-purple-600",
          },
        ],
      },
      {
        title: "ACCESSIBILITY",
        items: [
          {
            id: "voice-access",
            title: "Voice-First Interaction",
            description: "Speak naturally without needing to type or navigate complex forms",
            href: "/how-it-works",
            icon: Mic,
            iconBg: "bg-indigo-50 border-indigo-100",
            iconColor: "text-indigo-600",
          },
          {
            id: "audio-playback",
            title: "Native TTS Playback",
            description: "Listen to spoken guidance synthesized in clear regional accents",
            href: "/how-it-works",
            icon: LanguagesIcon,
            iconBg: "bg-teal-50 border-teal-100",
            iconColor: "text-teal-600",
          },
        ],
      },
    ],
    featured: {
      type: "languages",
      title: "Your Language",
      subtitle: "Voice & Speech AI",
      description: "Breaking literacy barriers with high-accuracy speech synthesis in native scripts.",
      ctaText: "Speech Technology",
      ctaHref: "/languages",
      bgGradient: "from-purple-600 via-indigo-600 to-blue-700",
    },
  },
  {
    id: "faq",
    label: "FAQS",
    sections: [
      {
        title: "FREQUENTLY ASKED QUESTIONS",
        items: [
          {
            id: "health-faq",
            title: "Health & Safety FAQ",
            description: "Answers to common questions about MedGuide AI capabilities",
            href: "/faq",
            icon: HelpCircle,
            iconBg: "bg-blue-50 border-blue-100",
            iconColor: "text-blue-600",
          },
          {
            id: "how-to-use",
            title: "How to Use MedGuide",
            description: "Beginner-friendly guide for patients and family caregivers",
            href: "/how-it-works",
            icon: HowToIcon,
            iconBg: "bg-emerald-50 border-emerald-100",
            iconColor: "text-emerald-600",
          },
          {
            id: "accessibility-std",
            title: "Accessibility Standards",
            description: "Voice-first design principles for low-literacy users",
            href: "/accessibility",
            icon: Accessibility,
            iconBg: "bg-orange-50 border-orange-100",
            iconColor: "text-orange-600",
          },
        ],
      },
      {
        title: "PATIENT & CARE GIVERS",
        items: [
          {
            id: "sys-architecture",
            title: "System Architecture",
            description: "RAG vector search, pgvector, and Safety Pipeline technical design",
            href: "/admin/activity",
            icon: Code2,
            iconBg: "bg-purple-50 border-purple-100",
            iconColor: "text-purple-600",
          },
        ],
      },
    ],
    featured: {
      type: "faq",
      title: "Common Questions",
      subtitle: "Help & FAQ Directory",
      description: "Find clear answers to common questions regarding medical grounding, safety, and privacy.",
      ctaText: "View FAQ Directory",
      ctaHref: "/faq",
      bgGradient: "from-blue-600 via-indigo-600 to-purple-700",
    },
  },
  {
    id: "about",
    label: "ABOUT",
    sections: [
      {
        title: "ABOUT MEDGUIDE AI",
        items: [
          {
            id: "about-mission",
            title: "About MedGuide AI",
            description: "Our student-led research mission for rural healthcare access",
            href: "/about",
            icon: Users,
            iconBg: "bg-indigo-50 border-indigo-100",
            iconColor: "text-indigo-600",
          },
          {
            id: "contact-support",
            title: "Contact & Feedback",
            description: "Get in touch with the development and research team",
            href: "/contact",
            icon: BookOpen,
            iconBg: "bg-rose-50 border-rose-100",
            iconColor: "text-rose-600",
          },
        ],
      },
    ],
    featured: {
      type: "about",
      title: "Our Mission",
      subtitle: "Rural Healthcare Intelligence",
      description: "Built to empower patients and authorized healthcare workers in underserved communities.",
      ctaText: "Learn About Us",
      ctaHref: "/about",
      bgGradient: "from-slate-800 via-slate-900 to-[#121927]",
    },
  },
];
