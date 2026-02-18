"use client";

import { useState } from "react";

export default function DraftCard({
  version,
  createdAt,
  draftText,
}: {
  version: number;
  createdAt: string;
  draftText: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(draftText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback (rare)
      const ta = document.createElement("textarea");
      ta.value = draftText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);

      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <li className="rounded-md border p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">v{version}</span>
          <span className="text-gray-600">{createdAt}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border px-3 py-1 text-xs"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
        {draftText}
      </pre>
    </li>
  );
}
