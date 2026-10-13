import { notFound } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import { getPostById } from "@/lib/blog/posts";
import { isDbConfigured } from "@/lib/db";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = isDbConfigured() ? await getPostById(id).catch(() => null) : null;
  return { title: post ? `Edit: ${post.title}` : "Edit post" };
}

export default async function EditPostPage({ params }) {
  const { id } = await params;
  if (!isDbConfigured()) notFound();
  const post = await getPostById(id);
  if (!post) notFound();
  // key: remount the editor when navigating between posts
  return <PostEditor key={post.id} post={post} />;
}
