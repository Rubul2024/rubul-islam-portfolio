// Skills shown as logo tiles in the Skills section, filterable by category.
// `icon` is the export name of the logo in the `simple-icons` package
// (https://simpleicons.org) — search there to add another one. Set
// `large: true` for wide logos that look small in the circle.

export const skillCategories = ["Frontend", "Backend", "Database", "Tools & CMS"];

export const skills = [
  // Frontend
  { name: "JavaScript", icon: "siJavascript", category: "Frontend" },
  { name: "React", icon: "siReact", category: "Frontend" },
  { name: "Next.js", icon: "siNextdotjs", category: "Frontend" },
  { name: "Tailwind CSS", icon: "siTailwindcss", category: "Frontend" },
  { name: "Bootstrap", icon: "siBootstrap", category: "Frontend" },

  // Backend
  { name: "Node.js", icon: "siNodedotjs", category: "Backend" },
  { name: "Express.js", icon: "siExpress", category: "Backend" },

  // Database
  { name: "MongoDB", icon: "siMongodb", category: "Database" },
  { name: "MySQL", icon: "siMysql", category: "Database" },

  // Tools & CMS
  { name: "WordPress", icon: "siWordpress", category: "Tools & CMS" },
  { name: "Elementor", icon: "siElementor", category: "Tools & CMS" },
  // Wide logo: drawn larger so it reads at the same visual weight
  { name: "WooCommerce", icon: "siWoocommerce", category: "Tools & CMS", large: true },
  { name: "Git", icon: "siGit", category: "Tools & CMS" },
  { name: "GitHub", icon: "siGithub", category: "Tools & CMS" },
];
