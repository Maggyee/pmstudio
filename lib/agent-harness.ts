import {
  getPMWorkflow,
  mvpPMWorkflows,
  type PMWorkflow,
  type PMWorkflowArtifact,
} from "@/lib/pm-workflows";
import { buildFinSightProductPack, type ProductPack } from "@/lib/product-pack";

export type AgentProviderId = "mock" | "codex" | "claude-code" | "api-fallback";

export type WorkflowId =
  | "idea-to-product-pack"
  | "prd-to-prototype-linker"
  | "project-summarizer";

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

export type GeneratedPack = {
  workflowId: WorkflowId;
  input: string;
  workflow: HarnessWorkflow;
  referenceArchitecture: HarnessReferenceSource[];
  events: HarnessEvent[];
  artifacts: Record<string, string | string[]>;
  productPack: ProductPack;
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
    displayName: "Mock PM Agent",
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
  ...mvpPMWorkflows.map(toHarnessWorkflow),
];

function toHarnessWorkflow(workflow: PMWorkflow): HarnessWorkflow {
  return {
    id: workflow.id as WorkflowId,
    title: workflow.name,
    description: workflow.description,
    skillPath: getLocalSkillPath(workflow.id as WorkflowId),
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

function getLocalSkillPath(workflowId: WorkflowId) {
  const paths: Record<WorkflowId, string> = {
    "idea-to-product-pack": "skills/idea-to-product-pack/SKILL.md",
    "prd-to-prototype-linker": "skills/prd-prototype-linker/SKILL.md",
    "project-summarizer": "skills/project-summarizer/SKILL.md",
  };

  return paths[workflowId];
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

export function generateMockPack({
  workflowId,
  input,
}: {
  workflowId: WorkflowId;
  input: string;
}): GeneratedPack {
  const workflow = getHarnessWorkflow(workflowId);
  const pmWorkflow = getPMWorkflow(workflowId);
  const productPack = buildFinSightProductPack(input);

  if (workflowId === "project-summarizer") {
    return {
      workflowId,
      input,
      workflow,
      referenceArchitecture: harnessReferenceSources,
      productPack,
      events: [
        {
          type: "running",
          agent: "Summary Agent",
          message: "读取 FinSight 的 PRD、原型、竞品和路线图 artifact。",
        },
        {
          type: "artifact",
          agent: "Summary Agent",
          message: "按目标受众压缩成项目汇报摘要。",
          artifactId: "executive-summary",
        },
        {
          type: "done",
          agent: "PM Orchestrator",
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
      referenceArchitecture: harnessReferenceSources,
      productPack,
      events: [
        {
          type: "running",
          agent: "PRD Agent",
          message: "参考 pm-skills 的 PRD 与 user story 结构，提取 FinSight 核心功能、角色和任务边界。",
        },
        {
          type: "artifact",
          agent: "Prototype Agent",
          message: "参考 OpenDesign 的 Artifact Canvas，把功能映射为页面信息架构和可预览原型。",
          artifactId: "prototype",
        },
        {
          type: "done",
          agent: "Review Agent",
          message: "输出 PRD 到原型的可评审链路。",
        },
      ],
      artifacts: {
        "core-features": productPack.prd.coreFeatures,
        "user-flow": productPack.prototype.userFlow,
        "prototype-structure": productPack.prototype.screens.map((screen) => screen.name),
        "prototype-brief": productPack.prototype.openDesignPrompt,
        "prototype-preview": "FinSight 原型预览已在 Prototype tab 中展示，可继续接入 iframe-style live artifact。",
      },
      openDesignPromptPlaceholder: productPack.prototype.openDesignPrompt,
    };
  }

  return {
    workflowId,
    input,
    workflow,
    referenceArchitecture: harnessReferenceSources,
    productPack,
    events: [
      {
        type: "queued",
        agent: "PM Orchestrator",
        message: "读取产品想法，选择 Idea-to-Product Pack workflow，并加载双参考架构。",
      },
      {
        type: "running",
        agent: "需求分析 Agent",
        message: "参考 pm-skills discovery / strategy 方法，生成产品定位、目标用户和痛点假设。",
      },
      {
        type: "artifact",
        agent: "PRD Agent",
        message: "参考 pm-execution 的 PRD、user stories 和 roadmap 结构起草 MVP 范围。",
        artifactId: "prd",
      },
      {
        type: "artifact",
        agent: "Prototype Agent",
        message: "参考 OpenDesign 的 Artifact Canvas，把用户流程转成页面结构和原型说明。",
        artifactId: "prototype-structure",
      },
      {
        type: "done",
        agent: "Summary Agent",
        message: "整理项目汇报摘要和下一步建议。",
        artifactId: "executive-summary",
      },
    ],
    artifacts: {
      positioning: productPack.project.positioning,
      "target-users": productPack.project.targetUsers,
      "pain-points": productPack.project.painPoints,
      "value-proposition": productPack.project.valueProposition,
      prd: productPack.prd.objective,
      "core-features": productPack.prd.coreFeatures,
      "user-stories": productPack.prd.userStories,
      assumptions: productPack.prd.assumptions,
      "prototype-structure": productPack.prototype.screens.map((screen) => screen.name),
      "market-research": productPack.research.marketOpportunity.map((item) => item.value),
      "competitor-analysis": productPack.competitors.map((item) => item.competitor),
      roadmap: productPack.roadmap.map((item) => `${item.horizon}: ${item.items.join(" / ")}`),
      "executive-summary":
        pmWorkflow?.description ??
        "双参考架构下，OpenDesign 提供工作台和 artifact 体验，pm-skills 提供 PM 方法论和产物结构。",
    },
    openDesignPromptPlaceholder: productPack.prototype.openDesignPrompt,
  };
}
