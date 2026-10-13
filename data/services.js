/**
 * Services offered to businesses — the single source of truth for /services,
 * the home-page Services section, the contact form topics and the JSON-LD.
 *
 * Every TODO(Rubul) below is safe to leave unfilled: the site hides or
 * rewords that part until you add a real value, so no placeholder text ever
 * appears on the live site.
 */

// ── Pricing ────────────────────────────────────────────────────
// Prices are shown as "Starting from …" on the service cards when true.
// TODO(Rubul): fill in every `startingFrom` below, then set this to true.
export const SHOW_PRICES = false;

// TODO(Rubul): number of pages included in a Business Website, e.g. "5".
// While null, the card says "All core pages, designed mobile-first".
const BUSINESS_SITE_PAGES = null;

// TODO(Rubul): small content edits included per month in the Care Plan, e.g. "2".
const CARE_PLAN_EDITS = null;

// TODO(Rubul): your payment terms, e.g. "50% upfront and 50% on launch".
// While null, the FAQ gives a general answer without exact percentages.
const PAYMENT_TERMS = null;

/**
 * @typedef {Object} Service
 * @property {string} slug            Used in URLs and ?service= preselection
 * @property {string} title
 * @property {string} icon            Key in components/services/ServiceIcon.jsx
 * @property {string} outcome         One-line business result
 * @property {string} forWho
 * @property {string} problem
 * @property {string[]} includes
 * @property {string[]} deliverables
 * @property {string} timeline
 * @property {string} startingFrom    Shown only when SHOW_PRICES is true
 * @property {string} [priceNote]     e.g. "per month"
 * @property {string} tech            Plain-language note on the technology
 * @property {string[]} relatedProjects  Slugs from data/projects.js
 * @property {string} contactTopic    Matching option in the contact form
 */

/** @type {Service[]} */
export const services = [
  {
    slug: "business-websites",
    title: "Business Websites",
    icon: "globe",
    outcome: "A fast, professional website that turns visitors into enquiries.",
    forWho: "Shops, clinics, consultants, agencies and local businesses.",
    problem:
      "Customers can't find you online, or your current site looks dated, loads slowly and doesn't bring in enquiries.",
    includes: [
      BUSINESS_SITE_PAGES ? `Up to ${BUSINESS_SITE_PAGES} pages, designed mobile-first` : "All core pages, designed mobile-first",
      "WhatsApp button and contact form that reach you directly",
      "On-page SEO basics so people find you on Google",
      "Google Business Profile setup",
      "Analytics to see where enquiries come from",
      "Speed optimisation for slow mobile connections",
    ],
    deliverables: ["Live website on your domain", "Admin access to edit your own content", "Handover walkthrough"],
    timeline: "1–3 weeks",
    startingFrom: "₹XX,XXX", // TODO(Rubul): set price
    tech: "WordPress or Next.js, depending on how you want to manage it",
    relatedProjects: ["indilens", "all-india-labour-party", "digiads-business-solutions"],
    contactTopic: "Business website",
  },
  {
    slug: "custom-web-apps",
    title: "Custom Web Applications",
    icon: "dashboard",
    outcome: "Replace spreadsheets, paper and WhatsApp chaos with one system built for how you work.",
    forWho: "Businesses that manage bookings, customers, staff or stock by hand.",
    problem:
      "Work is tracked across spreadsheets, notebooks and chats. Things get missed, and nobody has the full picture.",
    includes: [
      "Discovery session to map how your business actually works",
      "User roles and secure login for your team",
      "Admin dashboard with the numbers you need",
      "Database designed around your data",
      "Reports you can export",
      "Deployment and handover",
    ],
    deliverables: ["Working web app on your domain", "Admin accounts for your team", "Source code you own", "Handover documentation"],
    timeline: "4–10 weeks",
    startingFrom: "₹XX,XXX", // TODO(Rubul): set price
    tech: "React, Node.js and MongoDB",
    relatedProjects: ["shiftease-movers"],
    contactTopic: "Custom business web app",
  },
  {
    slug: "ecommerce-platforms",
    title: "E-commerce & Distributor Platforms",
    icon: "cart",
    outcome: "Sell online and manage your network from one dashboard.",
    forWho: "Brands, distributors and sellers ready to take orders online.",
    problem:
      "Orders come in by phone and WhatsApp, commissions are worked out by hand, and growth is limited by how much you can track.",
    includes: [
      "Product catalogue with categories",
      "Cart, checkout and payment gateway",
      "Order management for you and your team",
      "Referral and commission logic for distributor networks",
      "Admin panel to manage products, orders and members",
    ],
    deliverables: ["Live store on your domain", "Admin panel", "Payment gateway connected", "Source code you own"],
    timeline: "4–8 weeks",
    startingFrom: "₹XX,XXX", // TODO(Rubul): set price
    tech: "React, Node.js, Express and MongoDB",
    relatedProjects: ["kuwifr"],
    contactTopic: "E-commerce or distributor platform",
  },
  {
    slug: "website-care-plan",
    title: "Website Care Plan",
    icon: "shield",
    outcome: "Your site stays fast, secure and up to date — without you thinking about it.",
    forWho: "Any business with a website it depends on, built by me or someone else.",
    problem: "Updates get skipped, backups don't exist, and problems are only noticed when a customer complains.",
    includes: [
      "Plugin, theme and core updates",
      "Regular backups",
      "Security and uptime monitoring",
      "Speed fixes when something slows down",
      CARE_PLAN_EDITS ? `${CARE_PLAN_EDITS} small content edits every month` : "Small content edits each month",
      "Monthly report",
    ],
    deliverables: ["Monthly report", "Direct support from me"],
    timeline: "Ongoing · billed monthly",
    startingFrom: "₹X,XXX", // TODO(Rubul): set price
    priceNote: "per month",
    tech: "WordPress and custom websites",
    relatedProjects: [],
    contactTopic: "Website care plan",
  },
];

