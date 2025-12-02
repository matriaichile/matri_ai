"use client";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Benefits from "./components/Benefits";
import HowItWorks from "./components/HowItWorks";
import RoleSelection from "./components/RoleSelection";
import Footer from "./components/Footer";

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
