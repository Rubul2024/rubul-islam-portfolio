"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getService } from "@/data/services";

/**
 * Reads ?service=<slug> (from "Discuss this project" links) and reports the
 * matching contact topic. Kept separate and wrapped in <Suspense> by the
 * form, so reading the URL doesn't stop the home page from being static.
 */
export default function ServicePreselect({ onSelect }) {
  const slug = useSearchParams().get("service");

  useEffect(() => {
    const service = slug ? getService(slug) : null;
    if (service) onSelect(service.contactTopic);
  }, [slug, onSelect]);

  return null;
}
