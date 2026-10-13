import { AdminHeader } from "@/components/admin/AdminShell";
import MessagesInbox from "@/components/admin/MessagesInbox";

export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }) {
  const { open } = await searchParams;
  return (
    <>
      <AdminHeader title="Messages" description="Enquiries from your website's contact form." />
      <MessagesInbox initialOpen={typeof open === "string" && /^[a-f0-9]{24}$/.test(open) ? open : null} />
    </>
  );
}
