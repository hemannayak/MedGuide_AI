"use client";

import React, { useState } from "react";
import { Terminal, CheckCircle2, Play, Pause } from "lucide-react";

interface LogEvent {
  id: string;
  timestamp: string;
  severity: "INFO" | "PROCESSING" | "SOURCE FOUND" | "WARNING" | "ERROR";
  component: string;
  message: string;
  detail?: string;
}

const SAMPLE_LOGS: LogEvent[] = [
  {
    id: "log-101",
    timestamp: "14:52:01.102",
    severity: "INFO",
    component: "GATEWAY",
    message: "Incoming voice stream received (Audio sample rate: 16kHz, Client: WebSpeech)",
  },
  {
    id: "log-102",
    timestamp: "14:52:01.340",
    severity: "PROCESSING",
    component: "SPEECH_STT",
    message: "Transcribing audio chunk (Detected Language: Hindi / devanagari)",
  },
  {
    id: "log-103",
    timestamp: "14:52:01.520",
    severity: "INFO",
    component: "TRIAGE_ENGINE",
    message: "Running deterministic safety triage check against red-flag ruleset v2.4",
  },
  {
    id: "log-104",
    timestamp: "14:52:01.525",
    severity: "INFO",
    component: "TRIAGE_ENGINE",
    message: "Triage Result: PASS (No acute chest pain / stroke / airway emergency detected)",
  },
  {
    id: "log-105",
    timestamp: "14:52:01.710",
    severity: "SOURCE FOUND",
    component: "RAG_RETRIEVER",
    message: "pgvector similarity search completed over WHO Primary Care Corpus",
    detail: "Retrieved 3 chunks (Scores: 0.912, 0.884, 0.821)",
  },
  {
    id: "log-106",
    timestamp: "14:52:02.105",
    severity: "PROCESSING",
    component: "LLM_GENERATOR",
    message: "Synthesizing response constrained strictly to retrieved RAG context",
  },
  {
    id: "log-107",
    timestamp: "14:52:02.480",
    severity: "INFO",
    component: "SAFETY_VALIDATOR",
    message: "Response safety validation PASSED. Appended verified citations.",
  },
];

export const ActivityMonitor: React.FC = () => {
  const [logs] = useState<LogEvent[]>(SAMPLE_LOGS);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [isLive, setIsLive] = useState<boolean>(true);

  const filteredLogs = logs.filter(
    (log) => filterSeverity === "ALL" || log.severity === filterSeverity
  );

  const getSeverityBadge = (sev: LogEvent["severity"]) => {
    switch (sev) {
      case "INFO":
        return "bg-sky-950 text-sky-400 border-sky-800";
      case "PROCESSING":
        return "bg-[#0F766E]/30 text-teal-300 border-teal-700 animate-pulse";
      case "SOURCE FOUND":
        return "bg-emerald-950 text-emerald-400 border-emerald-800";
      case "WARNING":
        return "bg-amber-950 text-amber-400 border-amber-800";
      case "ERROR":
        return "bg-red-950 text-red-400 border-red-800";
      default:
        return "bg-slate-800 text-slate-300";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#161A24] text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="font-serif text-xl font-normal">
              RAG & Triage Activity Monitor
            </div>
            <div className="text-xs text-slate-400">
              Developer Inspection Interface &bull; Real-time LLM & Vector Pipeline
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLive
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLive ? "Stream Active" : "Paused"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            Avg Pipeline Latency
          </div>
          <div className="text-xl font-bold text-[#161A24]">378 ms</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            RAG Hit Rate
          </div>
          <div className="text-xl font-bold text-[#8C6D46]">98.4%</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            Red-Flag Triage Status
          </div>
          <div className="text-xl font-bold text-stone-800 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-stone-700" /> 100% Pass
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            Model Instance
          </div>
          <div className="text-xl font-bold text-slate-800">Qwen3:4B (Local)</div>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex gap-2">
          {["ALL", "INFO", "PROCESSING", "SOURCE FOUND", "WARNING", "ERROR"].map(
            (sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  filterSeverity === sev
                    ? "bg-[#1C1917] text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {sev}
              </button>
            )
          )}
        </div>

        <div className="text-[11px] text-slate-400">
          Showing {filteredLogs.length} events
        </div>
      </div>

      {/* Terminal Log Stream Container */}
      <div className="p-6 rounded-3xl bg-slate-950 text-slate-200 font-mono text-xs shadow-2xl border border-slate-800 min-h-[420px] space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Pipeline Execution Log
          </span>
          <span>Buffer: 1000 events</span>
        </div>

        <div className="space-y-3 pt-2">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadge(
                    log.severity
                  )}`}
                >
                  {log.severity}
                </span>
                <span className="text-teal-400 font-bold text-[11px]">
                  [{log.component}]
                </span>
              </div>

              <div className="text-slate-200 font-normal">{log.message}</div>

              {log.detail && (
                <div className="text-slate-400 text-[11px] pl-3 border-l-2 border-slate-700 italic">
                  {log.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
