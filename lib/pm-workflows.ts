import { getSkillReferences, type PMSkillReference } from "@/lib/pm-skills-registry";

export type PMWorkflowId =
  | "idea-to-product-pack"
  | "generate-prd"
  | "prd-to-prototype-linker"
  | "user-personas"
  | "market-research"
  | "competitor-analysis"
  | "roadmap-generator"
  | "project-summarizer";

export type PMWorkflowCategory =
  | "strategy"
  | "execution"
  | "research"
  | "prototype"
  | "launch";

export type PMWorkflowStatus = "mvp" | "next" | "future";

export type PMWorkflowArtifactId =
  | "positioning"
  | "target-users"
  | "pain-points"
  | "value-proposition"
  | "prd"
  | "core-features"
  | "user-stories"
  | "assumptions"
  | "user-flow"
  | "prototype-structure"
  | "prototype-brief"
  | "prototype-preview"
  | "market-research"
  | "competitor-analysis"
  | "roadmap"
  | "executive-summary";

export type PMWorkflowArtifact = {
  id: PMWorkflowArtifactId;
  name: string;
  description: string;
  surface: "product-pack" | "prd" | "prototype" | "research" | "roadmap" | "summary";
};

export type PMWorkflow = {
  id: PMWorkflowId;
  name: string;
  description: string;
  category: PMWorkflowCategory;
  status: PMWorkflowStatus;
  referenceSkillIds: string[];
  referenceSkills: PMSkillReference[];
  outputArtifacts: PMWorkflowArtifact[];
};

function buildWorkflow({
  referenceSkillIds,
  ...workflow
}: Omit<PMWorkflow, "referenceSkills">): PMWorkflow {
  return {
    ...workflow,
    referenceSkillIds,
    referenceSkills: getSkillReferences(referenceSkillIds),
  };
}

