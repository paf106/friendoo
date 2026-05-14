"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      className="rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-orange-50 transition hover:-translate-y-0.5 hover:bg-stone-800"
    >
      {copied ? "Copiado" : label}
    </button>
  );
}
