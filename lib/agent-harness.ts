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
};

export type HarnessWorkflow = {
  id: WorkflowId;
  title: string;
  description: string;
  skillPath: string;
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
  events: HarnessEvent[];
  artifacts: Record<string, string | string[]>;
};

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
  {
    id: "idea-to-product-pack",
    title: "Idea-to-Product Pack",
    description: "Turn one product idea into a complete PM artifact pack.",
    skillPath: "skills/idea-to-product-pack/SKILL.md",
    outputArtifacts: [
      {
        id: "positioning",
        title: "产品定位",
        description: "Product thesis, target user, pain, and value proposition.",
        format: "summary",
      },
      {
        id: "prd",
        title: "PRD 初稿",
        description: "Objective, scope, features, success metrics, and assumptions.",
        format: "markdown",
      },
      {
        id: "prototype-structure",
        title: "原型页面结构",
        description: "Page IA and screen list for a reviewable prototype.",
        format: "prototype",
      },
      {
        id: "market-competitors",
        title: "市场与竞品方向",
        description: "Opportunity framing and competitor analysis direction.",
        format: "table",
      },
      {
        id: "roadmap",
        title: "MVP 与路线图",
        description: "MVP boundary and staged delivery plan.",
        format: "roadmap",
      },
    ],
  },
  {
    id: "prd-to-prototype-linker",
    title: "PRD 与原型联动生成",
    description: "Convert PRD requirements into user flow, IA, and prototype preview.",
    skillPath: "skills/prd-prototype-linker/SKILL.md",
    outputArtifacts: [
      {
        id: "features",
        title: "核心功能提取",
        description: "Extracted features from PRD content.",
        format: "markdown",
      },
      {
        id: "user-flow",
        title: "用户任务流程",
        description: "Task path from product entry to export.",
        format: "summary",
      },
      {
        id: "prototype",
        title: "可预览页面原型",
        description: "Screen list and preview notes.",
        format: "prototype",
      },
    ],
  },
  {
    id: "project-summarizer",
    title: "自定义总结归纳流程",
    description: "Summarize generated artifacts for review, handoff, or executive reporting.",
    skillPath: "skills/project-summarizer/SKILL.md",
    outputArtifacts: [
      {
        id: "executive-summary",
        title: "项目汇报摘要",
        description: "Decision-focused summary for stakeholders.",
        format: "summary",
      },
    ],
  },
];

export function generateMockPack({
  workflowId,
  input,
}: {
  workflowId: WorkflowId;
  input: string;
}): GeneratedPack {
  if (workflowId === "project-summarizer") {
    return {
      workflowId,
      input,
      events: [
        {
          type: "running",
          agent: "Summary Agent",
          message: "读取 PRD、原型、竞品和路线图 artifact。",
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
          "PM Studio 的 MVP 聚焦一站式产品方案生成和 PRD 原型联动。当前决策点是先接通 Codex/Claude Code 真实运行，还是继续强化编辑预览体验。",
      },
    };
  }

  if (workflowId === "prd-to-prototype-linker") {
    return {
      workflowId,
      input,
      events: [
        {
          type: "running",
          agent: "PRD Agent",
          message: "提取核心功能、角色和任务边界。",
        },
        {
          type: "artifact",
          agent: "Prototype Agent",
          message: "将功能映射为页面信息架构。",
          artifactId: "prototype",
        },
        {
          type: "done",
          agent: "Review Agent",
          message: "输出 PRD 到原型的可评审链路。",
        },
      ],
      artifacts: {
        features: ["输入产品想法", "选择生成目标", "查看 Agent 执行过程", "预览 PRD 和原型", "导出项目材料"],
        "user-flow": "输入想法 -> 选择目标 -> 运行多 Agent -> 查看 PRD -> 预览原型 -> 导出项目包",
        prototype: ["首页", "AI 工作台", "项目详情页", "PRD 预览页", "原型预览页", "导出页面"],
      },
    };
  }

  return {
    workflowId,
    input,
    events: [
      {
        type: "queued",
        agent: "PM Orchestrator",
        message: "读取产品想法并选择 Idea-to-Product Pack workflow。",
      },
      {
        type: "running",
        agent: "需求分析 Agent",
        message: "生成产品定位、目标用户和痛点假设。",
      },
      {
        type: "artifact",
        agent: "PRD Agent",
        message: "起草 PRD、核心功能清单和 MVP 范围。",
        artifactId: "prd",
      },
      {
        type: "artifact",
        agent: "Prototype Agent",
        message: "把用户流程转成页面结构和原型说明。",
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
      positioning: "面向产品经理的 AI 工作台，帮助从想法快速生成 PRD、原型、竞品分析和市场调研。",
      prd: "目标是在 10 分钟内形成可评审的一站式产品方案包，覆盖需求、范围、原型、市场与路线图。",
      "prototype-structure": ["首页", "AI 工作台", "项目详情页", "PRD 预览页", "原型预览页", "导出页面"],
      "market-competitors": ["Notion AI", "ChatGPT Projects", "Claude Artifacts", "OpenDesign", "传统 PRD 模板工具"],
      roadmap: ["MVP: 单想法生成完整方案包", "Next: PRD 与原型双向联动", "Later: 多 Agent 编排与自定义总结流程"],
    },
  };
}