export const pmWorkflows: PMWorkflow[] = [
  buildWorkflow({
    id: "idea-to-product-pack",
    name: "Idea-to-Product Pack",
    description: "Turn one product idea into a complete product planning pack.",
    category: "strategy",
    status: "mvp",
    referenceSkillIds: [
      "brainstorm-ideas-new",
      "identify-assumptions-new",
      "opportunity-solution-tree",
      "create-prd",
      "user-stories",
      "outcome-roadmap",
      "user-personas",
      "market-sizing",
      "competitor-analysis",
    ],
    outputArtifacts: [
      {
        id: "positioning",
        name: "Product Positioning",
        description: "Product thesis, target user, pain, and strategic context.",
        surface: "product-pack",
      },
      {
        id: "prd",
        name: "PRD",
        description: "Problem, objectives, requirements, scope, and release plan.",
        surface: "prd",
      },
      {
        id: "user-stories",
        name: "User Stories",
        description: "User-facing backlog items with acceptance criteria.",
        surface: "prd",
      },
      {
        id: "market-research",
        name: "Market Research",
        description: "Market opportunity, target segments, and sizing notes.",
        surface: "research",
      },
      {
        id: "competitor-analysis",
        name: "Competitor Analysis",
        description: "Competitor table, strengths, weaknesses, and positioning gaps.",
        surface: "research",
      },
      {
        id: "prototype-structure",
        name: "Prototype Page Structure",
        description: "Page list and information architecture for a previewable prototype.",
        surface: "prototype",
      },
      {
        id: "roadmap",
        name: "Roadmap",
        description: "MVP boundary and staged delivery plan.",
        surface: "roadmap",
      },
      {
        id: "executive-summary",
        name: "Project Summary",
        description: "Decision-focused summary for review or handoff.",
        surface: "summary",
      },
    ],
  }),
  buildWorkflow({
    id: "prd-to-prototype-linker",
    name: "PRD to Prototype",
    description: "Map PRD requirements into user flows, pages, and prototype structure.",
    category: "prototype",
    status: "mvp",
    referenceSkillIds: [
      "create-prd",
      "user-stories",
      "job-stories",
      "test-scenarios",
      "outcome-roadmap",
    ],
    outputArtifacts: [
      {
        id: "core-features",
        name: "Core Feature Extraction",
        description: "Requirements and features extracted from the PRD.",
        surface: "prd",
      },
      {
        id: "user-flow",
        name: "User Flow",
        description: "Task path from entry point to generated output.",
        surface: "prototype",
      },
      {
        id: "prototype-structure",
        name: "Page Structure",
        description: "Screen list, goals, and component suggestions.",
        surface: "prototype",
      },
      {
        id: "prototype-brief",
        name: "Prototype Brief",
        description: "OpenDesign-style prompt placeholder for prototype generation.",
        surface: "prototype",
      },
      {
        id: "prototype-preview",
        name: "Mock Prototype Preview",
        description: "Reviewable preview artifact for the generated screen concept.",
        surface: "prototype",
      },
    ],
  }),
  buildWorkflow({
    id: "generate-prd",
    name: "Generate PRD",
    description: "Create a structured PRD from product context and selected goals.",
    category: "execution",
    status: "next",
    referenceSkillIds: ["create-prd", "user-stories", "identify-assumptions-new"],
    outputArtifacts: [
      {
        id: "prd",
        name: "PRD",
        description: "Structured PRD draft.",
        surface: "prd",
      },
      {
        id: "assumptions",
        name: "Risk Assumptions",
        description: "Value, usability, viability, and feasibility risks.",
        surface: "prd",
      },
    ],
  }),
  buildWorkflow({
    id: "user-personas",
    name: "User Personas",
    description: "Create user personas and jobs from product context.",
    category: "research",
    status: "next",
    referenceSkillIds: ["user-personas"],
    outputArtifacts: [
      {
        id: "target-users",
        name: "User Personas",
        description: "Target user roles, goals, pain points, and jobs.",
        surface: "research",
      },
    ],
  }),
  buildWorkflow({
    id: "market-research",
    name: "Market Research",
    description: "Estimate market opportunity and summarize research direction.",
    category: "research",
    status: "next",
    referenceSkillIds: ["market-sizing", "opportunity-solution-tree"],
    outputArtifacts: [
      {
        id: "market-research",
        name: "Market Opportunity",
        description: "Market size, segment notes, and opportunity summary.",
        surface: "research",
      },
    ],
  }),
  buildWorkflow({
    id: "competitor-analysis",
    name: "Competitor Analysis",
    description: "Create a competitor matrix and differentiation summary.",
    category: "research",
    status: "next",
    referenceSkillIds: ["competitor-analysis"],
    outputArtifacts: [
      {
        id: "competitor-analysis",
        name: "Competitor Matrix",
        description: "Competitor positioning, strengths, weaknesses, and gaps.",
        surface: "research",
      },
    ],
  }),
  buildWorkflow({
    id: "roadmap-generator",
    name: "Roadmap",
    description: "Turn scope into an outcome-oriented roadmap.",
    category: "execution",
    status: "next",
    referenceSkillIds: ["outcome-roadmap"],
    outputArtifacts: [
      {
        id: "roadmap",
        name: "Roadmap",
        description: "Outcome roadmap with staged delivery phases.",
        surface: "roadmap",
      },
    ],
  }),
  buildWorkflow({
    id: "project-summarizer",
    name: "Project Summary",
    description: "Summarize generated artifacts for review, handoff, or executive reporting.",
    category: "execution",
    status: "mvp",
    referenceSkillIds: ["create-prd", "outcome-roadmap", "competitor-analysis"],
    outputArtifacts: [
      {
        id: "executive-summary",
        name: "Project Summary",
        description: "Decision-focused summary for stakeholders.",
        surface: "summary",
      },
    ],
  }),
];

export const mvpPMWorkflows = pmWorkflows.filter((workflow) => workflow.status === "mvp");

export function getPMWorkflow(id: PMWorkflowId) {
  return pmWorkflows.find((workflow) => workflow.id === id);
}

export function getPublicPMWorkflows() {
  return pmWorkflows.map(({ referenceSkills: _referenceSkills, referenceSkillIds: _ids, ...workflow }) => ({
    ...workflow,
  }));
}
