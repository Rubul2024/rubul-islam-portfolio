import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import Reveal from "@/components/ui/Reveal";
import { githubUrl } from "@/data/social-links";

// Deliberately static: no live API calls, no star/follower counts. Add
// verified public repositories to `featuredRepos` to list them here.
const featuredRepos = [
  // { name: "repo-name", description: "What it is", href: "https://github.com/Rubul2024/repo-name", language: "JavaScript" },
];

export default function GitHubSection() {
  return (
    <section aria-labelledby="github-title" className="border-t border-line">
      <div className="container-x py-14 md:py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-card p-7 sm:p-10">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)]"
            />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-line-strong bg-bg-2 text-fg">
                  <GithubIcon size={22} />
                </span>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-subtle">Open source & code</p>
                  <h2 id="github-title" className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                    See how I write code.
                  </h2>
                  <p className="mt-2 max-w-xl text-muted">
                    Repositories, experiments and coursework live on my GitHub profile.
                  </p>
                </div>
              </div>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-fg px-6 text-[15px] font-medium text-bg transition-transform active:scale-[0.98] md:self-auto"
              >
                Explore My GitHub
                <ArrowUpRight size={18} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>

            {featuredRepos.length > 0 && (
              <ul className="relative mt-8 grid gap-3 border-t border-line pt-8 md:grid-cols-3">
                {featuredRepos.map((repo) => (
                  <li key={repo.name}>
                    <a
                      href={repo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full rounded-xl border border-line bg-bg-2 p-4 transition-colors hover:border-line-strong"
                    >
                      <p className="font-mono text-sm text-fg">{repo.name}</p>
                      <p className="mt-1.5 text-[13px] text-muted">{repo.description}</p>
                      {repo.language && <p className="mt-3 font-mono text-[11px] text-subtle">{repo.language}</p>}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
