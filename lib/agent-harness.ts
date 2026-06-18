import {
  getPMWorkflow,
  pmWorkflows,
  type PMWorkflow,
  type PMWorkflowArtifact,
  type PMWorkflowId,
} from "@/lib/pm-workflows";
import { buildProductPackFromIdea, type ProductPack } from "@/lib/product-pack";
import type { WorkflowDefinition, WorkflowStep } from "@/lib/workflow-harness";

export type AgentProviderId = "mock" | "codex" | "claude-code" | "api-fallback";

export type WorkflowId = PMWorkflowId;

export type PermissionMode = "none" | "strict" | "permissive";

export type AgentProvider = {
  id: AgentProviderId;
  displayName: string;
  status: "available" | "planned";
  command: string;
  capabilities: {
    streaming: boolean;
    nativeSkillLoading: boolean;
    fileEditing: boolean;
    resume: boolean;
    permissionMode: PermissionMode;
  };
};

export type WorkflowArtifact = {
  id: string;
  title: string;
  description: string;
  format: "markdown" | "prototype" | "table" | "summary" | "roadmap";
  surface: PMWorkflowArtifact["surface"];
};

export type HarnessWorkflow = {
  id: WorkflowId;
  title: string;
  description: string;
  skillPath: string;
  category: PMWorkflow["category"];
  referenceSkillIds: string[];
  userFacingActions: string[];
  outputArtifacts: WorkflowArtifact[];
};

export type HarnessEvent = {
  type: "queued" | "running" | "artifact" | "done";
  agent: string;
  message: string;
  artifactId?: string;
};

export type AgentRunMode =
  | "mock"
  | "codex-dry-run"
  | "codex-cli"
  | "claude-cli"
  | "claude-dry-run"
  | "api-fallback-dry-run";

export type AdapterRunMetadata = {
  providerId: AgentProviderId;
  mode: AgentRunMode;
  command: string;
  promptPreview?: string;
  outputPreview?: string;
};

export type AgentRunHistoryItem = {
  runId: string;
  providerId: AgentProviderId;
  runMode: AgentRunMode;
  workflowId: WorkflowId;
  projectTitle: string;
  sourceIdea: string;
  createdAt: string;
};

export type GeneratedPack = {
  workflowId: WorkflowId;
  input: string;
  workflow: HarnessWorkflow;
  workflowDefinition?: WorkflowDefinition;
  referenceArchitecture: HarnessReferenceSource[];
  events: HarnessEvent[];
  artifacts: Record<string, string | string[]>;
  productPack: ProductPack;
  runId?: string;
  providerId?: AgentProviderId;
  runMode?: AgentRunMode;
  adapter?: AdapterRunMetadata;
  openDesignPromptPlaceholder?: string;
};

export type HarnessReferenceSource = {
  id: "open-design" | "pm-skills" | "pm-agent-studio";
  title: string;
  localPath: string;
  role: "studio-experience" | "pm-methodology" | "product-integration";
  useFor: string[];
  guardrails: string[];
};

export const harnessReferenceSources: HarnessReferenceSource[] = [
  {
    id: "open-design",
    title: "Open Design",
    localPath: "references/sources/open-design",
    role: "studio-experience",
    useFor: [
      "AI-native studio layout",
      "Artifact Canvas",
      "prototype preview",
      "skill and design-system picker",
      "iframe-style preview",
      "artifact export actions",
    ],
    guardrails: [
      "Copy only the interaction patterns needed by PM Studio.",
      "Do not import OpenDesign source at runtime.",
      "Do not port the daemon or desktop sidecar during the MVP sprint.",
    ],
  },
  {
    id: "pm-skills",
    title: "PM Skills",
    localPath: "references/sources/pm-skills",
    role: "pm-methodology",
    useFor: [
      "Idea-to-Product Pack workflow",
      "PRD generation structure",
      "user stories",
      "roadmap",
      "assumption mapping",
      "user personas",
      "market research",
      "competitor analysis",
      "GTM extensions",
    ],
    guardrails: [
      "Use PM Skills as a method reference, not a runtime dependency.",
      "Do not expose raw plugin or skill names in user-facing UI.",
      "Convert source skills into PM Studio workflows and typed artifacts.",
    ],
  },
  {
    id: "pm-agent-studio",
    title: "PM Agent Studio",
    localPath: ".",
    role: "product-integration",
    useFor: [
      "PM-focused product innovation workspace",
      "agent intake to artifact output",
      "PRD-to-prototype linkage",
      "competition-ready FinSight demo pack",
    ],
    guardrails: [
      "Keep current DESIGN.md visual baseline.",
      "Prioritize deterministic demo value before real AI provider wiring.",
      "Keep generated artifact contracts serializable and provider-neutral.",
    ],
  },
];

