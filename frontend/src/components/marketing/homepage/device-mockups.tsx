"use client";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  Home,
  MessageSquare,
  Mic,
  RotateCw,
  Settings,
  CirclePlus,
  History,
} from "lucide-react";
import { getSolutionFeature, type FeatureMode } from "./feature-data";
import { Brand } from "./shared";
import styles from "./homepage.module.css";

function CompanionPreview({
  desktop = false,
  mode = "text",
}: {
  desktop?: boolean;
  mode?: FeatureMode;
}) {
  const feature = getSolutionFeature(mode);
  const reducedMotion = useReducedMotion();
  return (
    <div className={styles.companion}>
      <div className={styles.previewHeader}>
        <Brand small />
        <RotateCw size={10} />
        <span className={styles.avatar}>S</span>
      </div>
      {desktop && (
        <aside className={styles.previewSidebar}>
          {[
            [CirclePlus, "New Chat"],
            [History, "History"],
            [BookOpen, "Saved"],
            [Settings, "Settings"],
          ].map(([Icon, label]) => {
            const ItemIcon = Icon as typeof History;
            return (
              <span key={String(label)}>
                <ItemIcon size={12} />
                {String(label)}
              </span>
            );
          })}
        </aside>
      )}
      <motion.div
        key={mode}
        className={styles.previewMain}
        initial={reducedMotion ? false : { opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h3 lang={mode === "language" ? "te" : undefined}>
          {mode === "text" ? (
            <>
              How can I help
              <br className={styles.phoneBreak} /> you today?
            </>
          ) : (
            feature.previewTitle
          )}
        </h3>
        <div className={styles.previewModes}>
          <span data-active={mode !== "voice" && mode !== "document"}>
            <MessageSquare />
            Text
          </span>
          <span data-active={mode === "voice"}>
            <Mic />
            Voice
          </span>
          <span data-active={mode === "document"}>
            <FileText />
            Document
          </span>
        </div>
        <div className={styles.previewInput}>
          {feature.previewText}
          <span>
            <ArrowUpRight />
          </span>
        </div>
        {mode === "text" ? (
          <>
            <p className={styles.tryAsking}>Try asking</p>
            <div className={styles.previewSuggestions}>
              <span>I have fever and body pain</span>
              <span>What are signs of dengue?</span>
              <span lang="hi">मुझे सिर दर्द हो रहा है, क्या करूँ?</span>
            </div>
          </>
        ) : (
          <div
            className={`${styles.modePreview} ${mode === "safety" ? styles.safetyModePreview : ""}`}
          >
            <feature.Icon aria-hidden="true" />
            <strong>{feature.title}</strong>
            {mode === "voice" && (
              <div className={styles.voiceBars} aria-hidden="true">
                {[14, 24, 37, 20, 42, 27, 17, 34, 22].map((height, index) => (
                  <i key={index} style={{ height }} />
                ))}
              </div>
            )}
            {mode === "document" && (
              <>
                <span>1. Select a document</span>
                <span>2. Review extracted text</span>
                <span>3. Verify uncertain details</span>
              </>
            )}
            {mode === "language" && (
              <>
                <span lang="te">తెలుగు</span>
                <span lang="hi">हिंदी</span>
                <span>First-phase language options</span>
              </>
            )}
            {mode === "sources" && (
              <>
                <span>Document title</span>
                <span>Publisher · Publication date</span>
                <span>View retrieved passage</span>
              </>
            )}
            {mode === "safety" && (
              <>
                <span>Guidance is not a diagnosis.</span>
                <span>Contact a healthcare professional.</span>
              </>
            )}
            <small>Illustrative frontend preview</small>
          </div>
        )}
      </motion.div>
      {!desktop && (
        <div className={styles.previewBottom}>
          {[
            [Home, "Home"],
            [History, "History"],
            [BookOpen, "Saved"],
            [Settings, "Settings"],
          ].map(([Icon, label]) => {
            const ItemIcon = Icon as typeof Home;
            return (
              <span key={String(label)}>
                <ItemIcon size={13} />
                {String(label)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
export function MedGuidePhoneMockup({
  className = "",
  mode = "text",
}: {
  className?: string;
  mode?: FeatureMode;
}) {
  return (
    <div
      className={`${styles.phone} ${className}`}
      role="img"
      aria-label={`Illustrative MedGuide mobile interface: ${getSolutionFeature(mode).title}`}
    >
      <div className={styles.phoneScreen}>
        <div className={styles.statusBar}>
          <span>9:41</span>
          <span>● ▰ ▰</span>
        </div>
        <CompanionPreview mode={mode} />
      </div>
    </div>
  );
}
export function MedGuideDesktopMockup({
  className = "",
  mode = "text",
}: {
  className?: string;
  mode?: FeatureMode;
}) {
  return (
    <div
      className={`${styles.desktop} ${className}`}
      role="img"
      aria-label={`Illustrative MedGuide desktop interface: ${getSolutionFeature(mode).title}`}
    >
      <div className={styles.desktopScreen}>
        <CompanionPreview desktop mode={mode} />
      </div>
      <div className={styles.desktopBase} />
    </div>
  );
}
