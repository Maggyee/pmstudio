export type PMSkillArea =
  | "product-planning"
  | "discovery"
  | "strategy"
  | "research"
  | "prototype"
  | "launch";

export type PMSkillReference = {
  id: string;
  sourcePlugin: string;
  sourceSkill: string;
  sourcePath: string;
  area: PMSkillArea;
  userFacingAction: string;
  useFor: string[];
};

export const pmSkillReferences: PMSkillReference[] = [
  {
    id: "create-prd",
    sourcePlugin: "pm-execution",
    sourceSkill: "create-prd",
    sourcePath: "references/sources/pm-skills/pm-execution/skills/create-prd/SKILL.md",
    area: "product-planning",
    userFacingAction: "Generate PRD",
    useFor: ["PRD structure", "problem statement", "scope", "release plan"],
  },
  {
    id: "user-stories",
    sourcePlugin: "pm-execution",
    sourceSkill: "user-stories",
    sourcePath: "references/sources/pm-skills/pm-execution/skills/user-stories/SKILL.md",
    area: "product-planning",
    userFacingAction: "Create User Stories",
    useFor: ["feature breakdown", "acceptance criteria", "backlog handoff"],
  },
  {
    id: "outcome-roadmap",
    sourcePlugin: "pm-execution",
    sourceSkill: "outcome-roadmap",
    sourcePath: "references/sources/pm-skills/pm-execution/skills/outcome-roadmap/SKILL.md",
    area: "product-planning",
    userFacingAction: "Create Roadmap",
    useFor: ["MVP boundary", "delivery phases", "outcome framing"],
  },
  {
    id: "job-stories",
    sourcePlugin: "pm-execution",
    sourceSkill: "job-stories",
    sourcePath: "references/sources/pm-skills/pm-execution/skills/job-stories/SKILL.md",
    area: "prototype",
    userFacingAction: "Map User Tasks",
    useFor: ["task flow", "motivation", "prototype scenario"],
  },
  {
    id: "test-scenarios",
    sourcePlugin: "pm-execution",
    sourceSkill: "test-scenarios",
    sourcePath: "references/sources/pm-skills/pm-execution/skills/test-scenarios/SKILL.md",
    area: "prototype",
    userFacingAction: "Check Prototype Coverage",
    useFor: ["acceptance path", "review criteria", "edge cases"],
  },
  {
    id: "brainstorm-ideas-new",
    sourcePlugin: "pm-product-discovery",
    sourceSkill: "brainstorm-ideas-new",
    sourcePath:
      "references/sources/pm-skills/pm-product-discovery/skills/brainstorm-ideas-new/SKILL.md",
    area: "discovery",
    userFacingAction: "Clarify Product Idea",
    useFor: ["idea expansion", "target user hypotheses", "solution directions"],
  },
  {
    id: "identify-assumptions-new",
    sourcePlugin: "pm-product-discovery",
    sourceSkill: "identify-assumptions-new",
    sourcePath:
      "references/sources/pm-skills/pm-product-discovery/skills/identify-assumptions-new/SKILL.md",
    area: "discovery",
    userFacingAction: "Identify Risk Assumptions",
    useFor: ["value risk", "usability risk", "viability risk", "feasibility risk"],
  },
  {
    id: "opportunity-solution-tree",
    sourcePlugin: "pm-product-discovery",
    sourceSkill: "opportunity-solution-tree",
    sourcePath:
      "references/sources/pm-skills/pm-product-discovery/skills/opportunity-solution-tree/SKILL.md",
    area: "strategy",
    userFacingAction: "Frame Opportunity",
    useFor: ["opportunity summary", "solution options", "experiment ideas"],
  },
  {
    id: "user-personas",
    sourcePlugin: "pm-market-research",
    sourceSkill: "user-personas",
    sourcePath: "references/sources/pm-skills/pm-market-research/skills/user-personas/SKILL.md",
    area: "research",
    userFacingAction: "Create User Personas",
    useFor: ["target users", "jobs", "goals", "pain points"],
  },
  {
    id: "market-sizing",
    sourcePlugin: "pm-market-research",
    sourceSkill: "market-sizing",
    sourcePath: "references/sources/pm-skills/pm-market-research/skills/market-sizing/SKILL.md",
    area: "research",
    userFacingAction: "Estimate Market Opportunity",
    useFor: ["TAM", "SAM", "SOM", "market opportunity"],
  },
  {
    id: "competitor-analysis",
    sourcePlugin: "pm-market-research",
    sourceSkill: "competitor-analysis",
    sourcePath:
      "references/sources/pm-skills/pm-market-research/skills/competitor-analysis/SKILL.md",
    area: "research",
    userFacingAction: "Analyze Competitors",
    useFor: ["competitor matrix", "positioning gaps", "differentiation"],
  },
  {
    id: "gtm-strategy",
    sourcePlugin: "pm-go-to-market",
    sourceSkill: "gtm-strategy",
    sourcePath: "references/sources/pm-skills/pm-go-to-market/skills/gtm-strategy/SKILL.md",
    area: "launch",
    userFacingAction: "Plan GTM",
    useFor: ["future launch plan", "ICP", "GTM motion"],
  },
];

export function getSkillReferences(ids: string[]) {
  const byId = new Map(pmSkillReferences.map((skill) => [skill.id, skill]));

  return ids.map((id) => byId.get(id)).filter((skill): skill is PMSkillReference => Boolean(skill));
}