export function getService(slug) {
  return services.find((s) => s.slug === slug) ?? null;
}

/** Contact-form topics: one per service, plus the non-service options. */
export const contactTopics = [...services.map((s) => s.contactTopic), "Full-time or contract role", "Something else"];

/** Real projects as proof, each tied to the service it demonstrates. */
export const proof = [
  {
    project: "shiftease-movers",
    service: "custom-web-apps",
    label: "Booking system",
    text: "Online booking with server-side pricing, booking IDs and secure login for a moving company.",
  },
  {
    project: "kuwifr",
    service: "ecommerce-platforms",
    label: "E-commerce + distributor network",
    text: "A live store with cart and checkout, plus referral-based commissions for a nationwide distributor network.",
  },
  {
    project: "digiads-business-solutions",
    service: "business-websites",
    label: "Service catalogue + lead generation",
    text: "150+ services across 10 areas, with search, Talk to an Expert and WhatsApp to turn visitors into leads.",
  },
  {
    project: "all-india-labour-party",
    service: "business-websites",
    label: "Membership portal",
    text: "Membership registration, member login, news and gallery for a national organisation.",
  },
];

export const processSteps = [
  { title: "Free consultation", text: "A short call to understand your business, your goals and what's not working today." },
  { title: "Proposal & fixed quote", text: "A written scope, timeline and fixed price — no hourly surprises." },
  { title: "Design", text: "Layouts you can review and comment on before any code is written." },
  { title: "Build & review", text: "Regular previews you can click through, with your feedback built in as we go." },
  { title: "Launch & support", text: "Go-live on your domain, a handover walkthrough, and help when you need it." },
];

export const industries = [
  { title: "Clinics & healthcare", icon: "clinic" },
  { title: "Packers & movers", icon: "truck" },
  { title: "Coaching institutes", icon: "education" },
  { title: "CA, GST & consultancy firms", icon: "calculator" },
  { title: "Local retailers", icon: "store" },
  { title: "Organisations & NGOs", icon: "community" },
];

export const reasons = [
  {
    title: "You talk to the developer",
    text: "No agency layers or account managers. The person you brief is the person who builds it.",
  },
  {
    title: "Proven in production",
    text: "4+ years building for the web, with platforms like KUWIFR and DigiAds live and in daily use.",
  },
  {
    title: "Fixed, written quotes",
    text: "You know the scope, timeline and price before work starts. Changes are agreed in writing.",
  },
  {
    title: "You own everything",
    text: "Your code, your domain, your hosting account and your data — always in your name.",
  },
];

/**
 * TODO(Rubul): add real testimonials from clients who have agreed to be quoted.
 * The section stays hidden while this is empty. Never use invented quotes.
 * Shape: { quote: "", name: "", role: "", company: "" }
 */
export const testimonials = [];

export const faqs = [
  {
    question: "How long does a project take?",
    answer:
      "A business website usually takes 1–3 weeks. Custom web apps and online stores take 4–10 weeks, depending on features. You get a written timeline with your quote.",
  },
  {
    question: "How much does it cost?",
    answer:
      "It depends on what you need. After a free consultation, you get a fixed written quote — the price won't change unless the scope does, and any change is agreed with you first.",
  },
  {
    question: "Who owns the code and the domain?",
    answer:
      "You do. The domain, hosting account, code and content are registered in your name, and you get full access at handover.",
  },
  {
    question: "Do you handle hosting?",
    answer:
      "Yes. I can set up hosting and the domain in your name and manage it for you, or deploy to an account you already have.",
  },
  {
    question: "What are the payment terms?",
    answer: PAYMENT_TERMS
      ? `Payment is ${PAYMENT_TERMS}. Larger projects can be split into milestones, set out in the quote.`
      : "Payment is split into stages agreed in your written quote — part before work starts and the rest at launch. Larger projects can be split into milestones.",
  },
  {
    question: "Do you provide support after launch?",
    answer:
      "Yes. Every project includes a handover and a period of support for fixes. For ongoing updates, backups and monitoring there's the monthly Website Care Plan.",
  },
  {
    question: "Can you redesign or fix my existing website?",
    answer:
      "Yes. I can fix bugs, speed it up, improve it for mobile, or redesign it completely — including sites built by someone else.",
  },
  {
    question: "Do you work with clients outside Guwahati?",
    answer:
      "Yes. I'm based in Guwahati, Assam, and work with clients across India and abroad over calls, WhatsApp and email.",
  },
];

/**
 * Optional budget question in the contact form.
 * TODO(Rubul): add your budget ranges (e.g. "Under ₹25,000"); the field stays
 * hidden while this list is empty.
 */
export const budgetRanges = [];

export const timelineOptions = ["As soon as possible", "Within 1–3 months", "Just exploring"];
