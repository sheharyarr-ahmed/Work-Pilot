import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

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
                <tr key={j.id} className="border-t">
                  <td className="p-3">
                    <Link href={`/jobs/${j.id}`} className="underline">
                      {j.title}
                    </Link>
                  </td>
                  <td className="p-3">{j.platform}</td>
                  <td className="p-3">{j.status}</td>
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
