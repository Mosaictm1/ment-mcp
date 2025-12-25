import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import ProblemSolution from "@/components/sections/ProblemSolution";
import Features from "@/components/sections/Features";
import Demo from "@/components/sections/Demo";
import Pricing from "@/components/sections/Pricing";
import CTA from "@/components/sections/CTA";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSolution />
        <Features />
        <Demo />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
