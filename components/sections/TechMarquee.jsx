// Slowly scrolling strip of the stack. Pauses on hover, and stands still
// (wrapping instead) for visitors who prefer reduced motion.
const items = [
  "React",
  "Node.js",
  "Express.js",
  "MongoDB",
  "REST APIs",
  "JavaScript",
  "Tailwind CSS",
  "WordPress",
  "Elementor",
  "Git & GitHub",
  "JWT Auth",
  "Responsive UI",
  "Software Testing",
  "AI-assisted Development",
];

function Row({ hidden }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-10 whitespace-nowrap font-mono text-sm text-muted">
          {item}
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent/60" />
        </li>
      ))}
    </ul>
  );
}

export default function TechMarquee() {
  return (
    <div className="border-y border-line bg-bg-2/60 py-4">
      <h2 className="sr-only">Technologies I work with</h2>
      <div className="marquee group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <div className="marquee-track flex group-hover:[animation-play-state:paused]">
          <Row />
          <Row hidden />
        </div>
      </div>
    </div>
  );
}