export const agentProviders: AgentProvider[] = [
  {
    id: "mock",
    displayName: "Mock PM Studio",
    status: "available",
    command: "in-process",
    capabilities: {
      streaming: true,
      nativeSkillLoading: false,
      fileEditing: false,
      resume: false,
      permissionMode: "none",
    },
  },
  {
    id: "codex",
    displayName: "Codex",
    status: "planned",
    command: "codex exec --cwd <artifact-dir> <prompt>",
    capabilities: {
      streaming: true,
      nativeSkillLoading: true,
      fileEditing: true,
      resume: false,
      permissionMode: "strict",
    },
  },
  {
    id: "claude-code",
    displayName: "Claude Code",
    status: "planned",
    command: "claude --print --output-format stream-json --cwd <artifact-dir> <prompt>",
    capabilities: {
      streaming: true,
      nativeSkillLoading: true,
      fileEditing: true,
      resume: true,
      permissionMode: "strict",
    },
  },
  {
    id: "api-fallback",
    displayName: "API Fallback",
    status: "planned",
    command: "server-side provider call",
    capabilities: {
      streaming: true,
      nativeSkillLoading: false,
      fileEditing: false,
      resume: false,
      permissionMode: "permissive",
    },
  },
];

export const harnessWorkflows: HarnessWorkflow[] = [
  ...pmWorkflows.map(toHarnessWorkflow),
];

function toHarnessWorkflow(workflow: PMWorkflow): HarnessWorkflow {
  return {
    id: workflow.id as WorkflowId,
    title: workflow.name,
    description: workflow.description,
    skillPath: getLocalSkillPath(workflow),
    category: workflow.category,
    referenceSkillIds: workflow.referenceSkillIds,
    userFacingActions: Array.from(
      new Set(workflow.referenceSkills.map((skill) => skill.userFacingAction)),
    ),
    outputArtifacts: workflow.outputArtifacts.map((artifact) => ({
      id: artifact.id,
      title: artifact.name,
      description: artifact.description,
      format: getArtifactFormat(artifact),
      surface: artifact.surface,
    })),
  };
}

function getLocalSkillPath(workflow: PMWorkflow) {
  const paths: Partial<Record<WorkflowId, string>> = {
    "idea-to-product-pack": "skills/idea-to-product-pack/SKILL.md",
    "prd-to-prototype-linker": "skills/prd-prototype-linker/SKILL.md",
    "project-summarizer": "skills/project-summarizer/SKILL.md",
  };

  return paths[workflow.id] ?? workflow.referenceSkills[0]?.sourcePath ?? "references/sources/pm-skills";
}

function getArtifactFormat(artifact: PMWorkflowArtifact): WorkflowArtifact["format"] {
  if (artifact.surface === "prototype") return "prototype";
  if (artifact.surface === "research") return "table";
  if (artifact.surface === "roadmap") return "roadmap";
  if (artifact.surface === "summary") return "summary";

  return "markdown";
}

function getHarnessWorkflow(workflowId: WorkflowId) {
  const workflow = harnessWorkflows.find((item) => item.id === workflowId);

  if (!workflow) {
    throw new Error(`Unknown workflow: ${workflowId}`);
  }

  return workflow;
}

function getArtifactPayloads(productPack: ProductPack, pmWorkflowDescription?: string) {
  return {
    positioning: productPack.project.positioning,
    "target-users": productPack.project.targetUsers,
    "pain-points": productPack.project.painPoints,
    "value-proposition": productPack.project.valueProposition,
    prd: productPack.prd.objective,
    "core-features": productPack.prd.coreFeatures,
    "user-stories": productPack.prd.userStories,
    assumptions: productPack.prd.assumptions,
    "user-flow": productPack.prototype.userFlow,
    "prototype-structure": productPack.prototype.screens.map((screen) => screen.name),
    "prototype-brief": productPack.prototype.openDesignPrompt,
    "prototype-preview": `${productPack.project.title} 原型预览已在 Prototype tab 中展示，可继续接入 iframe-style live artifact。`,
    "market-research": productPack.research.marketOpportunity.map((item) => item.value),
    "competitor-analysis": productPack.competitors.map((item) => item.competitor),
    roadmap: productPack.roadmap.map((item) => `${item.horizon}: ${item.items.join(" / ")}`),
    "executive-summary":
      pmWorkflowDescription ??
      "双参考架构下，OpenDesign 提供工作台和 artifact 体验，pm-skills 提供 PM 方法论和产物结构。",
  };
}

function getStepAgent(step: WorkflowStep) {
  const labels: Record<WorkflowStep["kind"], string> = {
    "agent-run": "Agent 编排",
    "competitor-analysis": "竞品分析",
    export: "方案打包",
    intake: "需求理解",
    "market-research": "市场调研",
    personas: "用户画像",
    prd: "PRD 文档",
    prototype: "原型映射",
    roadmap: "路线图",
    summary: "方案摘要",
  };

  return labels[step.kind];
}

function getStepArtifactId(step: WorkflowStep) {
  return step.outputArtifactIds[0];
}

