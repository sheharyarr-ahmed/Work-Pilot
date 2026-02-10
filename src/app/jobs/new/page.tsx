import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function createJob(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  const platform = String(formData.get("platform") || "Upwork").trim();
  const url = String(formData.get("url") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!title || !description) return;

  await prisma.job.create({
    data: {
      title,
      platform,
      url: url || null,
      description,
      source: "MANUAL",
    },
  });

  redirect("/jobs");
}

export default function NewJobPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Add Job</h1>

      <form action={createJob} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Title *</label>
          <input
            name="title"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="React landing page needed..."
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Platform</label>
          <input
            name="platform"
            className="w-full rounded-md border px-3 py-2 text-sm"
            defaultValue="Upwork"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Job URL</label>
          <input
            name="url"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Description *
          </label>
          <textarea
            name="description"
            className="min-h-[160px] w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Paste job description here..."
            required
          />
        </div>

        <button className="rounded-md bg-black px-4 py-2 text-sm text-white">
          Save Job
        </button>
      </form>
    </main>
  );
}
