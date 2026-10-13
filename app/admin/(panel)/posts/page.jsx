import Link from "next/link";
import { PenSquare } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminShell";
import PostsManager from "@/components/admin/PostsManager";
import { buttonClass } from "@/components/admin/styles";

export const metadata = { title: "Posts" };

export default async function PostsPage({ searchParams }) {
  const sp = await searchParams;
  const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);
  const initial = {
    q: typeof sp.q === "string" ? sp.q : "",
    status: pick(sp.status, ["all", "published", "draft", "scheduled", "featured"], "all"),
    sort: pick(sp.sort, ["updated", "newest", "published", "views", "title"], "updated"),
    page: Math.max(1, Number(sp.page) || 1),
  };

  return (
    <>
      <AdminHeader
        title="Posts"
        description="Write, edit, schedule and organise your articles."
        actions={
          <Link href="/admin/posts/new" className={buttonClass.primary}>
            <PenSquare size={16} aria-hidden="true" /> New post
          </Link>
        }
      />
      <PostsManager initial={initial} />
    </>
  );
}
