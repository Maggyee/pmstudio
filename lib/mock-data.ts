import {
  BarChart3,
  FileText,
  Flag,
  Layers3,
  LineChart,
  Search,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";

export const featureCards = [
  {
    title: "原型 + PRD",
    description: "把一句想法展开为目标、范围、用户流和可交付 PRD。",
    icon: Layers3,
    accent: "text-emerald-600 bg-emerald-50 ring-emerald-100",
  },
  {
    title: "竞品分析",
    description: "提炼定位、差异点、价格和机会缺口，适合快速判断切入点。",
    icon: Search,
    accent: "text-blue-600 bg-blue-50 ring-blue-100",
  },
  {
    title: "市场调研",
    description: "生成市场规模、用户画像、渠道策略和上市建议。",
    icon: BarChart3,
    accent: "text-amber-600 bg-amber-50 ring-amber-100",
  },
];

export const workflowSteps = ["想法", "PRD", "原型", "调研", "发布"];

export const faqs = [
  {
    question: "PM Studio 会替代产品经理吗？",
    answer: "不会。它更像一个高质量起草和分析助手，帮助你更快形成第一版方案。",
  },
  {
    question: "生成结果可以直接拿去评审吗？",
    answer: "可以。PM Studio 会把 PRD、原型、调研和发布建议组织成同一个项目视图，便于团队讨论、路演和导出。",
  },
  {
    question: "适合哪些场景？",
    answer: "适合创业想法验证、内部新项目立项、独立开发者规划 MVP 和融资路演。",
  },
];

export const agentSteps = [
  {
    title: "理解产品想法",
    detail: "提取目标用户、核心痛点和初始价值主张",
    status: "Done",
    icon: Sparkles,
  },
  {
    title: "生成 PRD 框架",
    detail: "组织问题、目标、功能范围和成功指标",
    status: "Done",
    icon: FileText,
  },
  {
    title: "绘制原型方向",
    detail: "生成首屏、核心交互和信息层级",
    status: "Running",
    icon: Wand2,
  },
  {
    title: "检索竞品信号",
    detail: "分析定位、定价、差异化和风险",
    status: "Queued",
    icon: LineChart,
  },
  {
    title: "输出上市策略",
    detail: "给出早期获客渠道和发布节奏",
    status: "Queued",
    icon: Flag,
  },
];

export const prdSummary = {
  productName: "PM Studio AI 产品经理工作台",
  oneLiner: "面向产品经理的 AI 工作台，帮助用户快速生成 PRD、产品原型、竞品分析和市场调研。",
  problem:
    "产品想法到评审材料之间存在大量重复整理工作，PRD、原型、竞品和汇报摘要常常割裂在不同工具里。",
  objective: "在 10 分钟内把一个产品想法整理成可评审、可编辑、可导出的完整产品方案包。",
  metrics: ["产品方案包生成时间 < 10 分钟", "PRD 到原型映射覆盖率 > 80%", "人工整理时间减少 60%"],
};

export const prdSections = [
  {
    label: "目标用户",
    value: "产品经理、创业者、独立开发者和需要快速准备立项材料的业务负责人。",
  },
  {
    label: "核心价值",
    value: "把模糊想法转成结构化 PRD、可视化原型、竞品方向和汇报摘要。",
  },
  {
    label: "MVP 范围",
    value: "Idea-to-Product Pack、PRD 与原型联动生成、Agent 执行过程和导出能力。",
  },
];

export const scopeItems = [
  "输入产品想法并选择生成目标",
  "多 Agent 拆解定位、用户、痛点和价值主张",
  "生成 PRD 初稿和核心功能清单",
  "从 PRD 映射用户流程和页面信息架构",
  "生成可预览的原型页面结构",
  "导出 Markdown、HTML、PDF、PPTX 项目材料",
];

export const competitors = [
  {
    name: "OpenDesign",
    position: "Agentic 设计工作台",
    strength: "设计系统、技能和多 CLI 接入完整",
    gap: "PM 前期方案包和 PRD 链路可以更垂直",
  },
  {
    name: "Claude Artifacts",
    position: "AI 内容与代码 artifact",
    strength: "生成和迭代体验轻量",
    gap: "缺少产品经理工作流和交付物结构",
  },
  {
    name: "ChatGPT Projects",
    position: "通用 AI 项目空间",
    strength: "对话、资料和任务组织灵活",
    gap: "PRD 与原型联动不是默认工作流",
  },
  {
    name: "Notion AI",
    position: "文档知识库 AI",
    strength: "文档协作和团队知识沉淀强",
    gap: "从需求到原型预览的生成链路较弱",
  },
];

export const marketResearch = [
  {
    label: "市场窗口",
    value: "产品团队正在把 AI 用于早期探索、PRD 起草和原型沟通，但缺少一站式产品方案包。",
  },
  {
    label: "早期切入",
    value: "从产品经理、创业者和独立开发者切入，优先解决立项前的材料准备和沟通效率。",
  },
  {
    label: "增长渠道",
    value: "通过 PM 社群、AI 工具榜单、产品训练营和开源模板传播，用真实产出案例驱动转化。",
  },
];

export const personas = [
  {
    name: "林夏",
    role: "产品经理",
    goal: "把一个方向快速整理成可评审 PRD 和原型",
    pain: "前期材料分散，手工补齐竞品、流程和页面结构耗时",
  },
  {
    name: "Noah",
    role: "创业者",
    goal: "用产品方案包验证想法并准备融资或立项沟通",
    pain: "想法多但表达不系统，难以快速形成完整故事线",
  },
  {
    name: "沈予",
    role: "独立开发者",
    goal: "把需求描述直接转成页面结构和可预览原型",
    pain: "写代码前缺少清晰 IA、用户流程和 MVP 范围",
  },
];

export const resultTabs = [
  {
    id: "prd",
    label: "PRD",
  },
  {
    id: "prototype",
    label: "原型",
  },
  {
    id: "competitors",
    label: "竞品",
  },
  {
    id: "research",
    label: "市场调研",
  },
  {
    id: "personas",
    label: "用户画像",
  },
] as const;

export const projectStats = [
  { label: "PRD 模块", value: "14" },
  { label: "竞品样本", value: "4" },
  { label: "用户画像", value: "3" },
  { label: "路线节点", value: "9" },
];

export const launchPlan = [
  "以 Idea-to-Product Pack 作为免费入口",
  "提供 PRD、原型、竞品分析和市场调研 4 套模板",
  "与 PM 社群和产品训练营合作发布真实案例",
  "团队版增加项目库、评审记录和多 Agent 自定义流程",
];

export const prototypeHighlights = [
  "想法输入",
  "Agent 执行过程",
  "PRD 预览",
  "原型预览",
];

export const studioProjects = [
  "PM Studio AI 产品经理工作台",
  "跨境支付风控平台",
  "中小企业现金流看板",
];

export const studioWorkflows = [
  "完整产品方案包",
  "需求分析 Agent",
  "PRD Agent",
  "竞品分析 Agent",
  "市场调研 Agent",
  "原型设计 Agent",
  "价值评估 Agent",
  "汇报材料 Agent",
];

export const studioDesignSystems = [
  "PM Studio Confirmed",
  "OpenDesign Studio",
  "Linear 风格 SaaS",
  "企业级 B2B",
];

export const studioTemplates = [
  "AI 产品工作台",
  "移动应用",
  "数据看板",
  "融资路演",
];

export const pmAgents = [
  {
    name: "需求分析 Agent",
    responsibility: "拆解目标用户、场景、痛点和产品假设",
    output: "问题定义",
    status: "已完成",
  },
  {
    name: "PRD Agent",
    responsibility: "生成目标、范围、用户故事和验收标准",
    output: "PRD 要点",
    status: "已完成",
  },
  {
    name: "竞品分析 Agent",
    responsibility: "对比定位、功能、定价和差异化机会",
    output: "竞品矩阵",
    status: "运行中",
  },
  {
    name: "市场调研 Agent",
    responsibility: "估算市场规模、趋势窗口和进入策略",
    output: "市场洞察",
    status: "排队中",
  },
  {
    name: "原型设计 Agent",
    responsibility: "把 PRD 要点映射成页面结构和交互草图",
    output: "高保真原型",
    status: "排队中",
  },
  {
    name: "价值评估 Agent",
    responsibility: "评估商业价值、风险、优先级和验证成本",
    output: "价值评分",
    status: "排队中",
  },
  {
    name: "汇报材料 Agent",
    responsibility: "整理路演摘要、路线图和管理层汇报材料",
    output: "汇报包",
    status: "排队中",
  },
];

export const quickPromptChips = [
  "生成完整产品方案",
  "创建 PRD",
  "创建原型",
  "分析竞品",
  "调研市场",
];

export const workflowChecklist = [
  "PRD",
  "原型",
  "竞品分析",
  "市场调研",
  "用户画像",
  "路线图",
];

export const studioTimeline = [
  "Codex / Claude Code 接入准备",
  "需求分析 Agent 建模产品想法",
  "PRD Agent 起草方案包",
  "原型设计 Agent 映射页面结构",
  "竞品分析 Agent 对比市场",
  "总结 Agent 打包汇报摘要",
];

export const studioTabs = [
  "PRD",
  "原型",
  "调研",
  "竞品",
  "画像",
  "路线图",
] as const;

export const artifactActions = [
  "导出 Markdown",
  "导出 PDF",
  "导出 HTML",
  "导出 PPTX",
  "发送到 Codex",
  "在 Open Design 打开",
];

export const studioCoreFeatures = [
  "输入产品想法并自动生成完整产品方案包",
  "从 PRD 中提取核心功能、用户路径和页面需求",
  "把用户流程映射为页面信息架构和原型说明",
  "在同一项目视图中预览 PRD、原型、调研和竞品",
  "支持导出项目材料并发送到 Codex / OpenDesign 工作流",
];

export const studioSuccessMetrics = [
  "首版产品方案生成时间 < 10 分钟",
  "PRD 与原型页面映射覆盖率 > 80%",
  "项目评审材料人工整理时间减少 60%",
  "用户二次编辑采纳率 > 40%",
];

export const studioResearchCards = [
  {
    label: "TAM",
    value: "480 亿美元",
    detail: "全球产品协作、AI 文档和原型工具市场",
  },
  {
    label: "SAM",
    value: "72 亿美元",
    detail: "产品经理、创业者和软件团队的前期方案工具",
  },
  {
    label: "SOM",
    value: "1.2 亿美元",
    detail: "早期采用 AI 生成 PRD、原型和调研的产品团队",
  },
];

export const studioResearchInsights = [
  "用户最缺的不是单份文档，而是从想法到评审材料的连续工作流。",
  "PRD 与原型之间的可追溯映射会成为团队信任 AI 产出的关键。",
  "从一站式方案包切入，比直接承诺全自动产品管理更容易被采用。",
];

export const studioCompetitors = [
  {
    competitor: "OpenDesign",
    positioning: "Agentic 设计和原型工作台",
    strength: "设计系统、技能、插件和多 CLI 接入成熟",
    weakness: "PM 方案包不是最垂直的默认入口",
    opportunity: "用 PM 交付链路聚焦产品经理前期工作",
  },
  {
    competitor: "Claude Artifacts",
    positioning: "AI 对话与 artifact 生成",
    strength: "快速生成内容和代码 artifact",
    weakness: "缺少多交付物项目结构和 PM 工作流",
    opportunity: "把 PRD、原型、调研、汇报打包成项目资产",
  },
  {
    competitor: "ChatGPT Projects",
    positioning: "通用 AI 项目空间",
    strength: "资料、上下文和对话组织灵活",
    weakness: "没有内建 PRD 到原型的可视化链路",
    opportunity: "提供产品方案生成的专用 artifact schema",
  },
  {
    competitor: "Notion AI",
    positioning: "文档协作和知识库 AI",
    strength: "团队文档沉淀和协作编辑强",
    weakness: "原型预览、Agent 编排和导出链路不足",
    opportunity: "从项目启动材料和原型联动切入",
  },
];

export const studioRoadmap = [
  {
    horizon: "现在",
    items: [
      "Idea-to-Product Pack",
      "PRD 初稿生成",
      "原型页面结构",
      "项目汇报摘要",
    ],
  },
  {
    horizon: "下一步",
    items: [
      "PRD 与原型双向联动",
      "Artifact 编辑模式",
      "HTML/PDF/PPTX 导出",
      "Codex / Claude Code 真实接入",
    ],
  },
  {
    horizon: "之后",
    items: [
      "多 Agent 编排",
      "自定义总结归纳 skill",
      "团队项目库",
      "OpenDesign 沙盒预览联动",
    ],
  },
];

export const prdPrototypeAlignment = [
  {
    prdPoint: "用户需要输入产品想法并选择生成目标",
    prototypeBlock: "首页输入区 + 目标选择控件",
    rationale: "把想法、目标和输出范围放在入口，减少用户启动成本。",
  },
  {
    prdPoint: "系统需要展示 Agent 执行过程和中间产物",
    prototypeBlock: "AI 工作台 + Agent 时间线",
    rationale: "让用户知道每个 PM Agent 正在产出什么，提高对 AI 结果的信任。",
  },
  {
    prdPoint: "PRD 需要自动转化为页面结构和可预览原型",
    prototypeBlock: "PRD 预览页 + 原型预览页 + 导出页面",
    rationale: "把文字需求和界面结构放进同一项目，提升评审沟通效率。",
  },
];
