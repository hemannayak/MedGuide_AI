import {
  BookOpen,
  FileText,
  Globe,
  MessageSquare,
  Mic,
  ShieldCheck,
} from "lucide-react";

export const solutionFeatures = [
  {
    id: "text",
    title: "Text Chat",
    Icon: MessageSquare,
    heading: "Ask in your own words.",
    description:
      "Type a question, explore follow-ups, and keep the conversation easy to understand.",
    previewTitle: "How can I help you today?",
    previewText: "Type your health question…",
  },
  {
    id: "voice",
    title: "Voice Input",
    Icon: Mic,
    heading: "A conversation starts with your voice.",
    description:
      "Preview how speaking, reviewing a transcript, and listening to a response will fit into MedGuide. No microphone is accessed in this demonstration.",
    previewTitle: "Your voice. Your question.",
    previewText: "Voice input demonstration",
  },
  {
    id: "document",
    title: "Document (OCR)",
    Icon: FileText,
    heading: "Make documents easier to read.",
    description:
      "The planned document flow lets you upload a prescription, review extracted text, and verify unclear details before continuing.",
    previewTitle: "Understand your document.",
    previewText: "prescription-example.pdf · Synthetic sample",
  },
  {
    id: "language",
    title: "Multilingual",
    Icon: Globe,
    heading: "Understanding in a familiar language.",
    description:
      "Explore the intended language experience, with flexible layouts for the first-phase languages: English, Telugu, and Hindi. These previews do not perform translation.",
    previewTitle: "మీ ప్రశ్న అడగండి",
    previewText: "English · తెలుగు · हिंदी",
  },
  {
    id: "sources",
    title: "Reliable Sources",
    Icon: BookOpen,
    heading: "See where information comes from.",
    description:
      "Source cards are designed to keep retrieved evidence traceable and separate from generated explanations. The example below is a UI placeholder, not a citation.",
    previewTitle: "Evidence you can explore.",
    previewText: "Source details · Demonstration",
  },
  {
    id: "safety",
    title: "Safety Guidance",
    Icon: ShieldCheck,
    heading: "Know when to seek professional help.",
    description:
      "The planned safety experience makes escalation guidance visible. This preview does not assess symptoms or make a medical decision.",
    previewTitle: "Safety comes first.",
    previewText: "Professional care guidance · UI preview",
  },
] as const;
export type FeatureMode = (typeof solutionFeatures)[number]["id"];
export function getSolutionFeature(mode: FeatureMode) {
  return (
    solutionFeatures.find((feature) => feature.id === mode) ??
    solutionFeatures[0]
  );
}
