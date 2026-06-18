import { pmWorkflows, type PMWorkflowId } from "@/lib/pm-workflows";
import type { AgentProviderId } from "@/lib/agent-harness";

export type WorkflowStepKind =
  | "intake"
  | "prd"
  | "prototype"
  | "market-research"
  | "competitor-analysis"
  | "personas"
  | "roadmap"
  | "summary"
  | "agent-run"
  | "export";

export type WorkflowStep = {
  id: string;
  kind: WorkflowStepKind;
  title: string;
  description: string;
  enabled: boolean;
  inputFrom?: string[];
  outputArtifactIds: string[];
  skillIds: string[];
  providerId?: AgentProviderId;
  promptTemplateId?: string;
  config?: Record<string, string | number | boolean | string[]>;
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  description: string;
  source: "preset" | "custom";
  workflowId?: PMWorkflowId;
  steps: WorkflowStep[];
  outputArtifactIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type WorkflowNodeType = {
  kind: WorkflowStepKind;
  title: string;
  description: string;
  defaultSkillIds: string[];
  defaultOutputArtifactIds: string[];
};

const now = "2026-06-18T00:00:00+08:00";

export const workflowNodeTypes: WorkflowNodeType[] = [
  {
    kind: "intake",
    title: "需求输入",
    description: "收集产品想法、目标用户、成功结果和约束条件。",
    defaultSkillIds: ["brainstorm-ideas-new"],
    defaultOutputArtifactIds: ["positioning", "target-users", "pain-points"],
  },
  {
    kind: "prd",
    title: "生成 PRD",
    description: "按 PM Skills 的 PRD 结构生成问题、目标、范围和验收依据。",
    defaultSkillIds: ["create-prd", "user-stories"],
    defaultOutputArtifactIds: ["prd", "core-features", "user-stories", "assumptions"],
  },
  {
    kind: "prototype",
    title: "生成原型",
    description: "把 PRD 要点映射为 user flow、IA、screen 和可预览 prototype。",
    defaultSkillIds: ["job-stories", "test-scenarios"],
    defaultOutputArtifactIds: ["user-flow", "prototype-structure", "prototype-brief", "prototype-preview"],
  },
  {
    kind: "market-research",
    title: "市场调研",
    description: "估算机会空间、早期切入和关键市场假设。",
    defaultSkillIds: ["market-sizing", "opportunity-solution-tree"],
    defaultOutputArtifactIds: ["market-research"],
  },
  {
    kind: "competitor-analysis",
    title: "竞品分析",
    description: "生成竞品矩阵、差异化机会和竞争风险。",
    defaultSkillIds: ["competitor-analysis"],
    defaultOutputArtifactIds: ["competitor-analysis"],
  },
  {
    kind: "personas",
    title: "用户画像",
    description: "提炼角色、任务、痛点、收益和产品适配度。",
    defaultSkillIds: ["user-personas"],
    defaultOutputArtifactIds: ["target-users"],
  },
  {
    kind: "roadmap",
    title: "路线图",
    description: "用 outcome、指标和依赖组织 MVP、Pilot 和 Scale 阶段。",
    defaultSkillIds: ["outcome-roadmap"],
    defaultOutputArtifactIds: ["roadmap"],
  },
  {
    kind: "summary",
    title: "汇报摘要",
    description: "把当前 artifacts 压缩成决策摘要、风险和下一步行动。",
    defaultSkillIds: ["create-prd", "outcome-roadmap"],
    defaultOutputArtifactIds: ["executive-summary"],
  },
  {
    kind: "agent-run",
    title: "Agent 执行",
    description: "把当前步骤交给 Codex、Claude Code 或 mock provider 运行。",
    defaultSkillIds: [],
    defaultOutputArtifactIds: [],
  },
  {
    kind: "export",
    title: "导出交付包",
    description: "整理 Markdown、HTML、PDF、PPTX 或 OpenDesign handoff。",
    defaultSkillIds: [],
    defaultOutputArtifactIds: ["product-pack"],
  },
];

const nodeTypeByKind = new Map(workflowNodeTypes.map((node) => [node.kind, node]));

function makeStep(
  kind: WorkflowStepKind,
  index: number,
  overrides: Partial<WorkflowStep> = {},
): WorkflowStep {
  const nodeType = nodeTypeByKind.get(kind)!;

  return {
    id: overrides.id ?? `${kind}-${index + 1}`,
    kind,
    title: overrides.title ?? nodeType.title,
    description: overrides.description ?? nodeType.description,
    enabled: overrides.enabled ?? true,
    inputFrom: overrides.inputFrom,
    outputArtifactIds: overrides.outputArtifactIds ?? [...nodeType.defaultOutputArtifactIds],
    skillIds: overrides.skillIds ?? [...nodeType.defaultSkillIds],
    providerId: overrides.providerId,
    promptTemplateId: overrides.promptTemplateId,
    config: overrides.config,
  };
}

function makeDefinition({
  description,
  id,
  name,
  steps,
  workflowId,
}: {
  description: string;
  id: string;
  name: string;
  steps: WorkflowStepKind[];
  workflowId: PMWorkflowId;
}): WorkflowDefinition {
  const workflow = pmWorkflows.find((item) => item.id === workflowId);
  const outputArtifactIds = Array.from(
    new Set(
      steps.flatMap((kind, index) => makeStep(kind, index).outputArtifactIds)
        .concat(workflow?.outputArtifacts.map((artifact) => artifact.id) ?? []),
    ),
  );

  return {
    createdAt: now,
    description,
    id,
    name,
    outputArtifactIds,
    source: "preset",
    steps: steps.map((kind, index) => makeStep(kind, index)),
    updatedAt: now,
    workflowId,
  };
}

export const presetWorkflowDefinitions: WorkflowDefinition[] = [
  makeDefinition({
    id: "preset-idea-to-product-pack",
    workflowId: "idea-to-product-pack",
    name: "完整方案包",
    description: "从一句产品想法生成 PRD、原型、调研、竞品、画像、路线图和摘要。",
    steps: [
      "intake",
      "prd",
      "prototype",
      "market-research",
      "competitor-analysis",
      "personas",
      "roadmap",
      "summary",
      "export",
    ],
  }),
  makeDefinition({
    id: "preset-generate-prd",
    workflowId: "generate-prd",
    name: "PRD",
    description: "生成更完整的产品需求文档、用户故事、风险假设和验收依据。",
    steps: ["intake", "prd", "summary"],
  }),
  makeDefinition({
    id: "preset-prd-to-prototype-linker",
    workflowId: "prd-to-prototype-linker",
    name: "原型",
    description: "把 PRD 要点映射为 user flow、IA、prototype screen 和可预览原型。",
    steps: ["prd", "prototype", "agent-run", "export"],
  }),
  makeDefinition({
    id: "preset-market-research",
    workflowId: "market-research",
    name: "调研",
    description: "围绕市场定义、机会空间、增长驱动和关键假设生成研究文档。",
    steps: ["intake", "market-research", "summary"],
  }),
  makeDefinition({
    id: "preset-competitor-analysis",
    workflowId: "competitor-analysis",
    name: "竞品",
    description: "生成竞品集合、能力对比、差异化机会和定位建议。",
    steps: ["intake", "competitor-analysis", "summary"],
  }),
  makeDefinition({
    id: "preset-user-personas",
    workflowId: "user-personas",
    name: "画像",
    description: "生成用户画像、JTBD、痛点、收益和产品适配度。",
    steps: ["intake", "personas", "summary"],
  }),
  makeDefinition({
    id: "preset-roadmap-generator",
    workflowId: "roadmap-generator",
    name: "路线图",
    description: "把范围和风险转成 outcome roadmap、指标和阶段交付计划。",
    steps: ["intake", "prd", "roadmap", "summary"],
  }),
  makeDefinition({
    id: "preset-project-summarizer",
    workflowId: "project-summarizer",
    name: "汇报摘要",
    description: "把现有 artifacts 整理成评审、交接或路演摘要。",
    steps: ["summary", "export"],
  }),
];

export function cloneWorkflowDefinition(definition: WorkflowDefinition): WorkflowDefinition {
  return {
    ...definition,
    outputArtifactIds: [...definition.outputArtifactIds],
    steps: definition.steps.map((step) => ({
      ...step,
      config: step.config ? { ...step.config } : undefined,
      inputFrom: step.inputFrom ? [...step.inputFrom] : undefined,
      outputArtifactIds: [...step.outputArtifactIds],
      skillIds: [...step.skillIds],
    })),
  };
}

export function getPresetWorkflowDefinition(workflowId: PMWorkflowId | string) {
  const definition = presetWorkflowDefinitions.find(
    (item) => item.workflowId === workflowId || item.id === workflowId,
  );

  return definition ? cloneWorkflowDefinition(definition) : undefined;
}

export function getEnabledWorkflowSteps(definition?: WorkflowDefinition) {
  return definition?.steps.filter((step) => step.enabled) ?? [];
}

export function summarizeWorkflowDefinition(definition?: WorkflowDefinition) {
  if (!definition) return "使用默认 PM Studio workflow。";

  const enabledSteps = getEnabledWorkflowSteps(definition);
  const stepSummary = enabledSteps.map((step, index) => `${index + 1}. ${step.title}`).join(" -> ");

  return `${definition.name}: ${stepSummary}`;
}

export function isWorkflowDefinition(value: unknown): value is WorkflowDefinition {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<WorkflowDefinition>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.description === "string" &&
    Array.isArray(candidate.steps) &&
    candidate.steps.every(
      (step) =>
        typeof step === "object" &&
        step !== null &&
        typeof (step as Partial<WorkflowStep>).id === "string" &&
        typeof (step as Partial<WorkflowStep>).kind === "string" &&
        typeof (step as Partial<WorkflowStep>).title === "string" &&
        typeof (step as Partial<WorkflowStep>).description === "string" &&
        typeof (step as Partial<WorkflowStep>).enabled === "boolean" &&
        Array.isArray((step as Partial<WorkflowStep>).skillIds) &&
        Array.isArray((step as Partial<WorkflowStep>).outputArtifactIds),
    )
  );
}

export function createCustomWorkflowDefinition(
  definition: WorkflowDefinition,
  changes: Partial<WorkflowDefinition>,
): WorkflowDefinition {
  const nextSteps = changes.steps ?? definition.steps;
  const outputArtifactIds = Array.from(
    new Set(nextSteps.filter((step) => step.enabled).flatMap((step) => step.outputArtifactIds)),
  );

  return {
    ...definition,
    ...changes,
    id:
      changes.id ??
      (definition.source === "custom" ? definition.id : `custom-${definition.workflowId ?? "workflow"}`),
    outputArtifactIds,
    source: "custom",
    updatedAt: new Date().toISOString(),
  };
}