function buildWorkflowDefinitionEvents({
  productPack,
  workflowDefinition,
}: {
  productPack: ProductPack;
  workflowDefinition: WorkflowDefinition;
}): HarnessEvent[] {
  const enabledSteps = workflowDefinition.steps.filter((step) => step.enabled);

  if (!enabledSteps.length) {
    return [
      {
        type: "queued",
        agent: "Workflow Harness",
        message: "当前编排没有启用步骤，已保留默认 Product Pack 输出。",
      },
    ];
  }

  return enabledSteps.map((step, index) => {
    const isLast = index === enabledSteps.length - 1;
    const isArtifactStep = step.outputArtifactIds.length > 0 && !isLast;

    return {
      type: isLast ? "done" : isArtifactStep ? "artifact" : "running",
      agent: getStepAgent(step),
      artifactId: getStepArtifactId(step),
      message: `${step.title}: ${step.description}（${productPack.project.title}）`,
    };
  });
}

export function generateMockPack({
  workflowId,
  input,
  workflowDefinition,
}: {
  workflowId: WorkflowId;
  input: string;
  workflowDefinition?: WorkflowDefinition;
}): GeneratedPack {
  const workflow = getHarnessWorkflow(workflowId);
  const pmWorkflow = getPMWorkflow(workflowId);
  const productPack = buildProductPackFromIdea(input);
  const baseArtifacts = getArtifactPayloads(productPack, pmWorkflow?.description);

  if (workflowDefinition) {
    return {
      workflowId,
      input,
      workflow,
      workflowDefinition,
      referenceArchitecture: harnessReferenceSources,
      productPack,
      events: buildWorkflowDefinitionEvents({
        productPack,
        workflowDefinition,
      }),
      artifacts: baseArtifacts,
      openDesignPromptPlaceholder: productPack.prototype.openDesignPrompt,
    };
  }

  if (workflowId === "project-summarizer") {
    return {
      workflowId,
      input,
      workflow,
      workflowDefinition,
      referenceArchitecture: harnessReferenceSources,
      productPack,
      events: [
        {
          type: "running",
          agent: "汇报摘要",
          message: `读取 ${productPack.project.title} 的 PRD、原型、竞品和路线图 artifact。`,
        },
        {
          type: "artifact",
          agent: "汇报摘要",
          message: "按目标受众压缩成项目汇报摘要。",
          artifactId: "executive-summary",
        },
        {
          type: "done",
          agent: "方案打包",
          message: "输出决策点、风险和下一步行动。",
        },
      ],
      artifacts: {
        "executive-summary": productPack.summary.headline,
      },
    };
  }

  if (workflowId === "prd-to-prototype-linker") {
    return {
      workflowId,
      input,
      workflow,
      workflowDefinition,
      referenceArchitecture: harnessReferenceSources,
      productPack,
      events: [
        {
          type: "running",
          agent: "PRD 解析",
          message: `参考 pm-skills 的 PRD 与 user story 结构，提取 ${productPack.project.title} 核心功能、角色和任务边界。`,
        },
        {
          type: "artifact",
          agent: "原型映射",
          message: "参考 OpenDesign 的 Artifact Canvas，把功能映射为页面信息架构和可预览原型。",
          artifactId: "prototype",
        },
        {
          type: "done",
          agent: "联动校验",
          message: "输出 PRD 到原型的可评审链路。",
        },
      ],
      artifacts: {
        "core-features": productPack.prd.coreFeatures,
        "user-flow": productPack.prototype.userFlow,
        "prototype-structure": productPack.prototype.screens.map((screen) => screen.name),
        "prototype-brief": productPack.prototype.openDesignPrompt,
        "prototype-preview": `${productPack.project.title} 原型预览已在 Prototype tab 中展示，可继续接入 iframe-style live artifact。`,
      },
      openDesignPromptPlaceholder: productPack.prototype.openDesignPrompt,
    };
  }

  return {
    workflowId,
    input,
    workflow,
    workflowDefinition,
    referenceArchitecture: harnessReferenceSources,
    productPack,
    events: [
      {
        type: "queued",
        agent: "需求理解",
        message: "读取产品想法，选择 Idea-to-Product Pack workflow，并加载双参考架构。",
      },
      {
        type: "running",
        agent: "机会梳理",
        message: "参考 pm-skills discovery / strategy 方法，生成产品定位、目标用户和痛点假设。",
      },
      {
        type: "artifact",
        agent: "PRD 文档",
        message: "参考 pm-execution 的 PRD、user stories 和 roadmap 结构起草 MVP 范围。",
        artifactId: "prd",
      },
      {
        type: "artifact",
        agent: "原型映射",
        message: "参考 OpenDesign 的 Artifact Canvas，把用户流程转成页面结构和原型说明。",
        artifactId: "prototype-structure",
      },
      {
        type: "done",
        agent: "方案摘要",
        message: "整理项目汇报摘要和下一步建议。",
        artifactId: "executive-summary",
      },
    ],
    artifacts: baseArtifacts,
    openDesignPromptPlaceholder: productPack.prototype.openDesignPrompt,
  };
}
