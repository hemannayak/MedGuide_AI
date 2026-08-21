"use client";

import React, { useState } from "react";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeader } from "@/components/layout/section-header";
import { Mail, MessageSquare, ShieldCheck, HeartHandshake, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#FCFCFA] min-h-screen">
      {/* ── Page Hero ────────────────────────────────────────── */}
      <PageHero
        title="Get in Touch with MedGuide AI"
        subtitle="Have questions about our open-source healthcare platform, research collaboration, or clinical safety framework? We would love to hear from you."
        primaryCtaText="Ask MedGuide"
        primaryCtaHref="/app/chat"
        secondaryCtaText="Explore FAQs"
        secondaryCtaHref="/faq"
      />

      {/* ── Main Contact Container ──────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column: Contact Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F766E] bg-teal-50/80 px-3.5 py-1 rounded-full border border-teal-200/60">
                  DIRECT CONTACT
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 leading-tight">
                  How can we help you?
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Connect with our student engineering team for inquiries regarding deployment, safety research, or partnership opportunities.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                {[
                  {
                    title: "Research & Partnerships",
                    desc: "For academic institutions, public health researchers, and PHC deployment leads.",
                    email: "research@medguide.ai",
                    icon: HeartHandshake,
                  },
                  {
                    title: "Clinical & Safety Reports",
                    desc: "To report triage edge cases, dataset feedback, or safety rule suggestions.",
                    email: "safety@medguide.ai",
                    icon: ShieldCheck,
                  },
                  {
                    title: "General Inquiries",
                    desc: "For general questions regarding the platform, voice models, or open-source setup.",
                    email: "support@medguide.ai",
                    icon: Mail,
                  },
                ].map((item) => {
                  const CardIcon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-3 hover:shadow-xs transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-[#0F766E]">
                          <CardIcon className="w-5 h-5" />
                        </div>
                        <h3 className="montserrat-bold text-base font-bold text-slate-900">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.desc}
                      </p>
                      <a
                        href={`mailto:${item.email}`}
                        className="inline-block text-xs font-semibold text-[#0F766E] hover:underline"
                      >
                        {item.email}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[32px] border border-slate-200/90 p-8 sm:p-10 shadow-2xs">
                {submitted ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl text-slate-900">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Thank you for contacting MedGuide AI. Our team will review your message and respond shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-pill bg-slate-900 text-white hover:bg-slate-800 font-semibold px-6 py-2.5 rounded-full text-xs"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="font-serif text-2xl text-slate-900">
                        Send us a message
                      </h3>
                      <p className="text-xs text-slate-500 font-normal">
                        Fill out the form below and we will get back to you.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Rajesh Kumar"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] focus:bg-white transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="rajesh@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Topic / Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#0F766E] focus:bg-white transition-all"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="research">Research Collaboration</option>
                        <option value="safety">Safety / Clinical Feedback</option>
                        <option value="deployment">Rural Deployment</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Write your query or message here..."
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] focus:bg-white transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full btn-pill bg-[#0F766E] text-white hover:bg-teal-800 font-semibold py-3.5 rounded-full inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>Send Message</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
