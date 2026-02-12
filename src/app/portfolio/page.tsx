import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function addPortfolioItem(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const urlLive = String(formData.get("urlLive") || "").trim();
  const urlGithub = String(formData.get("urlGithub") || "").trim();
  const keywords = String(formData.get("keywords") || "").trim();

  if (!name || !urlLive || !keywords) return;

  await prisma.portfolioItem.create({
    data: {
      name,
      urlLive,
      urlGithub: urlGithub || null,
      keywords,
    },
  });

  redirect("/portfolio");
}

async function deletePortfolioItem(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.portfolioItem.delete({ where: { id } });
  redirect("/portfolio");
}

export default async function PortfolioPage() {
  const items = await prisma.portfolioItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Portfolio</h1>
      </div>

      <section className="mb-8 rounded-lg border p-4">
        <h2 className="mb-3 text-lg font-medium">Add Portfolio Item</h2>

        <form action={addPortfolioItem} className="grid gap-3 md:grid-cols-2">
          <input
            name="name"
            className="rounded-md border px-3 py-2 text-sm"
            placeholder="Project name (e.g., Fitness Tracker App)"
            required
          />
          <input
            name="urlLive"
            className="rounded-md border px-3 py-2 text-sm"
            placeholder="Live URL (https://...)"
            required
          />
          <input
            name="urlGithub"
            className="rounded-md border px-3 py-2 text-sm"
            placeholder="GitHub URL (optional)"
          />
          <input
            name="keywords"
            className="rounded-md border px-3 py-2 text-sm"
            placeholder="keywords (comma-separated) e.g. landing,react,tailwind"
            required
          />

          <button className="rounded-md bg-black px-4 py-2 text-sm text-white md:col-span-2">
            Add
          </button>
        </form>
      </section>

      <section className="rounded-lg border">
        <div className="border-b p-4">
          <h2 className="text-lg font-medium">Saved Items</h2>
        </div>

        {items.length === 0 ? (
          <p className="p-4 text-sm text-gray-600">No portfolio items yet.</p>
        ) : (
          <ul className="divide-y">
            {items.map((it) => (
              <li key={it.id} className="p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-600">
                      <a
                        className="underline"
                        href={it.urlLive}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Live
                      </a>
                      {it.urlGithub ? (
                        <>
                          {" "}
                          •{" "}
                          <a
                            className="underline"
                            href={it.urlGithub}
                            target="_blank"
                            rel="noreferrer"
                          >
                            GitHub
                          </a>
                        </>
                      ) : null}{" "}
                      • Keywords: {it.keywords}
                    </div>
                  </div>

                  <form action={deletePortfolioItem}>
                    <input type="hidden" name="id" value={it.id} />
                    <button className="rounded-md border px-3 py-2 text-sm">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
