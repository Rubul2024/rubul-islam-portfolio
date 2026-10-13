import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Services from "@/components/sections/Services";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import Experience from "@/components/sections/Experience";
import Education from "@/components/sections/Education";
import GitHubSection from "@/components/sections/GitHubSection";
import Contact from "@/components/sections/Contact";
import { hasResume } from "@/lib/resume";

export default function HomePage() {
  return (
    <>
      <Hero resumeAvailable={hasResume()} />
      <About />
      <Skills />
      <Services />
      <FeaturedProjects />
      <Experience />
      <Education />
      <GitHubSection />
      <Contact />
    </>
  );
}
