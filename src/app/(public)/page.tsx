// app/(public)/page.tsx
import CTASection from "@/components/home/CTASection";
import HeroSection from "@/components/home/HeroSection";
import SuccessStoriesSection from "@/components/home/SuccessStoriesSection";
import TeachersSection from "@/components/home/TeachersSection";
import TelegramStatsSection from "@/components/home/TelegramStatsSection";
import TestTypesSection from "@/components/home/TestTypesSection";
import BookSection from "@/components/home/BookSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FAQSection from "@/components/home/FAQSection";
import EventsSection from "@/components/home/EventsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TelegramStatsSection />
      <TestTypesSection />
      <EventsSection />
      <BookSection />
      <TeachersSection />
      <HowItWorksSection />
      <SuccessStoriesSection />
      <FAQSection />
      <CTASection />
    </>
  );
}