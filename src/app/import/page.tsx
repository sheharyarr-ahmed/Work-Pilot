import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { parseUpworkEmail } from "@/lib/upworkEmailParser";
import { computeFitScore } from "@/lib/fitscore";
import { SHORTLIST_THRESHOLD } from "@/lib/shortlist";

function fingerprint(title: string, description: string) {
  return `${title}::${description}`.toLowerCase().slice(0, 400);
}

async function importFromEmail(formData: FormData) {
  "use server";

  const raw = String(formData.get("emailText") || "").trim();
  if (!raw) return;

  const parsed = parseUpworkEmail(raw);

  for (const j of parsed) {
    const { score, hits } = computeFitScore(j.title, j.description);

    // Dedup strategy:
    // 1) if URL exists: dedupe by URL
    // 2) otherwise: dedupe by fingerprint of title+description
    if (j.url) {
      const existing = await prisma.job.findFirst({ where: { url: j.url } });
      if (existing) continue;
    } else {
      const fp = fingerprint(j.title, j.description);
      const existing = await prisma.job.findFirst({
        where: {
          AND: [
            { title: j.title },
            { description: { startsWith: fp.split("::")[1] ?? "" } },
          ],
        },
      });
      if (existing) continue;
    }

    await prisma.job.create({
      data: {
        source: "UPWORK_EMAIL",
        platform: j.platform,
        title: j.title,
        url: j.url ?? null,
        description: j.description,
        fitScore: score,
        tags: hits.join(","),
        status: score >= SHORTLIST_THRESHOLD ? "SHORTLISTED" : "NEW",
      },
    });
  }

  redirect("/jobs");
}

export default function ImportPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Import from Upwork Email</h1>
      <p className="mt-2 text-sm text-gray-600">
        Paste the Upwork job alert email content below. We’ll extract jobs and
        add them to your inbox with an auto Fit Score + auto-shortlisting.
      </p>

      <form action={importFromEmail} className="mt-6 space-y-4">
        <textarea
          name="emailText"
          className="min-h-[280px] w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Paste Upwork email text here..."
          required
        />

        <button className="rounded-md bg-black px-4 py-2 text-sm text-white">
          Import Jobs
        </button>
      </form>

      <div className="mt-6 rounded-md border bg-gray-50 p-3 text-sm text-gray-700">
        Tip: If the email format changes, we’ll tweak the parser rules. For now,
        paste full text (including links).
      </div>
    </main>
  );
}
