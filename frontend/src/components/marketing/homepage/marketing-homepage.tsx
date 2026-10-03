import { HeroSection } from "./hero-section";
import { ProblemSection, SolutionSection } from "./problem-solution";
import { FinalSection } from "./final-section";
import { MarketingFooter } from "./marketing-footer";
import { ScrollReveal } from "./scroll-reveal";
import {
  ProductJourney,
  HomeQuestions,
  HomeTrust,
} from "../editorial/journey";
import styles from "./homepage.module.css";

export function MarketingHomepage() {
  return (
    <div className={styles.homepage}>
      <a href="#solution" className={styles.skipLink}>
        Skip to product information
      </a>
      <link rel="preload" as="image" href="/marketing/backgrounds/hero-desktop.webp" media="(min-width: 761px)" />
      <link rel="preload" as="image" href="/marketing/backgrounds/hero-mobile.webp" media="(max-width: 760px)" />
      <HeroSection />
      <ScrollReveal>
        <ProblemSection />
      </ScrollReveal>
      <ScrollReveal>
        <SolutionSection />
      </ScrollReveal>
      <ProductJourney />
      <ScrollReveal><HomeTrust /></ScrollReveal>
      <HomeQuestions />
      <ScrollReveal>
        <FinalSection />
      </ScrollReveal>
      <MarketingFooter />
    </div>
  );
}
