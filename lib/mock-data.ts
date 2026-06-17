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
  productName: "FinSight 智能投研工作台",
  oneLiner: "面向理财顾问和财富管理团队的 AI 投研、配置建议与客户沟通工作台。",
  problem:
    "财富管理团队每天要处理宏观资讯、产品池、客户风险偏好和合规话术，投研结论很难快速转成可执行的服务动作。",
  objective: "在 5 分钟内生成客户适配的市场简报、资产配置草案、风险提示和跟进任务。",
  metrics: ["投研简报生成时间 < 5 分钟", "顾问二次编辑率 > 45%", "客户跟进任务完成率 > 30%"],
};

export const prdSections = [
  {
    label: "目标用户",
    value: "银行理财经理、券商财富顾问、家族办公室投研助理和私募客户经理。",
  },
  {
    label: "核心价值",
    value: "把分散市场信号转成可解释、可审阅、可落地的客户配置建议。",
  },
  {
    label: "MVP 范围",
    value: "客户风险画像、市场摘要、组合建议、产品匹配、合规提示和任务跟进。",
  },
];

export const scopeItems = [
  "客户风险偏好和资产现状录入",
  "宏观市场与行业主题摘要",
  "资产配置草案和再平衡建议",
  "基金、债券、结构化产品匹配",
  "合规风险提示和话术生成",
  "客户跟进任务和周报导出",
];

export const competitors = [
  {
    name: "Bloomberg Terminal",
    position: "专业金融数据终端",
    strength: "数据覆盖深，机构认可度高",
    gap: "客户沟通和轻量化配置建议门槛高",
  },
  {
    name: "Wind 金融终端",
    position: "国内机构投研数据平台",
    strength: "本土市场数据完整，研究场景成熟",
    gap: "对前线顾问的客户化表达支持不足",
  },
  {
    name: "同花顺 iFinD",
    position: "金融数据与量化分析",
    strength: "A 股和宏观数据入口强",
    gap: "投研结论到客户行动的闭环较弱",
  },
  {
    name: "Betterment",
    position: "自动化财富管理",
    strength: "目标导向配置体验清晰",
    gap: "不适合机构顾问的复杂客户关系管理",
  },
];

export const marketResearch = [
  {
    label: "市场窗口",
    value: "财富管理正从产品销售转向顾问式服务，AI 可显著降低投研解释和客户沟通成本。",
  },
  {
    label: "早期切入",
    value: "从中小财富团队和独立理财顾问切入，优先解决每日简报、客户复盘和跟进建议。",
  },
  {
    label: "增长渠道",
    value: "与投顾培训机构、金融 SaaS 服务商和财富管理社群合作，以模板和案例驱动转化。",
  },
];

