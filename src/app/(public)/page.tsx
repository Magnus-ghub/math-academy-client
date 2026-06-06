// app/(public)/page.tsx
import CTASection from "@/components/home/CTASection";
import HeroSection from "@/components/home/HeroSection";
import SuccessStoriesSection from "@/components/home/SuccessStoriesSection";
import TeachersSection from "@/components/home/TeachersSection";
import TelegramStatsSection from "@/components/home/TelegramStatsSection";
import TestTypesSection from "@/components/home/TestTypesSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TelegramStatsSection />
      <TestTypesSection />
      <SuccessStoriesSection />
      <TeachersSection />
      <CTASection />
    </>
  );
}