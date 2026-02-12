function guessProjectType(text: string) {
  const t = text.toLowerCase();

  if (
    t.includes("landing") ||
    t.includes("marketing") ||
    t.includes("homepage")
  )
    return "a responsive landing page";
  if (t.includes("dashboard") || t.includes("admin") || t.includes("panel"))
    return "a dashboard UI";
  if (t.includes("bug") || t.includes("fix") || t.includes("issue"))
    return "frontend fixes and improvements";
  if (t.includes("figma") || t.includes("design"))
    return "Figma-to-React implementation";
  if (t.includes("api") || t.includes("integration"))
    return "frontend + API integration";

  return "a clean frontend UI";
}

export function generateProposalDraft(args: {
  jobTitle: string;
  jobDescription: string;
  portfolioName?: string;
  portfolioUrl?: string;
  timeframe?: string;
}) {
  const {
    jobTitle,
    jobDescription,
    portfolioName = "a similar project",
    portfolioUrl = "",
    timeframe = "3-5 days",
  } = args;

  const combined = `${jobTitle}\n${jobDescription}`.trim();
  const projectType = guessProjectType(combined);

  const portfolioLine = portfolioUrl
    ? `Relevant work: ${portfolioName} — ${portfolioUrl}`
    : `Relevant work: ${portfolioName}`;

  const draftText = [
    `Hi! I can build ${projectType} for you and deliver a pixel-perfect, responsive result (mobile + desktop).`,
    `Stack: React / Next.js, Tailwind CSS, TypeScript (clean components + reusable UI).`,
    portfolioLine,
    ``,
    `Plan:`,
    `1) Confirm scope + review design/assets (Figma if available)`,
    `2) Build UI components + responsive layout`,
    `3) QA + polish (spacing, accessibility basics, performance)`,
    ``,
    `Timeline: ${timeframe} (depending on scope).`,
    ``,
    `A few quick questions:`,
    `• How many pages/sections do you need?`,
    `• Do you have a Figma/design + content ready?`,
    `• Any API/backend integration needed, or UI-only?`,
  ].join("\n");

  return {
    draftText,
    questions:
      "How many pages/sections do you need?\nDo you have a Figma/design + content ready?\nAny API/backend integration needed, or UI-only?",
    pricingNote:
      "I can quote fixed-price once scope (pages/sections + integrations) is clear.",
  };
}