export const personas = [
  {
    name: "周岚",
    role: "银行理财经理",
    goal: "在客户会前快速准备市场观点和配置建议",
    pain: "市场信息太碎，合规话术和产品匹配需要反复确认",
  },
  {
    name: "Eric",
    role: "券商财富顾问",
    goal: "把宏观观点转成客户能理解的组合调整方案",
    pain: "高净值客户问题细，手工整理报告耗时",
  },
  {
    name: "沈予",
    role: "投研助理",
    goal: "为顾问团队维护主题组合、产品池和每周简报",
    pain: "数据、观点、风险提示散落在不同系统",
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
  "以每日市场简报生成器作为免费入口",
  "提供客户会前准备、组合复盘、基金推荐 3 套模板",
  "与投顾培训机构合作发布真实场景案例",
  "企业版增加审批流、合规词库和客户分层配置",
];

export const prototypeHighlights = [
  "客户资产视图",
  "市场主题雷达",
  "组合再平衡建议",
  "合规风险提示",
];

export const studioProjects = [
  "FinSight 智能投研工作台",
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
  "Linear 风格 SaaS",
  "Vercel 极简",
  "Notion AI",
  "企业级 B2B",
];

export const studioTemplates = [
  "金融工作台",
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
  "需求分析 Agent 建模场景",
  "PRD Agent 起草范围",
  "原型设计 Agent 映射界面",
  "竞品分析 Agent 对比市场",
  "市场调研 Agent 估算机会",
  "汇报材料 Agent 打包交付物",
];

export const studioTabs = [
  "PRD",
  "原型",
  "调研",
  "竞品",
  "画像",
  "路线图",
  "总结",
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
  "客户风险画像和资产现状建模",
  "生成每日市场摘要和主题机会雷达",
  "输出资产配置草案与再平衡建议",
  "匹配产品池并生成可审阅推荐理由",
  "生成合规风险提示、客户话术和跟进任务",
];

export const studioSuccessMetrics = [
  "顾问会前准备时间减少 60%",
  "客户跟进建议采纳率 > 35%",
  "合规退回率低于 5%",
  "每周客户复盘生成量提升 2 倍",
];

export const studioResearchCards = [
  {
    label: "TAM",
    value: "620 亿美元",
    detail: "全球财富科技、投研工具和顾问效率软件市场",
  },
  {
    label: "SAM",
    value: "86 亿美元",
    detail: "银行、券商、RIA 和家族办公室的顾问工作流",
  },
  {
    label: "SOM",
    value: "1.8 亿美元",
    detail: "中小财富团队的 AI 投研简报与客户服务工具",
  },
];

export const studioResearchInsights = [
  "财富顾问最缺的不是更多数据，而是把数据转成客户能听懂的解释。",
  "合规可追溯会成为 AI 投研工具进入机构场景的前置门槛。",
  "从会前准备和会后跟进切入，比直接承诺自动投资建议更容易被采用。",
];

export const studioCompetitors = [
  {
    competitor: "Bloomberg Terminal",
    positioning: "机构级金融数据和资讯终端",
    strength: "实时数据、新闻和分析生态强",
    weakness: "复杂昂贵，对顾问客户服务链路不友好",
    opportunity: "用轻量投研解释和客户跟进占据顾问桌面",
  },
  {
    competitor: "Wind 金融终端",
    positioning: "国内机构投研与数据分析平台",
    strength: "本土市场数据覆盖完整",
    weakness: "客户画像、合规话术和任务闭环较弱",
    opportunity: "连接投研、产品池和前线客户服务",
  },
  {
    competitor: "同花顺 iFinD",
    positioning: "金融数据、量化和研究工具",
    strength: "A 股、基金和宏观数据入口强",
    weakness: "不直接服务财富顾问的客户沟通场景",
    opportunity: "围绕顾问工作流重组信息层级",
  },
  {
    competitor: "Betterment",
    positioning: "自动化财富管理和目标投资",
    strength: "目标导向配置体验成熟",
    weakness: "机构顾问的复杂客户关系支持不足",
    opportunity: "为顾问团队提供可解释的配置协作层",
  },
];

export const studioRoadmap = [
  {
    horizon: "现在",
    items: [
      "每日市场简报",
      "客户风险画像",
      "组合建议草案",
      "合规提示与话术",
    ],
  },
  {
    horizon: "下一步",
    items: [
      "产品池自动匹配",
      "顾问团队审批流",
      "客户分层经营看板",
      "周报和会后纪要导出",
    ],
  },
  {
    horizon: "之后",
    items: [
      "投研数据连接器",
      "组合回测与压力测试",
      "CRM 和工单系统集成",
      "机构级审计日志",
    ],
  },
];

export const prdPrototypeAlignment = [
  {
    prdPoint: "顾问需要在会前快速掌握客户风险偏好和近期市场变化",
    prototypeBlock: "客户概览 + 市场主题雷达",
    rationale: "把客户状态和市场信号放在同一屏，减少会前准备切换成本。",
  },
  {
    prdPoint: "配置建议必须能解释收益来源、波动风险和适配原因",
    prototypeBlock: "配置瀑布图 + 风险提示面板",
    rationale: "用可视化结构支撑顾问解释，降低客户理解成本。",
  },
  {
    prdPoint: "金融场景需要保留可审阅、可追踪、可导出的服务记录",
    prototypeBlock: "合规审阅状态 + 会后跟进清单",
    rationale: "把生成建议转成可追踪任务，满足团队协作和审计要求。",
  },
];
