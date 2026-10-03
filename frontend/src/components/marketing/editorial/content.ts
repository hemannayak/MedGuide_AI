export const commonQuestions = [
  {
    question: "Is MedGuide a replacement for a doctor?",
    answer:
      "No. MedGuide is intended to support preliminary healthcare information and professional care. It must not provide a definitive diagnosis, prescribe medicine, or change a prescribed dosage.",
  },
  {
    question: "What can I explore in the current demonstration?",
    answer:
      "The interface includes symptom input, a health companion, medication and dashboard views, and previews of voice, documents, language, and source displays. Connected services and clinical evaluation are separate from the frontend demonstration.",
  },
  {
    question: "Which languages are in the first phase?",
    answer:
      "English, Hindi, and Telugu. Language preferences and native-script layouts are available in the interface. Speech, translation, and response quality require evaluation for each language.",
  },
  {
    question: "How does MedGuide use medical sources?",
    answer:
      "The intended retrieval workflow finds relevant passages from reviewed documents and preserves publisher, title, page, and version metadata. Evidence is shown separately from generated explanations. Retrieval does not guarantee correctness.",
  },
  {
    question: "What happens when information is uncertain?",
    answer:
      "The design requires uncertainty and evidence limitations to remain visible. Unclear prescription text needs verification, and unsupported information should not be converted into a confident answer.",
  },
  {
    question: "Does everything work offline?",
    answer:
      "No. Cached information, schedules, and queued actions are part of the offline-first design. New AI responses, server processing, and synchronization may need a connection. Offline readiness has not been established by this website.",
  },
  {
    question: "How are healthcare workers involved?",
    answer:
      "The approved scope includes authorized access to patient-reported information, summaries for review, medication information, alerts, and follow-ups. Human expertise remains central.",
  },
  {
    question: "Is the project clinically validated?",
    answer:
      "No clinical validation, deployment approval, or measured clinical performance is claimed. The Research page explains planned evaluation areas and the project’s limitations.",
  },
];
