"use client";

import React, { useState } from "react";
import { PhoneCall, Mail, MessageSquare, ShieldAlert, HeartHandshake, Accessibility, Headphones, CheckCircle2 } from "lucide-react";
import { MedButton } from "@/components/ui/med-button";

const PATHWAYS = [
  {
    icon: <Headphones className="w-5 h-5 text-[#0F766E]" />,
    title: "General Support",
    desc: "Help with asking health questions, voice input, or using MedGuide.",
  },
  {
    icon: <Mail className="w-5 h-5 text-sky-600" />,
    title: "Technical Support",
    desc: "Report app loading issues, bug reports, or audio recording problems.",
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
    title: "Healthcare Feedback",
    desc: "Provide feedback on medical clarity, citations, or guidance quality.",
  },
  {
    icon: <Accessibility className="w-5 h-5 text-amber-600" />,
    title: "Accessibility Assistance",
    desc: "Help for low digital-literacy, screen-readers, or local language support.",
  },
  {
    icon: <HeartHandshake className="w-5 h-5 text-[#0F766E]" />,
    title: "Community Partnerships",
    desc: "For ASHA workers, PHC staff, NGOs, and rural health organizations.",
  },
  {
    icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
    title: "Report a Safety Concern",
    desc: "Direct escalation path to report incorrect information or safety issues.",
  },
];

export const ContactSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    pathway: "General Support",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="section-gap bg-slate-50/50 border-b border-[#161A24]/10">
      <div className="section-container">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest text-[#0F766E] uppercase bg-teal-50 border border-teal-200/80">
            <Headphones className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>SUPPORT & CONTACT</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#161A24]">
            How can we help you today?
          </h1>

          <p className="text-base text-slate-600 max-w-xl mx-auto">
            Reach out for patient support, rural accessibility guidance, healthcare feedback, or community partnerships.
          </p>
        </div>

        {/* Prominent Rural Assistance Callout Banner */}
        <div className="max-w-4xl mx-auto mb-16 p-6 sm:p-8 rounded-3xl bg-[#1C1917] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200 bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
              Need help using MedGuide?
            </span>
            <h2 className="font-serif text-2xl text-white">
              Speak directly with our support team
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg">
              We offer free phone support, WhatsApp assistance, and native language help for rural users.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="tel:18006334843"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#1C1917] font-bold text-xs shadow-sm hover:bg-stone-100 transition-colors"
            >
              <PhoneCall className="w-4 h-4" /> Call 1800-MEDGUIDE
            </a>

            <a
              href="mailto:support@medguide.ai"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-stone-800 text-white font-bold text-xs border border-stone-700 hover:bg-stone-700 transition-colors"
            >
              <Mail className="w-4 h-4 text-amber-200" /> Email Support
            </a>
          </div>
        </div>

        {/* 6 Contact Pathways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {PATHWAYS.map((p) => (
            <div
              key={p.title}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 hover:border-stone-400 hover:shadow-card transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                {p.icon}
              </div>
              <h3 className="font-semibold text-base text-[#161A24]">{p.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Interactive Support Form */}
        <div className="max-w-2xl mx-auto bg-white border border-[#161A24]/10 rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="text-center space-y-2 mb-8">
            <h2 className="font-serif text-2xl text-[#161A24]">Send a message</h2>
            <p className="text-xs text-slate-500">
              Fill out this form and our support team will respond within 24 hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center bg-amber-50 rounded-2xl border border-amber-200 text-[#8C6D46] space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[#0F766E]" />
              <div className="font-serif text-xl font-bold">Message Received!</div>
              <p className="text-xs leading-relaxed text-slate-700">
                Thank you for reaching out to MedGuide AI. Our team will review your query and respond shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-pill btn-pill-secondary text-xs px-4 py-2 min-h-[38px] mt-2"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number or Email
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="e.g. +91 98765 43210 or name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Topic / Category
                </label>
                <select
                  value={formData.pathway}
                  onChange={(e) => setFormData({ ...formData, pathway: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                >
                  {PATHWAYS.map((p) => (
                    <option key={p.title} value={p.title}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <MedButton variant="primary" size="lg" className="w-full justify-center">
                Submit Message
              </MedButton>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
