import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminShell";
import ProfileManager from "@/components/admin/ProfileManager";
import { getAdminSession } from "@/lib/admin";
import { publicAccount } from "@/lib/admin-account";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <>
      <AdminHeader title="Profile" description="Manage your admin account, sign-in email and password." />
      <ProfileManager initialProfile={publicAccount(session.account)} />
    </>
  );
}
