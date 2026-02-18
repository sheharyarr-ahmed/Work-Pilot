type Rule = {
  label: string;
  weight: number;
  terms: string[];
};

const RULES: Rule[] = [
  { label: "react", weight: 25, terms: ["react", "reactjs", "react.js"] },
  { label: "next", weight: 25, terms: ["next", "nextjs", "next.js"] },
  { label: "ts", weight: 15, terms: ["typescript", " type script ", " ts "] },
  { label: "tailwind", weight: 15, terms: ["tailwind", "tailwindcss"] },
  {
    label: "ui",
    weight: 10,
    terms: ["frontend", "ui", "responsive", "landing page", "dashboard"],
  },
  { label: "api", weight: 10, terms: ["api", "rest", "graphql"] },
];

// penalties (to avoid wasting time)
const PENALTIES: Rule[] = [
  {
    label: "senior",
    weight: -25,
    terms: ["senior", "10+ years", "expert only", "lead developer"],
  },
  {
    label: "fullstack-heavy",
    weight: -20,
    terms: ["backend + frontend", "devops", "kubernetes", "microservices"],
  },
];

export function computeFitScore(title: string, description: string) {
  const text = `${title}\n${description}`.toLowerCase();

  let score = 0;
  const hits: string[] = [];

  for (const r of RULES) {
    const found = r.terms.some((t) => text.includes(t));
    if (found) {
      score += r.weight;
      hits.push(r.label);
    }
  }

  for (const p of PENALTIES) {
    const found = p.terms.some((t) => text.includes(t));
    if (found) {
      score += p.weight;
      hits.push(`-${p.label}`);
    }
  }

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return { score, hits };
}
