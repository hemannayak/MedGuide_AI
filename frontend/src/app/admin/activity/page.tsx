import React from "react";
import { ActivityMonitor } from "@/components/admin/agent-activity/activity-monitor";

export const metadata = {
  title: "RAG & Triage Activity Monitor | MedGuide AI Admin",
  description:
    "Developer inspection terminal for real-time monitoring of voice STT, red-flag safety triage, pgvector search, and LLM generation.",
};

export default function AdminActivityPage() {
  return (
    <div className="section-gap bg-[#FCFCFA] min-h-screen">
      <div className="section-container">
        <ActivityMonitor />
      </div>
    </div>
  );
}
