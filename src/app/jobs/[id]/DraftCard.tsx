"use client";

import { useState } from "react";

export default function DraftCard({
  jobId,
  version,
  createdAt,
  draftText,
  markAsApplied,
}: {
  jobId: string;
  version: number;
  createdAt: string;
  draftText: string;
  markAsApplied: (formData: FormData) => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(draftText);
    setCopied(true);

    // submit form programmatically to mark as applied
    const form = new FormData();
    form.append("jobId", jobId);
    await markAsApplied(form);

    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <li className="rounded-md border p-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">v{version}</span>
        <span className="text-gray-600 text-xs">{createdAt}</span>
      </div>

      <pre className="mt-2 whitespace-pre-wrap text-gray-800 text-sm">
        {draftText}
      </pre>

      <button
        onClick={handleCopy}
        className="mt-3 rounded-md bg-black px-3 py-1.5 text-sm text-white"
      >
        {copied ? "Copied ✓ (Marked APPLIED)" : "Copy & Mark APPLIED"}
      </button>
    </li>
  );
}
