import * as simpleIcons from "simple-icons";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import SkillsExplorer from "@/components/sections/SkillsExplorer";
import { skillCategories, skills } from "@/data/skills";

/** Relative luminance of a hex colour, 0 (black) – 1 (white). */
function luminance(hex) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Resolve logos on the server so only these few SVG paths reach the browser,
// not the whole icon library.
const items = skills.map((s) => {
  const icon = simpleIcons[s.icon];
  if (!icon) throw new Error(`Unknown simple-icons logo "${s.icon}" for ${s.name} in data/skills.js`);
  return {
    name: s.name,
    category: s.category,
    path: icon.path,
    hex: `#${icon.hex}`,
    // How the logo sits in its circle, by brand-colour brightness:
    // - "mono": near-black brands (Next.js, Express, GitHub) → inverted, so they stay visible on dark
    // - "solid": deep colours (Bootstrap, WordPress, Elementor, WooCommerce) → white logo on a brand-colour badge
    // - "tint": bright colours → brand-colour logo on a soft tint
    style: luminance(icon.hex) < 0.05 ? "mono" : luminance(icon.hex) < 0.16 ? "solid" : "tint",
    large: Boolean(s.large),
  };
});

export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="section-y border-t border-line bg-bg-2">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <SectionHeading
            id="skills-title"
            index="02"
            eyebrow="Skills & technologies"
            title="My tech stack."
            description="Languages, frameworks, databases and tools I use to build and ship full stack products — from UI to API to database."
          />
        </Reveal>

        <Reveal delay={80} className="mt-10 short:mt-8">
          <SkillsExplorer items={items} categories={skillCategories} />
        </Reveal>
      </div>
    </section>
  );
}
