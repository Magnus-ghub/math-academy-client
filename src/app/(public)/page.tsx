// app/(public)/page.tsx
import CTASection from "@/components/home/CTASection";
import HeroSection from "@/components/home/HeroSection";
import SuccessStoriesSection from "@/components/home/SuccessStoriesSection";
import TeachersSection from "@/components/home/TeachersSection";
import SocialMediaSection from "@/components/home/SocialMediaSection";
import TestTypesSection from "@/components/home/TestTypesSection";
import BookSection from "@/components/home/BookSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FAQSection from "@/components/home/FAQSection";
import EventsSection from "@/components/home/EventsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SocialMediaSection />
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