type ParsedJob = {
  title: string;
  url?: string;
  description: string;
  platform: string; // "Upwork"
};

function cleanText(s: string) {
  return s.replace(/\r/g, "").trim();
}

function firstUrl(block: string) {
  const m = block.match(/https?:\/\/[^\s)]+/);
  return m ? m[0] : undefined;
}

/**
 * Very practical parser approach:
 * - Split email text into blocks by blank lines
 * - Detect blocks containing a URL + some text
 * - Extract title (first non-empty line)
 * - Extract description (remaining lines)
 *
 * It works for most pasted Upwork job alert emails.
 * If Upwork changes formatting, we adjust later.
 */
export function parseUpworkEmail(raw: string): ParsedJob[] {
  const text = cleanText(raw);
  if (!text) return [];

  // Split into rough blocks (2+ newlines)
  const blocks = text
    .split(/\n{2,}/g)
    .map(cleanText)
    .filter(Boolean);

  const jobs: ParsedJob[] = [];

  for (const b of blocks) {
    const url = firstUrl(b);
    // Heuristic: a job entry usually contains a URL and at least 2 lines
    const lines = b
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    if (!url || lines.length < 2) continue;

    // Title: first line that isn't just "View job" etc.
    let title = lines[0];
    const badTitles = ["view job", "apply now", "upwork", "job", "new job"];
    if (badTitles.includes(title.toLowerCase())) {
      title = lines[1] ?? title;
    }

    // Description: everything except title line (cap length)
    const description = lines.slice(1).join("\n").slice(0, 5000);

    // Avoid duplicates
    const exists = jobs.some(
      (j) => (j.url && url && j.url === url) || j.title === title,
    );
    if (exists) continue;

    jobs.push({
      title: title.slice(0, 200),
      url,
      description: description || "Imported from email.",
      platform: "Upwork",
    });
  }

  // If nothing found, fallback: import as one job (so user doesn't lose data)
  if (jobs.length === 0) {
    const url = firstUrl(text);
    const lines = text
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    const title = lines[0]?.slice(0, 200) || "Imported job";
    const description =
      lines.slice(1).join("\n").slice(0, 5000) || text.slice(0, 5000);
    jobs.push({ title, url, description, platform: "Upwork" });
  }

  return jobs;
}
