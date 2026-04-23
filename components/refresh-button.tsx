"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { Locale, getDictionary } from "@/lib/i18n";

export function RefreshButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  const t = getDictionary(locale);
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  async function refreshWorkspace() {
    setMessage("");
    const response = await fetch("/api/refresh", { method: "POST" });
    const payload = (await response.json()) as { message?: string };
    setMessage(payload.message ?? t.common.refreshReady);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={refreshWorkspace}
        disabled={isPending}
        className="focus-ring inline-flex items-center gap-2 rounded-lg border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm font-medium text-cyan transition hover:bg-cyan/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCcw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} aria-hidden="true" />
        {isPending ? t.common.refreshing : t.common.manualRefresh}
      </button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
