"use client";

import Header from "@/app/components/Header";
import Hero from "@/app/components/Hero";
import Benefits from "@/app/components/Benefits";
import HowItWorks from "@/app/components/HowItWorks";
import RoleSelection from "@/app/components/RoleSelection";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Benefits />
      <HowItWorks />
      <RoleSelection />
      <Footer />
    </main>
  );
}
