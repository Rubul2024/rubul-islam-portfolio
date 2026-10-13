// Central site configuration. Update values here, not in components.

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const site = {
  name: "Rubul Islam",
  shortName: "Rubul",
  monogram: "RI",
  role: "Full Stack Developer (MERN)",
  title: "Rubul Islam — Full Stack Developer (MERN)",
  description:
    "Rubul Islam is a Full Stack Developer based in Guwahati, India, building responsive web interfaces, REST APIs, MongoDB-backed applications and professional WordPress websites.",
  tagline: "Full stack web development — from interface to API to database.",
  // Set NEXT_PUBLIC_SITE_URL in production. Trailing slashes are removed.
  url: rawUrl.replace(/\/+$/, ""),
  locale: "en_IN",
  email: "mcarubul2021@gmail.com",
  phoneDisplay: "+91 75788 98060",
  phoneHref: "tel:+917578898060",
  location: {
    city: "Guwahati",
    region: "Assam",
    country: "India",
    countryCode: "IN",
  },
  resumePath: "/resume.pdf",
};

/**
 * Default social-share image (app/opengraph-image.jsx). Pages that set their
 * own `openGraph` must include it: Next.js replaces, not merges, that object.
 */
export const ogImages = [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.title }];

/** Opens a WhatsApp chat with the phone number above. */
export const whatsappHref = `https://wa.me/${site.phoneHref.replace(/\D/g, "")}`;

export const navItems = [
  { label: "Home", href: "/#top", id: "home" },
  { label: "About", href: "/#about", id: "about" },
  { label: "Skills", href: "/#skills", id: "skills" },
  { label: "Services", href: "/services", id: "services" },
  { label: "Projects", href: "/#projects", id: "projects" },
  { label: "Experience", href: "/#experience", id: "experience" },
  { label: "Blog", href: "/blog", id: "blog" },
  { label: "Contact", href: "/#contact", id: "contact" },
];
