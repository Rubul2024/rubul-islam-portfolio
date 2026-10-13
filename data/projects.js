/**
 * Project content. Edit here; components render whatever is present.
 *
 * Honesty rules applied to this file:
 * - Facts come from the resume/brief or from the live public website.
 * - `links.repo` is null unless a public repository has been verified.
 *   (GitHub could not be inspected while this was written — add repo URLs
 *   once you confirm which repositories are public.)
 * - `caseStudy.challenges` is intentionally empty. Add real challenges and
 *   how you solved them; the section is hidden until you do.
 * - Project visuals are illustrative mockups, labelled as such in the UI.
 */

export const projectCategories = ["All", "Full Stack", "Web Platform", "Frontend", "QA & Testing"];

export const projects = [
  {
    slug: "digiads-business-solutions",
    // Plain-language label shown on project cards (optional)
    businessLabel: "Lead-generation website for a business services firm",
    title: "DigiAds Business Solutions",
    subtitle: "One-stop business services platform · India & UAE",
    category: "Full Stack",
    status: "Live in production",
    featured: true,
    // Shown with an accent "Highlight" ribbon in the featured list.
    highlight: true,
    visual: "services",
    summary:
      "A live platform that brings business registration, GST and income tax, MCA compliance, trademarks, licences and ISO, website & app development and UAE company setup together in one place — so clients can find the right service and start the process online.",
    // Listed as MERN-based on Rubul's LinkedIn profile. Confirm stack and scope.
    tech: ["MERN Stack", "React", "Node.js", "MongoDB"],
    // Figures as published on the live website.
    stats: [
      { value: "150+", label: "Services" },
      { value: "10", label: "Service areas" },
      { value: "India & UAE", label: "Coverage" },
    ],
    features: [
      "Service search and a categorised catalogue across 10 service areas",
      "Dedicated pages for registration, tax, legal & IP, licences and global setup",
      "Lead capture: Talk to an Expert, WhatsApp chat and newsletter sign-up",
      "Client showcase, blog and FAQ to build trust with new businesses",
    ],
    contribution: "Full stack development of the business services platform.",
    links: { live: "https://www.digiadssolution.in/", repo: null },
    caseStudy: null,
  },
  {
    slug: "indilens",
    // Plain-language label shown on project cards (optional)
    businessLabel: "Company website for a digital solutions agency",
    title: "Indilens",
    subtitle: "Digital solutions company website & group hub",
    category: "Web Platform",
    status: "Live in production",
    featured: true,
    visual: "agency",
    summary:
      "The website of Indilens, a digital solutions company — presenting its web, UI/UX and software services, portfolio and team, and acting as the hub for the Indilens Group's divisions in technology and legal & compliance services.",
    // Detected from the live site: a React single-page app (Vite build) hosted on Vercel. Confirm and adjust.
    tech: ["React", "Vite", "Vercel"],
    features: [
      "Service pages for web development, UI/UX and software solutions",
      "Portfolio showcase with project categories and tech tags",
      "Indilens Group hub linking its legal & compliance and software divisions",
      "Team, blog and FAQ with “Start a Project” enquiry calls to action",
    ],
    contribution: "Development of the company website as part of the Indilens team.",
    links: { live: "https://indilens.com/", repo: null },
    caseStudy: null,
  },
  {
    slug: "kuwifr",
    // Plain-language label shown on project cards (optional)
    businessLabel: "Online store with a distributor network",
    title: "KUWIFR",
    subtitle: "E-commerce & distributor platform",
    category: "Full Stack",
    status: "Live in production",
    featured: true,
    visual: "storefront",
    summary:
      "A live full-stack e-commerce platform for KUWIFR Services, selling across multiple product categories with a catalog, cart, checkout and nationwide delivery across India — plus a distributor network with referral-based commissions.",
    tech: ["React.js", "Node.js", "Express.js", "MongoDB"],
    features: [
      "Product catalog across multiple categories",
      "Shopping cart and checkout workflow",
      "Distributor network on a binary-tree referral structure",
      "Downline tracking and commission calculation",
    ],
    contribution:
      "Full MERN application development: the storefront interface, backend APIs, data models and the referral and commission business logic.",
    links: { live: "https://kuwifr.in", repo: null },
    caseStudy: {
      overview:
        "KUWIFR is a production e-commerce platform. According to the live site, the business sells health and wellness supplements, alkaline water devices, fashion and smart EV mobility products, with delivery across India. Alongside retail, the platform runs a distributor programme where members earn based on their position in a referral network.",
      problem:
        "The business needed a single platform that could both sell products online and manage a growing distributor network — tracking who referred whom, following each member's downline and calculating commissions from that structure.",
      role:
        "Full stack developer — responsible for building the MERN application end to end, from the shopping interface to the APIs, MongoDB data models and referral logic.",
      architecture: [
        {
          layer: "Client",
          tech: "React.js",
          detail: "Storefront, product catalog, cart, checkout and distributor-facing views.",
        },
        {
          layer: "API",
          tech: "Node.js · Express.js",
          detail: "REST endpoints for products, orders and distributor operations.",
        },
        {
          layer: "Data",
          tech: "MongoDB",
          detail: "Products, orders and distributor records, including referral relationships.",
        },
      ],
      decisions: [
        {
          title: "Binary-tree referral structure",
          detail:
            "Distributor relationships are modelled as a binary tree, which gives every member a clear position and makes downline traversal well defined.",
        },
        {
          title: "Commerce and network in one application",
          detail:
            "Shopping workflows and the distributor network share one MERN codebase and database, so orders and the referral network are managed in the same system.",
        },
      ],
      challenges: [],
    },
  },
  {
    slug: "shiftease-movers",
    // Plain-language label shown on project cards (optional)
    businessLabel: "Booking system for a moving company",
    title: "ShiftEase Movers",
    subtitle: "Booking platform for a moving company",
    category: "Full Stack",
    status: "Capstone project",
    featured: true,
    visual: "booking",
    summary:
      "A booking platform for a moving company covering inquiries, quotations, bookings and service areas, with customer authentication, role-based access and an admin workflow — backed by a REST API with 30+ endpoints.",
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "Mongoose", "JWT", "bcrypt"],
    features: [
      "REST API with 30+ endpoints",
      "Six MongoDB collections modelled with Mongoose",
      "Server-side, distance-based pricing with additional service charges",
      "Booking IDs for tracking",
      "Customer and admin roles",
      "Admin management of bookings, quotes and inquiries",
    ],
    contribution:
      "Designed and built the full application: React interface, Express REST API, Mongoose schemas, JWT/bcrypt authentication and the pricing logic.",
    links: { live: null, repo: null },
    caseStudy: {
      overview:
        "ShiftEase Movers is a capstone project: a complete booking system for a house-shifting and moving business. Customers can send inquiries, request quotations, make bookings and track them, while administrators manage the incoming work.",
      problem:
        "A moving business handles many enquiries that turn into quotes and then bookings. Pricing depends on distance and extra services, and staff need one place to manage every stage instead of scattered calls and messages.",
      role:
        "Sole developer — frontend, backend, database design, authentication and business logic.",
      architecture: [
        {
          layer: "Client",
          tech: "React.js",
          detail: "Customer flows for inquiries, quotes, bookings and tracking, plus an admin interface.",
        },
        {
          layer: "API",
          tech: "Node.js · Express.js",
          detail: "30+ REST endpoints, JWT authentication and role checks for customers and admins.",
        },
        {
          layer: "Data",
          tech: "MongoDB · Mongoose",
          detail: "Six collections defined as Mongoose schemas.",
        },
      ],
      decisions: [
        {
          title: "Pricing calculated on the server",
          detail:
            "Distance-based pricing and additional service charges are computed in the backend, so quotes come from one trusted source rather than from the browser.",
        },
        {
          title: "JWT authentication with hashed passwords",
          detail:
            "Passwords are hashed with bcrypt, and JWTs carry the user's identity and role so the API can separate customer and admin access.",
        },
        {
          title: "Booking IDs",
          detail:
            "Each booking receives an ID that customers and administrators can use to track it through its lifecycle.",
        },
      ],
      challenges: [],
    },
  },
  {
    slug: "all-india-labour-party",
    // Plain-language label shown on project cards (optional)
    businessLabel: "Membership portal for an organisation",
    title: "All India Labour Party",
    subtitle: "Organisational web platform",
    category: "Web Platform",
    status: "Live website",
    featured: false,
    visual: "organisation",
    summary:
      "Web platform for the All India Labour Party, with sections for leadership, news, gallery and contact, alongside membership registration, member login and donation entry points.",
    // Referenced on Rubul's LinkedIn profile as a full-stack platform. Confirm scope.
    tech: ["Full Stack"],
    features: [
      "News, leadership and gallery sections",
      "Membership registration and member login entry points",
      "Newsletter subscription and contact information",
    ],
    contribution: "Full stack development of the organisation's web platform.",
    links: { live: "https://allindialabourparty.com", repo: null },
    caseStudy: null,
  },
  {
    slug: "recipe-discovery-app",
    title: "Recipe Discovery App",
    subtitle: "AI-assisted React application",
    category: "Frontend",
    status: "Course-end project · Simplilearn",
    featured: false,
    visual: "recipes",
    summary:
      "A React application for browsing, searching and viewing recipes, built as the course-end project of the Simplilearn AI-Powered Full Stack Developer Program using an AI-assisted workflow.",
    tech: ["React.js", "GitHub Copilot", "VS Code"],
    features: ["Recipe listing", "Recipe detail views", "Search and discovery", "AI-assisted development workflow"],
    contribution: "Built the application, using GitHub Copilot in VS Code as part of the development workflow.",
    links: { live: null, repo: null },
    caseStudy: {
      overview:
        "A recipe discovery app built in React as the course-end project for the Simplilearn AI-Powered Full Stack Developer Program. Users can browse a list of recipes, search for something specific and open a detailed view of each recipe.",
      problem:
        "The project demonstrates building a complete, component-based React interface — listing, search and detail views — while applying AI-assisted development practices.",
      role: "Developer — interface, component structure and application flow.",
      architecture: [
        { layer: "Views", tech: "React.js", detail: "Recipe list, search and recipe detail views." },
        {
          layer: "Workflow",
          tech: "GitHub Copilot · VS Code",
          detail: "AI pair-programming used as part of the development workflow.",
        },
      ],
      decisions: [
        {
          title: "AI-assisted, developer-reviewed",
          detail:
            "GitHub Copilot was used inside VS Code as part of the development workflow, which was a core focus of the program.",
        },
      ],
      challenges: [],
    },
  },
  {
    slug: "genai-in-testing",
    title: "GenAI in Testing",
    subtitle: "AI-assisted QA for a simulated banking platform",
    category: "QA & Testing",
    status: "QA project · Simulated system",
    featured: false,
    visual: "testing",
    summary:
      "A software testing project on a simulated banking platform: KYC/AML scenarios, AI-assisted test-case generation, synthetic test data and execution reporting.",
    tech: ["Generative AI Tools", "Test Case Design", "Software Testing"],
    features: [
      "KYC and AML test scenarios",
      "Test cases generated with GenAI assistance",
      "Synthetic test data",
      "Test execution reporting",
    ],
    contribution:
      "Designed test scenarios and cases, generated synthetic data and documented execution results. This was a testing exercise against a simulated system — not a production banking application.",
    links: { live: null, repo: null },
    caseStudy: {
      overview:
        "A quality-assurance project applying generative AI to software testing. The system under test was a simulated banking platform, with a focus on Know-Your-Customer (KYC) and Anti-Money-Laundering (AML) scenarios.",
      problem:
        "Compliance-heavy workflows like KYC and AML need many well-structured test cases and realistic data that does not expose real customer information.",
      role: "QA / test engineer — scenario design, test-case generation, test data and reporting.",
      architecture: [
        { layer: "Scenarios", tech: "KYC · AML", detail: "Test scenarios derived from banking compliance workflows." },
        { layer: "Generation", tech: "Generative AI", detail: "Test cases generated with generative AI assistance." },
        { layer: "Data", tech: "Synthetic", detail: "Synthetic test data instead of real customer records." },
        { layer: "Reporting", tech: "Execution reports", detail: "Documented results of test execution." },
      ],
      decisions: [
        {
          title: "Synthetic data only",
          detail: "Test data was synthetic, which keeps realistic coverage without handling real personal or financial data.",
        },
      ],
      challenges: [],
    },
  },
];

export function getProject(slug) {
  return projects.find((p) => p.slug === slug);
}

export const caseStudyProjects = projects.filter((p) => p.caseStudy);
