"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { buttonClass } from "@/components/admin/styles";

/** Shown inside the admin shell when a screen fails, e.g. the database is unreachable. */
export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <AlertTriangle size={32} aria-hidden="true" className="mx-auto text-danger" />
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-fg">This screen couldn&apos;t load</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Usually this means the database couldn&apos;t be reached. Check that <code className="font-mono">MONGODB_URI</code> is
        correct and that your MongoDB Atlas <em>Network Access</em> list allows this server.
      </p>
      {error?.digest && <p className="mt-3 font-mono text-[11px] text-subtle">Reference: {error.digest}</p>}
      <div className="mt-6 flex justify-center gap-2">
        <button type="button" onClick={reset} className={buttonClass.primary}>
          <RotateCcw size={15} aria-hidden="true" /> Try again
        </button>
        <Link href="/admin" className={buttonClass.secondary}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}
