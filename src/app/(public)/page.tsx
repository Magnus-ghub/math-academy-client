// app/(public)/page.tsx
import HeroSection from "@/components/home/HeroSection";
import TestTypesSection from "@/components/home/TestTypesSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TestTypesSection />
    </>
  );
}