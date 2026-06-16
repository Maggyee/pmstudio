import {
  getPMWorkflow,
  mvpPMWorkflows,
  type PMWorkflow,
  type PMWorkflowArtifact,
} from "@/lib/pm-workflows";

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

  if (workflowId === "project-summarizer") {
    return {
      workflowId,
      input,
      workflow,
      referenceArchitecture: harnessReferenceSources,
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
        "executive-summary":
          "FinSight demo 已覆盖从产品想法到 PRD、原型、调研、竞品和路线图的完整产物链路。当前决策点是先强化编辑预览体验，再接入 Codex / Claude Code 真实运行。",
      },
    };
  }

  if (workflowId === "prd-to-prototype-linker") {
    return {
      workflowId,
      input,
      workflow,
      referenceArchitecture: harnessReferenceSources,
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
        "core-features": [
          "市场雷达自动生成投研摘要",
          "客户持仓与风险偏好导入",
          "AI 生成配置建议和解释话术",
          "合规检查与审阅记录",
          "会后跟进任务和材料导出",
        ],
        "user-flow":
          "选择客户 -> 生成市场简报 -> 匹配配置建议 -> 预览客户解释页 -> 合规审阅 -> 导出跟进材料",
        "prototype-structure": [
          "工作台首页",
          "市场雷达页",
          "客户组合页",
          "配置建议页",
          "合规审阅页",
          "客户材料导出页",
        ],
        "prototype-brief":
          "Use the OpenDesign artifact preview pattern to create a financial-advisor workspace with market radar, recommendation cards, compliance review, and export states.",
        "prototype-preview": "FinSight 原型预览已在 Prototype tab 中展示，可继续接入 iframe-style live artifact。",
      },
      openDesignPromptPlaceholder:
        "参考 OpenDesign 的 artifact preview / iframe 形态，把 FinSight PRD 中的核心任务流生成可编辑页面原型。",
    };
  }

  return {
    workflowId,
    input,
    workflow,
    referenceArchitecture: harnessReferenceSources,
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
      positioning:
        "FinSight 是面向财富顾问的 AI 投研工作台，帮助在会前快速生成市场简报、配置建议、客户解释话术和会后跟进材料。",
      "target-users": ["一线财富顾问", "投研支持团队", "合规审阅人员", "客户经理主管"],
      "pain-points": [
        "市场信息、客户持仓和产品材料分散，顾问会前准备耗时长。",
        "配置建议难以快速转成客户能理解的解释话术。",
        "合规审阅和客户跟进记录割裂，复盘成本高。",
      ],
      "value-proposition":
        "把投研摘要、客户画像、组合建议、合规检查和材料导出串成一个可审阅的顾问工作流。",
      prd:
        "目标是在 10 分钟内生成可评审的财富顾问方案包，覆盖市场雷达、客户组合分析、AI 配置建议、合规审阅和导出交付。",
      "core-features": [
        "市场雷达",
        "客户组合分析",
        "AI 配置建议",
        "客户解释话术",
        "合规审阅",
        "导出项目材料",
      ],
      "user-stories": [
        "作为财富顾问，我想快速生成客户会前简报，以便减少准备时间。",
        "作为投研支持，我想把市场变化转成配置建议，以便顾问能快速复用。",
        "作为合规人员，我想查看建议依据和审阅记录，以便降低沟通风险。",
      ],
      assumptions: [
        "顾问愿意在客户会议前导入持仓和风险偏好。",
        "机构能够提供可用的产品库和合规规则。",
        "AI 生成内容需要人审后才能对客发送。",
      ],
      "prototype-structure": [
        "工作台首页",
        "市场雷达页",
        "客户组合页",
        "配置建议页",
        "合规审阅页",
        "客户材料导出页",
      ],
      "market-research": ["财富管理数字化", "投研内容自动化", "顾问赋能工具", "合规科技"],
      "competitor-analysis": ["Bloomberg Terminal", "同花顺 iFinD", "银行智能投顾", "传统 CRM"],
      roadmap: ["MVP: 会前简报和配置建议", "Next: 合规审阅和客户材料导出", "Later: 机构级投研协作与知识库"],
      "executive-summary":
        pmWorkflow?.description ??
        "双参考架构下，OpenDesign 提供工作台和 artifact 体验，pm-skills 提供 PM 方法论和产物结构。",
    },
    openDesignPromptPlaceholder:
      "参考 OpenDesign 的 Studio Shell、Artifact Canvas 和 prototype preview，把 FinSight 产品方案包转成可编辑原型。",
  };
}
