import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { JobStatus } from "@prisma/client";
import { computeFitScore } from "@/lib/fitscore";
import { generateProposalDraft } from "@/lib/proposal";
import { SHORTLIST_THRESHOLD } from "@/lib/shortlist";
import DraftCard from "./DraftCard";

const terminalOrInProgress: JobStatus[] = [
  "APPLIED",
  "INTERVIEW",
  "WON",
  "LOST",
  "ARCHIVED",
];

async function updateJob(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "NEW") as JobStatus;
  const notes = String(formData.get("notes") || "");

  if (!id) return;

  await prisma.job.update({
    where: { id },
    data: { status, notes },
  });

  redirect(`/jobs/${id}`);
}

async function recalcFitScore(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return;

  const { score, hits } = computeFitScore(job.title, job.description);

  const nextStatus = terminalOrInProgress.includes(job.status)
    ? job.status
    : score >= SHORTLIST_THRESHOLD
      ? "SHORTLISTED"
      : "NEW";

  await prisma.job.update({
    where: { id },
    data: {
      fitScore: score,
      tags: hits.join(","),
      status: nextStatus,
    },
  });

  redirect(`/jobs/${id}`);
}

async function createProposalDraft(formData: FormData) {
  "use server";

  const jobId = String(formData.get("jobId") || "");
  const portfolioId = String(formData.get("portfolioId") || "");
  const timeframe = String(formData.get("timeframe") || "3-5 days");

  if (!jobId) return;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { proposals: { orderBy: { version: "desc" } } },
  });
  if (!job) return;

  const selected = portfolioId
    ? await prisma.portfolioItem.findUnique({ where: { id: portfolioId } })
    : null;

  const latestVersion = job.proposals[0]?.version ?? 0;
  const nextVersion = latestVersion + 1;

  const { draftText, questions, pricingNote } = generateProposalDraft({
    jobTitle: job.title,
    jobDescription: job.description,
    portfolioName: selected?.name ?? "My React UI work",
    portfolioUrl: selected?.urlLive ?? "",
    timeframe,
  });

  await prisma.proposal.create({
    data: {
      jobId,
      version: nextVersion,
      draftText,
      questions,
      pricingNote,
    },
  });

  // Only set DRAFTED if job is not already in a later state
  if (!terminalOrInProgress.includes(job.status)) {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "DRAFTED" },
    });
  }

  redirect(`/jobs/${jobId}`);
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: { proposals: { orderBy: { version: "desc" } } },
  });

  if (!job) return notFound();

  const portfolioItems = await prisma.portfolioItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  const statuses: JobStatus[] = [
    "NEW",
    "SHORTLISTED",
    "DRAFTED",
    "APPLIED",
    "INTERVIEW",
    "WON",
    "LOST",
    "ARCHIVED",
  ];

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/jobs" className="text-sm underline">
            ← Back to inbox
          </Link>

          <h1 className="mt-2 text-2xl font-semibold">{job.title}</h1>

          <p className="mt-1 text-sm text-gray-600">
            {job.platform} • Status: <b>{job.status}</b> • Fit:{" "}
            <b>{job.fitScore}</b>
          </p>
        </div>

        {job.url ? (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border px-4 py-2 text-sm"
          >
            Open Job
          </a>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 text-lg font-medium">Description</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {job.description}
          </pre>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-medium">Update</h2>

          <form action={updateJob} className="space-y-4">
            <input type="hidden" name="id" value={job.id} />

            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                name="status"
                defaultValue={job.status}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea
                name="notes"
                defaultValue={job.notes ?? ""}
                className="min-h-[140px] w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Add notes about this job..."
              />
            </div>

            <button className="rounded-md bg-black px-4 py-2 text-sm text-white">
              Save Changes
            </button>
          </form>

          <form action={recalcFitScore} className="mt-3">
            <input type="hidden" name="id" value={job.id} />
            <button className="w-full rounded-md border px-4 py-2 text-sm">
              Recalculate Fit Score (Auto-Shortlist)
            </button>
          </form>

          <div className="mt-6 border-t pt-4">
            <h3 className="mb-2 text-sm font-semibold">
              Generate Proposal Draft
            </h3>

            <form action={createProposalDraft} className="flex gap-2">
              <input type="hidden" name="jobId" value={job.id} />

              <select
                name="portfolioId"
                className="rounded-md border px-3 py-2 text-sm"
                defaultValue={portfolioItems[0]?.id ?? ""}
              >
                {portfolioItems.length === 0 ? (
                  <option value="">No portfolio items yet</option>
                ) : (
                  portfolioItems.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>

              <input
                name="timeframe"
                defaultValue="3-5 days"
                className="flex-1 rounded-md border px-3 py-2 text-sm"
                placeholder="e.g. 2-3 days"
              />

              <button className="rounded-md bg-black px-4 py-2 text-sm text-white">
                Generate
              </button>
            </form>
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="mb-2 text-sm font-semibold">Proposal Drafts</h3>

            {job.proposals.length === 0 ? (
              <p className="text-sm text-gray-600">No drafts yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {job.proposals.map((p) => (
                  <DraftCard
                    key={p.id}
                    version={p.version}
                    createdAt={new Date(p.createdAt).toLocaleString()}
                    draftText={p.draftText}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
