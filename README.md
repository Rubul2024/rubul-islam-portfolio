# Rubul Islam — Portfolio

Personal portfolio for **Rubul Islam, Full Stack Developer (MERN)** — built with Next.js (App Router), React and Tailwind CSS v4.

- Dark-first editorial design with an optional light theme
- Home page: Hero · About · Skills · Projects · Experience · Education · GitHub · Contact
- `/projects` with category filters, and case-study pages at `/projects/[slug]`
- **Blog** at `/blog`: search, tag filters, featured post, article pages with table of contents, syntax highlighting, related posts, share links, view counts and an RSS feed
- **Admin panel** at `/admin` ("Blog Studio") to write, schedule and publish posts — see §6
- Contact form that saves every enquiry to an admin inbox (`/admin/messages`), with optional email alerts via Resend
- SEO: metadata, Open Graph image, `sitemap.xml`, `robots.txt`, Person + WebSite JSON-LD
- Accessibility: skip link, landmarks, keyboard-friendly mobile menu with focus trap, visible focus, reduced-motion support

---

## 1. Requirements

- **Node.js 20.9 or newer** (required by Next.js 16) — check with `node -v`
- npm (bundled with Node)

## 2. Run it locally

```bash
npm install
cp .env.example .env.local      # Windows: copy .env.example .env.local
npm run dev
```

Open http://localhost:3000.

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `npm run dev`   | Development server with hot reload   |
| `npm run build` | Production build (run before deploy) |
| `npm run start` | Serve the production build           |
| `npm run lint`  | ESLint (Next.js core-web-vitals)     |

> First `npm run build` downloads the Geist fonts from Google Fonts, so it needs internet access.

## 3. Before you publish — things only you can add

