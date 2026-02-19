import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Job } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawFilter = resolvedSearchParams?.filter;
  const filter =
    typeof rawFilter === "string"
      ? rawFilter
      : Array.isArray(rawFilter)
      ? rawFilter[0]
      : "all";

  const jobsRaw: Job[] = await prisma.job.findMany({
    orderBy: [{ fitScore: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  const priority: Record<string, number> = {
    SHORTLISTED: 0,
    NEW: 1,
    DRAFTED: 2,
    APPLIED: 3,
    INTERVIEW: 4,
    WON: 5,
    LOST: 6,
    ARCHIVED: 7,
  };

  jobsRaw.sort((a, b) => {
    const pa = priority[a.status] ?? 99;
    const pb = priority[b.status] ?? 99;
    if (pa !== pb) return pa - pb;

    if (a.fitScore !== b.fitScore) return b.fitScore - a.fitScore;

    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const jobs =
    filter === "shortlisted"
      ? jobsRaw.filter((j) => j.status === "SHORTLISTED")
      : jobsRaw;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Job Inbox</h1>

        <div className="flex gap-2">
          <Link
            href="/jobs/new"
            className="rounded-md bg-black px-4 py-2 text-sm text-white"
          >
            Add Job
          </Link>

          <Link href="/import" className="rounded-md border px-4 py-2 text-sm">
            Import Email
          </Link>

          <Link
            href="/portfolio"
            className="rounded-md border px-4 py-2 text-sm"
          >
            Portfolio
          </Link>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="mb-4 flex gap-2 text-sm">
        <Link
          href="/jobs"
          className={`rounded-md border px-3 py-1 ${
            filter === "all" ? "bg-black text-white" : ""
          }`}
        >
          All
        </Link>

        <Link
          href="/jobs?filter=shortlisted"
          className={`rounded-md border px-3 py-1 ${
            filter === "shortlisted" ? "bg-black text-white" : ""
          }`}
        >
          Apply Ready
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p className="text-sm text-gray-600">
          No jobs yet. Click <b>Add Job</b> to create your first entry.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Platform</th>
                <th className="p-3">Status</th>
                <th className="p-3">Fit</th>
                <th className="p-3">Added</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr
                  key={j.id}
                  className={`border-t ${
                    j.status === "SHORTLISTED" ? "bg-green-50" : ""
                  }`}
                >
                  <td className="p-3">
                    <Link href={`/jobs/${j.id}`} className="underline">
                      {j.title}
                    </Link>
                  </td>

                  <td className="p-3">{j.platform}</td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span>{j.status}</span>
                      {j.status === "SHORTLISTED" ? (
                        <span className="rounded-full border px-2 py-0.5 text-xs">
                          Apply Ready
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="p-3">{j.fitScore}</td>

                  <td className="p-3">
                    {new Date(j.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
