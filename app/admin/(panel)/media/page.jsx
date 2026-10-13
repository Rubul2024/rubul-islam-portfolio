import { AdminHeader } from "@/components/admin/AdminShell";
import MediaLibrary from "@/components/admin/MediaLibrary";

export const metadata = { title: "Media" };

export default function MediaPage() {
  return (
    <>
      <AdminHeader title="Media library" description="Upload images once, then reuse them as covers or inside posts." />
      <MediaLibrary mode="manage" />
    </>
  );
}