| What | Where | Why |
| --- | --- | --- |
| **Your resume PDF** | Save as `public/resume.pdf` | Every "Download Resume" button appears automatically once the file exists. Until then they're hidden — no fake buttons. |
| **Production URL** | `NEXT_PUBLIC_SITE_URL` env var | Canonical URLs, Open Graph, sitemap and robots.txt use it. |
| **Resend API key (optional)** | `RESEND_API_KEY` env var | Email alerts for new enquiries (they're always saved to the admin inbox — see §5). |
| **Public GitHub repos** | `links.repo` in `data/projects.js`, and `featuredRepos` in `components/sections/GitHubSection.jsx` | GitHub couldn't be inspected when this was built, so no repo links were invented. |
| **DigiAds & AILP details** | `data/projects.js` | Descriptions use only what the live sites show plus your LinkedIn wording. Confirm the stack and your exact contribution, then add a `caseStudy` object to give them full pages. |
| **Real challenges** | `caseStudy.challenges` in `data/projects.js` | The "Challenges & solutions" block is hidden until you add real ones: `{ challenge: "...", solution: "..." }`. |
| **Real screenshots (optional)** | `public/images/` | Project visuals are labelled illustrative mockups. Swap `ProjectVisual` for `next/image` if you have screenshots you're allowed to show. |

## 4. Where to edit content

All content lives in `data/` and `lib/site.js` — components only render it.

```
lib/site.js            name, email, phone, location, nav items, tagline
data/projects.js       projects, case studies, categories (+ optional businessLabel)
data/services.js       /services page + home Services section: services, prices (SHOW_PRICES),
                       process, FAQ, industries, testimonials, contact topics/budget/timeline
data/experience.js     work history
data/education.js      degrees and certifications
data/skills.js         tech-stack logo tiles by category (logos from simple-icons)
data/social-links.js   GitHub, LinkedIn, Instagram, Facebook
```

## 5. Contact form & enquiries inbox

Visitors pick a topic, enter their name, email, optional phone/WhatsApp and a message, and press **Send message**. Every enquiry is **saved to MongoDB** and appears in the admin panel at **`/admin/messages`** — no extra setup beyond `MONGODB_URI` (§6).

In the inbox you can:
- see new enquiries (unread badge in the sidebar, "Latest enquiries" on the dashboard)
- **Reply by email** (opens your email app with a pre-written reply and the original quoted), **WhatsApp** or **Call** in one click
- keep private notes (budget, follow-up date…), mark as replied, archive, search or delete

### Optional: email alerts (Resend)

Add these to also get an email for every new enquiry, with a link straight to it in the inbox:

```
RESEND_API_KEY=re_xxxxxxxx
CONTACT_TO_EMAIL=mcarubul2021@gmail.com
CONTACT_FROM_EMAIL=Portfolio Contact <onboarding@resend.dev>
```

Create a key at https://resend.com/api-keys. `onboarding@resend.dev` can only deliver to the email that owns your Resend account — fine for alerts to yourself. A failed email never loses an enquiry: it's saved first.

**Without a database or Resend** the form never claims success: it explains delivery isn't set up and offers the visitor's email app instead.

Protection: server-side validation, a hidden honeypot field and a "filled too fast" check (bots are silently ignored), 5 messages per 10 minutes per visitor (counted in MongoDB via a one-way hash of the IP — raw IPs are never stored), and HTML-escaped email content.

## 6. Blog & admin panel

Posts and uploaded images are stored in **MongoDB**, so the blog works on read-only hosts like Vercel.

### One-time setup

1. **Database** — create a free cluster at https://www.mongodb.com/cloud/atlas (or use a local `mongodb://127.0.0.1:27017`). In Atlas → *Network Access*, allow `0.0.0.0/0` so Vercel can connect. Copy the connection string into `MONGODB_URI`.
2. **Admin login** — run:

   ```bash
   npm run admin:setup
   ```

   Type a password (12+ characters). It prints `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`; paste them, plus `ADMIN_EMAIL`, into `.env.local`. Only the bcrypt hash is stored — never the password.
3. Restart `npm run dev` and open http://localhost:3000/admin.

Add the same five variables (`MONGODB_URI`, `MONGODB_DB`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`) in Vercel → Settings → Environment Variables, then redeploy.

### Writing posts

| Where | What you can do |
| --- | --- |
| **Dashboard** `/admin` | Published / draft / scheduled counts, total views, posts per month, most-read posts, tags |
| **Posts** `/admin/posts` | Search, filter by status, sort; publish/unpublish, feature, duplicate or delete from the row menu; bulk delete |
| **Editor** | Markdown with a formatting toolbar and live split preview · paste or drop images straight into the text · cover image · tags & category · excerpt · SEO title/description with a search-result preview · schedule by picking a future publish date |
| **Media** `/admin/media` | Upload images (JPG, PNG, WebP, GIF, AVIF, ≤ 4 MB), copy their URL or Markdown, delete |

Keyboard: `Ctrl/⌘+S` save · `Ctrl+B` bold · `Ctrl+I` italic · `Ctrl+K` link · `Ctrl+Shift+P` toggle preview. Unsaved work is backed up in the browser and offered for restore if the tab closes.

Markdown supports GitHub extras: tables, task lists, strikethrough, fenced code with syntax highlighting (` ```js `). Raw HTML is ignored on purpose, so a post can never inject scripts.

**Publishing:** saving revalidates the blog, home page, sitemap and RSS immediately. Scheduled posts appear once their date passes (pages refresh every 5–60 minutes).

### Security

- Session: signed, `httpOnly`, `SameSite=Strict` cookie (7 days); `proxy.js` guards `/admin` and `/api/admin`, and every admin page and API route re-checks it
- Login: bcrypt; 5 failed attempts per 15 minutes per IP, counted in MongoDB so the limit holds across serverless instances
- Sessions are tied to the account: changing the password or email (Profile page) or `ADMIN_SESSION_SECRET` signs out every other session
- Cross-site writes are rejected; uploads are checked by file signature (SVG is not accepted)
- `/admin` is `noindex`, uncached and disallowed in `robots.txt`; HSTS is sent in production

**Changing your name, email or password:** use **Profile** in the admin panel (`/admin/profile`). Changes are saved in MongoDB (`admin_account` collection) and apply immediately — no redeploy. Changing the password signs out every other device; changing the email or password needs your current password.

`ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` are only the *initial* account, used until the first save on the Profile page. **Locked out?** Run `npm run admin:setup`, put the new hash in `ADMIN_PASSWORD_HASH`, and delete the `admin_account` document in MongoDB — the app then falls back to the environment account again.

**If the sign-in page says the hash is invalid:** every `$` in the hash must be written as `\$` in `.env` files (the setup script prints it that way). Paste the same escaped value into Vercel — the app accepts both forms.

### Going live checklist

- [ ] Vercel env vars set: `NEXT_PUBLIC_SITE_URL`, `MONGODB_URI`, `MONGODB_DB`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`
- [ ] MongoDB Atlas → Network Access allows `0.0.0.0/0` (Vercel has no fixed IPs)
- [ ] After deploying: sign in at `https://your-domain/admin`, publish a post, and check it appears on `/blog`
- [ ] Use a strong, unique admin password and keep `.env.local` out of git (it already is via `.gitignore`)

## 7. Deploy to Vercel (recommended)

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/Rubul2024/portfolio.git
   git push -u origin main
   ```
2. Go to https://vercel.com/new, import the repository. Vercel detects Next.js automatically — keep the defaults.
3. In **Settings → Environment Variables**, add `NEXT_PUBLIC_SITE_URL` (e.g. `https://your-project.vercel.app` or your custom domain), the five blog variables from §6, plus the three Resend variables if you want the form live.
4. Deploy. After adding a custom domain, update `NEXT_PUBLIC_SITE_URL` and redeploy.
5. Optional: submit `https://your-domain/sitemap.xml` in Google Search Console. (Indexing happens on Google's schedule.)

Other hosts: any platform that runs Node.js works (`npm run build` then `npm run start`). Netlify and Render both support Next.js.

## 8. Testing checklist

Run through this after `npm run build && npm run start` and again on the deployed site.

**Build & quality**
- [ ] `npm run lint` passes
- [ ] `npm run build` completes without errors
- [ ] No errors in the browser console on `/`, `/projects`, `/blog`, an article, each case study and a 404 URL

**Blog & admin**
- [ ] `/admin` redirects to the sign-in page when signed out; a wrong password is rejected
- [ ] Create a draft → it is *not* visible on `/blog`; publish it → it appears on `/blog`, the home page, `/sitemap.xml` and `/blog/rss.xml`
- [ ] A future publish date shows the post as *Scheduled* and keeps it hidden until then
- [ ] Paste an image into the editor → it uploads and appears in the preview

**Navigation**
- [ ] Every header link scrolls to its section; the active link updates while scrolling
- [ ] Header links work from `/projects` and case-study pages (they return to the home page section)
- [ ] Mobile (< 1024px): menu opens and closes; `Esc` closes it and returns focus to the button; `Tab` stays inside the open menu; tapping a link closes it
- [ ] "Skip to content" appears on first `Tab` press
- [ ] Footer "Back to top" works

**Links**
- [ ] kuwifr.in, digiadssolution.in and allindialabourparty.com open in new tabs
- [ ] GitHub, LinkedIn, Instagram and Facebook point to the right profiles
- [ ] Resume buttons download `public/resume.pdf` (once added)
- [ ] `mailto:` and `tel:` links open the right apps

**Contact form**
- [ ] Submitting empty shows an error on every field, and focus moves to the first one
- [ ] Bad email and a too-short message show clear messages
- [ ] A real submission shows "your message is in" and appears in `/admin/messages` with a *New* badge
- [ ] *Reply by email* opens your email app addressed to the visitor; *WhatsApp* opens their chat
- [ ] With Resend variables: an alert email arrives and its link opens that enquiry in the inbox

**Responsive & accessibility**
- [ ] No horizontal scrolling at 320px, 375px, 768px, 1024px, 1440px (Chrome DevTools device toolbar)
- [ ] Theme toggle switches dark/light and the choice survives a reload
- [ ] With "Reduce motion" turned on in your OS, all content is visible and nothing animates
- [ ] Keyboard-only: every interactive element is reachable and has a visible focus ring
- [ ] Lighthouse (Chrome DevTools → Lighthouse) on the production build — fix anything it flags

**SEO**
- [ ] `/sitemap.xml` and `/robots.txt` load and use your real domain
- [ ] Share the URL in a LinkedIn post preview or https://www.opengraph.xyz to see the social card

## 9. Project structure

```
app/
  layout.jsx            fonts, metadata, theme boot script, JSON-LD, header/footer
  page.jsx              home page sections
  globals.css           Tailwind v4 + design tokens (dark/light)
  projects/page.jsx     filterable project index
  projects/[slug]/      case-study pages (static)
  blog/                 blog index, articles (/blog/[slug]) and rss.xml
  admin/                Blog Studio: login, dashboard, posts, editor, media
  api/admin/            authenticated admin API (login, posts, media)
  api/media/[id]        public image delivery
  api/blog/[slug]/view  view counter
  api/contact/route.js  contact form handler (Resend)
  sitemap.js, robots.js, opengraph-image.jsx, icon.svg, not-found.jsx
components/
  layout/               Navbar, Footer, Wordmark, ThemeToggle, ScrollProgress, RevealObserver
  sections/             Hero, StackDiagram, About, Skills, FeaturedProjects, Experience,
                        Education, GitHubSection, Contact, ContactForm
  projects/             ProjectCard, ProjectGrid, ProjectLinks, ProjectVisual, ProjectCaseStudy
  ui/                   Button, Badge, SectionHeading, Reveal, BrandIcons, SocialLinks
  blog/                 PostCard, PostCover, Markdown, TableOfContents, ShareLinks, ViewTracker
  admin/                AdminShell, PostEditor, MarkdownToolbar, PostsManager, MediaLibrary, …
data/                   all site content
lib/                    site config, validation, utilities, resume check
  db.js, auth.js        MongoDB connection, signed admin sessions
  blog/                 post queries, media storage, validation & Markdown helpers
proxy.js                protects /admin and /api/admin
scripts/admin-setup.mjs generates the admin password hash + session secret
public/                 static files (add resume.pdf here)
```

## 10. Notes on design choices

- **Server Components by default.** Only the navbar, theme toggle, scroll bar, reveal observer, project filter and contact form run on the client.
- **No animation library.** Entrance effects use one `IntersectionObserver` and CSS, so content is never hidden without JavaScript and reduced-motion users see everything immediately.
- **No percentage skill bars, counters or invented stats.** Next.js and Tailwind are shown as "currently building with", not as professional experience.
- **Brand icons** are drawn inline in Lucide's style, because Lucide no longer ships brand logos.
