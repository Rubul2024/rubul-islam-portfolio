"use client";

import { usePathname } from "next/navigation";

/** Renders its children everywhere except the admin panel, which has its own chrome. */
export default function PublicOnly({ children }) {
  const pathname = usePathname();
  return pathname?.startsWith("/admin") ? null : children;
}
