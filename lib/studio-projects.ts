import type {
  AgentProviderId,
  AgentRunHistoryItem,
  HarnessEvent,
  WorkflowId,
} from "@/lib/agent-harness";
import { buildProductPackFromIdea, defaultFinSightIdea, type ProductPack } from "@/lib/product-pack";

export type StudioProjectStatus =
  | "empty"
  | "running"
  | "awaiting_input"
  | "ready"
  | "error"
  | "archived";

export type StudioProjectRecord = {
  id: string;
  name: string;
  sourceIdea: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: StudioProjectStatus;
  workflowId: WorkflowId;
  providerId: AgentProviderId;
  designSystem: string;
  productPack?: ProductPack;
  agentEvents: HarnessEvent[];
  runHistory: AgentRunHistoryItem[];
};

export type CreateStudioProjectInput = {
  name?: string;
  sourceIdea: string;
  description?: string;
  workflowId?: WorkflowId;
  providerId?: AgentProviderId;
  designSystem?: string;
};

type LegacyDemoProject = {
  id: string;
  productPack: ProductPack;
  agentEvents?: HarnessEvent[];
  createdAt?: string;
  updatedAt?: string;
};

const storageProjectKey = "pmstudio:projects:v5";
const storageActiveProjectKey = "pmstudio:active-project-id:v5";
const storageShowcaseSeededKey = "pmstudio:showcase-seeded:v6";
const legacyProjectsKey = "pmstudio:projects:v4";
const legacyActiveProjectKey = "pmstudio:active-project-id:v4";
const legacyLastProductPackKey = "pmstudio:last-product-pack:v4";
const legacyRunHistoryKey = "pmstudio:run-history:v4";

export const studioProjectsStorageKeys = {
  activeProject: storageActiveProjectKey,
  legacyActiveProject: legacyActiveProjectKey,
  legacyLastProductPack: legacyLastProductPackKey,
  legacyProjects: legacyProjectsKey,
  legacyRunHistory: legacyRunHistoryKey,
  projects: storageProjectKey,
  showcaseSeeded: storageShowcaseSeededKey,
};

export const studioProjectsChangedEvent = "pmstudio:projects-changed";

const defaultWorkflowId: WorkflowId = "idea-to-product-pack";
const defaultProviderId: AgentProviderId = "mock";
const defaultDesignSystem = "Linear 风格 SaaS";

function getBrowserStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;

  return window.localStorage;
}

function notifyChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(studioProjectsChangedEvent));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseJson(value: string | null): unknown {
  if (!value) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function isProductPack(value: unknown): value is ProductPack {
  return (
    isRecord(value) &&
    value.schemaVersion === "pm-product-pack.v1" &&
    isRecord(value.project) &&
    typeof value.id === "string" &&
    typeof value.sourceIdea === "string"
  );
}

function isHarnessEvent(value: unknown): value is HarnessEvent {
  return (
    isRecord(value) &&
    typeof value.type === "string" &&
    typeof value.agent === "string" &&
    typeof value.message === "string"
  );
}

function isHarnessEventList(value: unknown): value is HarnessEvent[] {
  return Array.isArray(value) && value.every(isHarnessEvent);
}

function isRunHistoryItem(value: unknown): value is AgentRunHistoryItem {
  return (
    isRecord(value) &&
    typeof value.runId === "string" &&
    typeof value.providerId === "string" &&
    typeof value.runMode === "string" &&
    typeof value.workflowId === "string" &&
    typeof value.projectTitle === "string" &&
    typeof value.sourceIdea === "string" &&
    typeof value.createdAt === "string"
  );
}

function isRunHistoryList(value: unknown): value is AgentRunHistoryItem[] {
  return Array.isArray(value) && value.every(isRunHistoryItem);
}

function normalizeStatus(value: unknown, hasPack: boolean): StudioProjectStatus {
  if (
    value === "empty" ||
    value === "running" ||
    value === "awaiting_input" ||
    value === "ready" ||
    value === "error" ||
    value === "archived"
  ) {
    return value;
  }

  return hasPack ? "ready" : "empty";
}

function normalizeProviderId(value: unknown): AgentProviderId {
  if (value === "codex" || value === "claude-code" || value === "api-fallback" || value === "mock") {
    return value;
  }

  return defaultProviderId;
}

function normalizeWorkflowId(value: unknown): WorkflowId {
  if (
    value === "idea-to-product-pack" ||
    value === "generate-prd" ||
    value === "prd-to-prototype-linker" ||
    value === "user-personas" ||
    value === "market-research" ||
    value === "competitor-analysis" ||
    value === "roadmap-generator" ||
    value === "project-summarizer"
  ) {
    return value;
  }

  return defaultWorkflowId;
}

function trimText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function escapeShowcaseHtml(value: string | number | undefined | null) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function makeProjectId() {
  const random =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.floor(Math.random() * 1_000_000).toString(36)}`;

  return `project-${random}`;
}

function projectNameFromIdea(sourceIdea: string) {
  const cleaned = sourceIdea
    .replace(/^帮我(生成|创建|做|写)?一个?/, "")
    .replace(/^我想(做|创建|开发|打造)?一个?/, "")
    .replace(/[。.!！?？].*$/, "")
    .trim();

  if (!cleaned) return "未命名项目";
  if (cleaned.length <= 28) return cleaned;

  return `${cleaned.slice(0, 28)}...`;
}

function normalizeProject(value: unknown): StudioProjectRecord | null {
  if (!isRecord(value)) return null;

  const productPack = isProductPack(value.productPack) ? value.productPack : undefined;
  const id = trimText(value.id);

  if (!id) return null;

  const sourceIdea = trimText(value.sourceIdea, productPack?.sourceIdea ?? "");
  const name = trimText(value.name, productPack?.project.title ?? projectNameFromIdea(sourceIdea));
  const createdAt = trimText(value.createdAt, productPack?.generatedAt ?? new Date().toISOString());
  const updatedAt = trimText(value.updatedAt, createdAt);

  return {
    agentEvents: isHarnessEventList(value.agentEvents) ? value.agentEvents : [],
    createdAt,
    description: trimText(value.description, productPack?.project.oneLiner ?? ""),
    designSystem: trimText(value.designSystem, defaultDesignSystem),
    id,
    name,
    productPack,
    providerId: normalizeProviderId(value.providerId),
    runHistory: isRunHistoryList(value.runHistory) ? value.runHistory : [],
    sourceIdea,
    status: normalizeStatus(value.status, Boolean(productPack)),
    updatedAt,
    workflowId: normalizeWorkflowId(value.workflowId),
  };
}

function normalizeProjectList(value: unknown): StudioProjectRecord[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const projects: StudioProjectRecord[] = [];

  for (const item of value) {
    const project = normalizeProject(item);

    if (!project || seen.has(project.id)) continue;

    seen.add(project.id);
    projects.push(project);
  }

  return projects;
}

function legacyProjectFromPack({
  agentEvents = [],
  createdAt,
  id,
  productPack,
  runHistory = [],
  updatedAt,
}: {
  agentEvents?: HarnessEvent[];
  createdAt?: string;
  id?: string;
  productPack: ProductPack;
  runHistory?: AgentRunHistoryItem[];
  updatedAt?: string;
}): StudioProjectRecord {
  const firstRun = runHistory[0];

  return {
    agentEvents,
    createdAt: createdAt ?? productPack.generatedAt,
    description: productPack.project.oneLiner,
    designSystem: defaultDesignSystem,
    id: id ?? productPack.id,
    name: productPack.project.title,
    productPack,
    providerId: firstRun?.providerId ?? defaultProviderId,
    runHistory,
    sourceIdea: productPack.sourceIdea,
    status: "ready",
    updatedAt: updatedAt ?? firstRun?.createdAt ?? productPack.generatedAt,
    workflowId: firstRun?.workflowId ?? defaultWorkflowId,
  };
}

function readLegacyProjects(storage: Storage): StudioProjectRecord[] {
  const runHistoryValue = parseJson(storage.getItem(legacyRunHistoryKey));
  const runHistory = isRunHistoryList(runHistoryValue) ? runHistoryValue : [];
  const legacyProjects = parseJson(storage.getItem(legacyProjectsKey));
  const projects: StudioProjectRecord[] = [];

  if (Array.isArray(legacyProjects)) {
    for (const item of legacyProjects) {
      if (!isRecord(item) || !isProductPack(item.productPack)) continue;

      const legacy = item as LegacyDemoProject;
      projects.push(
        legacyProjectFromPack({
          agentEvents: isHarnessEventList(legacy.agentEvents) ? legacy.agentEvents : [],
          createdAt: legacy.createdAt,
          id: legacy.id,
          productPack: legacy.productPack,
          runHistory: runHistory.filter((entry) => entry.projectTitle === legacy.productPack.project.title),
          updatedAt: legacy.updatedAt,
        }),
      );
    }
  }

  const lastPack = parseJson(storage.getItem(legacyLastProductPackKey));

  if (isProductPack(lastPack) && !projects.some((project) => project.id === lastPack.id)) {
    projects.push(
      legacyProjectFromPack({
        productPack: lastPack,
        runHistory,
      }),
    );
  }

  return projects;
}

function saveProjects(projects: StudioProjectRecord[], storage: Storage) {
  storage.setItem(storageProjectKey, JSON.stringify(projects));
}

type ShowcaseProjectScreen = ProductPack["prototype"]["screens"][number] & {
  accent: string;
  metric: string;
  slug: string;
};

type ShowcaseProjectKind = "finance" | "reading" | "coffee" | "clinic";

type ShowcaseProjectSeed = {
  createdAt: string;
  description: string;
  designSystem: string;
  id: string;
  kind: ShowcaseProjectKind;
  name: string;
  sourceIdea: string;
  screens: ShowcaseProjectScreen[];
};

const showcaseProjectSeeds: ShowcaseProjectSeed[] = [
  {
    createdAt: "2026-06-21T02:10:00.000Z",
    description: "面向财富顾问的 AI 投研工作台，展示市场简报、配置建议和客户材料导出链路。",
    designSystem: "Linear 风格 SaaS",
    id: "demo",
    kind: "finance",
    name: "FinSight 智能投研工作台",
    sourceIdea: defaultFinSightIdea,
    screens: [
      {
        accent: "#12A7FF",
        components: ["市场异动摘要", "客户组合风险", "AI 配置建议", "合规提示"],
        goal: "让顾问在一个页面判断今日市场影响和客户跟进优先级。",
        metric: "简报生成 3 分钟内完成",
        name: "投研首页",
        primaryAction: "生成市场简报",
        slug: "insight-home",
      },
      {
        accent: "#34C759",
        components: ["客户分层", "组合偏离", "再平衡建议", "沟通话术"],
        goal: "把市场变化映射到客户组合，并生成可解释的调整建议。",
        metric: "建议采纳率 > 45%",
        name: "客户组合页",
        primaryAction: "生成调整建议",
        slug: "portfolio",
      },
      {
        accent: "#FFB005",
        components: ["材料预览", "合规检查", "风险揭示", "导出记录"],
        goal: "把顾问确认后的建议转成可发给客户的材料。",
        metric: "材料返工率下降 30%",
        name: "客户材料页",
        primaryAction: "导出客户材料",
        slug: "handoff",
      },
    ],
  },
  {
    createdAt: "2026-06-21T02:20:00.000Z",
    description: "面向通勤和睡前阅读用户的移动端阅读 App，展示 PRD 到多屏原型的完整链路。",
    designSystem: "Apple Human Interface 风格",
    id: "showcase-reading-app",
    kind: "reading",
    name: "ReadFlow 阅读成长 App",
    sourceIdea: "帮我生成一个面向通勤和睡前阅读用户的阅读 app PRD，并联动生成移动端原型。",
    screens: [
      {
        accent: "#12A7FF",
        components: ["继续阅读", "今日推荐", "阅读目标", "书架入口"],
        goal: "帮助用户快速回到最近阅读，并发现下一本适合的书。",
        metric: "首屏继续阅读点击率 > 55%",
        name: "阅读首页",
        primaryAction: "继续阅读",
        slug: "home",
      },
      {
        accent: "#111111",
        components: ["正文排版", "进度条", "高亮笔记", "主题设置"],
        goal: "提供低干扰、可标注的沉浸阅读体验。",
        metric: "单次阅读时长提升 20%",
        name: "沉浸阅读器",
        primaryAction: "添加笔记",
        slug: "reader",
      },
      {
        accent: "#34C759",
        components: ["阅读日历", "连续天数", "目标调整", "本周复盘"],
        goal: "让用户看到阅读进展，并调整下一阶段目标。",
        metric: "7 日留存提升 15%",
        name: "目标复盘页",
        primaryAction: "调整目标",
        slug: "goals",
      },
    ],
  },
  {
    createdAt: "2026-06-21T02:30:00.000Z",
    description: "给独立咖啡店老板的订货、排班和会员运营工作台，展示运营型 AI 产品方案。",
    designSystem: "Notion 风格运营台",
    id: "showcase-coffee-ops",
    kind: "coffee",
    name: "CoffeeOps 门店经营 Copilot",
    sourceIdea: "给独立咖啡店老板做一个自动订货、排班和会员运营 AI 工作台。",
    screens: [
      {
        accent: "#12A7FF",
        components: ["销售预测", "库存水位", "缺货风险", "今日待办"],
        goal: "让老板快速判断今天要补什么货、谁来执行。",
        metric: "缺货率下降 25%",
        name: "门店总览",
        primaryAction: "生成补货单",
        slug: "overview",
      },
      {
        accent: "#FFB005",
        components: ["原料清单", "供应商报价", "安全库存", "替代方案"],
        goal: "根据销量预测和库存余量生成可确认的订货建议。",
        metric: "订货耗时 < 4 分钟",
        name: "订货建议页",
        primaryAction: "确认订货",
        slug: "replenishment",
      },
      {
        accent: "#34C759",
        components: ["班次缺口", "高峰预测", "会员唤醒", "执行任务"],
        goal: "把订货、排班和会员运营合并成一天的执行计划。",
        metric: "门店人效提升 18%",
        name: "执行计划页",
        primaryAction: "分配任务",
        slug: "operations",
      },
    ],
  },
  {
    createdAt: "2026-06-21T02:40:00.000Z",
    description: "面向小型诊所的预约、分诊和随访工作台，展示医疗服务运营场景。",
    designSystem: "PM Studio DESIGN.md",
    id: "showcase-clinic-intake",
    kind: "clinic",
    name: "ClinicPilot 诊所分诊工作台",
    sourceIdea: "为小型诊所做一个患者预约、AI 分诊和复诊随访的运营工作台。",
    screens: [
      {
        accent: "#12A7FF",
        components: ["预约队列", "症状摘要", "等待时间", "今日容量"],
        goal: "让前台和医生助理快速判断预约优先级。",
        metric: "分诊等待时间下降 30%",
        name: "预约分诊首页",
        primaryAction: "开始分诊",
        slug: "intake",
      },
      {
        accent: "#34C759",
        components: ["症状表单", "风险提示", "科室建议", "医生确认"],
        goal: "把患者输入转成可解释的分诊建议，并保留人工确认。",
        metric: "分诊建议确认率 > 70%",
        name: "AI 分诊页",
        primaryAction: "确认建议",
        slug: "triage",
      },
      {
        accent: "#FFB005",
        components: ["复诊提醒", "用药跟进", "异常反馈", "随访记录"],
        goal: "自动生成随访计划，降低漏跟进和重复沟通。",
        metric: "随访完成率提升 25%",
        name: "随访计划页",
        primaryAction: "生成随访",
        slug: "followup",
      },
    ],
  },
];

type ShowcaseRow = {
  label: string;
  note?: string;
  value: string;
};

type DesktopScreenContent = {
  feedTitle: string;
  headline: string;
  metrics: ShowcaseRow[];
  primaryRows: ShowcaseRow[];
  primaryTitle: string;
  railItems: string[];
  railTitle: string;
  secondaryRows: ShowcaseRow[];
  secondaryTitle: string;
};

function renderRows(rows: ShowcaseRow[], prefix: string) {
  return rows
    .map(
      (row, index) => `<div class="row" data-od-id="${prefix}-row-${index}">
        <span><strong>${escapeShowcaseHtml(row.label)}</strong>${row.note ? `<small>${escapeShowcaseHtml(row.note)}</small>` : ""}</span>
        <b>${escapeShowcaseHtml(row.value)}</b>
      </div>`,
    )
    .join("");
}

function renderMetricTiles(rows: ShowcaseRow[], prefix: string) {
  return rows
    .map(
      (row, index) => `<div class="metric" data-od-id="${prefix}-metric-${index}">
        <span>${escapeShowcaseHtml(row.label)}</span>
        <strong>${escapeShowcaseHtml(row.value)}</strong>
        ${row.note ? `<small>${escapeShowcaseHtml(row.note)}</small>` : ""}
      </div>`,
    )
    .join("");
}

function renderPills(items: string[], prefix: string) {
  return items
    .map((item, index) => `<span data-od-id="${prefix}-pill-${index}">${escapeShowcaseHtml(item)}</span>`)
    .join("");
}

function renderScreenNav(seed: ShowcaseProjectSeed, activeIndex: number) {
  return seed.screens
    .map(
      (item, index) =>
        `<a class="${index === activeIndex ? "active" : ""}" href="${String(index + 1).padStart(2, "0")}-${item.slug}.html" data-od-id="nav-${index}">${escapeShowcaseHtml(item.name)}</a>`,
    )
    .join("");
}

function renderPrototypeDocument({
  accent,
  body,
  title,
}: {
  accent: string;
  body: string;
  title: string;
}) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeShowcaseHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: #f4f5f3; color: #111315; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    a { color: inherit; text-decoration: none; }
    button { border: 0; border-radius: 10px; background: #111315; color: white; font: inherit; font-weight: 780; padding: 11px 14px; }
    .stage { min-height: 100vh; padding: 20px; }
    .shell { min-height: calc(100vh - 40px); display: grid; grid-template-columns: 236px minmax(0, 1fr); border: 1px solid #dedfd8; border-radius: 16px; background: white; overflow: hidden; box-shadow: 0 22px 70px rgba(17, 19, 21, .08); }
    .sidebar { border-right: 1px solid #ebece6; background: #faf9f5; padding: 16px; }
    .logo { display: flex; align-items: center; gap: 10px; font-weight: 830; }
    .mark { width: 13px; height: 13px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 5px rgba(18, 167, 255, .12); }
    .nav { display: grid; gap: 8px; margin-top: 22px; }
    .nav a { border: 1px solid transparent; border-radius: 10px; color: #62656a; font-size: 13px; padding: 10px; }
    .nav a.active { border-color: #d9dad3; background: white; color: #111315; box-shadow: 0 10px 26px rgba(17, 19, 21, .06); }
    .workspace { min-width: 0; padding: 22px; }
    .topbar, .hero-head, .row { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
    .eyebrow { color: var(--accent); font-size: 12px; font-weight: 830; text-transform: uppercase; }
    h1 { margin: 8px 0 0; max-width: 820px; font-size: clamp(31px, 4.6vw, 56px); line-height: 1.04; letter-spacing: 0; }
    h2, h3, p { margin: 0; }
    .muted, small { color: #6a6d72; line-height: 1.55; }
    .hero { margin-top: 18px; border: 1px solid #e7e8e2; border-radius: 16px; background: linear-gradient(135deg, #ffffff, #f8f9f5); padding: 18px; }
    .kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
    .metric, .card, .rail { border: 1px solid #e8e9e3; border-radius: 12px; background: #fff; padding: 14px; }
    .metric strong { display: block; margin-top: 5px; font-size: 25px; line-height: 1.05; }
    .grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(280px, .65fr); gap: 14px; margin-top: 14px; }
    .rows { display: grid; gap: 8px; margin-top: 12px; }
    .row { border-top: 1px solid #eeefea; padding-top: 10px; }
    .row span { display: grid; gap: 2px; }
    .row b { font-size: 13px; white-space: nowrap; }
    .pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .pills span { border: 1px solid #dedfd8; border-radius: 999px; background: #fbfaf7; color: #4b4e52; font-size: 12px; padding: 7px 9px; }
    .rail { background: #fbfaf7; }
    .feed { display: grid; gap: 9px; margin-top: 12px; }
    .feed div { border-left: 3px solid var(--accent); background: white; border-radius: 8px; padding: 9px 10px; font-size: 13px; }
    .phone-stage { min-height: 100vh; display: grid; place-items: center; grid-template-columns: minmax(320px, 390px) minmax(260px, 420px); gap: 28px; padding: 28px; }
    .phone { width: min(390px, 100%); min-height: 760px; border: 10px solid #111315; border-radius: 34px; background: #fbfaf7; overflow: hidden; box-shadow: 0 22px 60px rgba(17, 19, 21, .16); }
    .phone-main { padding: 18px; }
    .status, .bottom-nav { display: flex; align-items: center; justify-content: space-between; }
    .status { padding: 13px 20px 4px; font-size: 12px; font-weight: 780; }
    .book-card { border-radius: 18px; background: white; padding: 16px; box-shadow: 0 12px 35px rgba(17, 19, 21, .07); }
    .reading-lines { display: grid; gap: 11px; margin-top: 14px; }
    .reading-lines i { display: block; height: 10px; border-radius: 999px; background: #e5e2d6; }
    .bottom-nav { border-top: 1px solid #e2e0d8; margin-top: 18px; padding: 13px 18px; color: #606268; font-size: 12px; }
    @media (max-width: 860px) { .stage { padding: 12px; } .shell, .grid, .phone-stage { grid-template-columns: 1fr; } .sidebar { border-right: 0; border-bottom: 1px solid #ebece6; } .kpis { grid-template-columns: 1fr; } .phone { min-height: 700px; } }
  </style>
</head>
<body style="--accent: ${escapeShowcaseHtml(accent)};">
${body}
</body>
</html>`;
}

function renderShowcaseIndex(seed: ShowcaseProjectSeed) {
  const links = seed.screens
    .map(
      (screen, index) => `<a class="card" href="screens/${String(index + 1).padStart(2, "0")}-${screen.slug}.html" data-od-id="prototype-map-${index}">
        <span class="eyebrow">Screen ${String(index + 1).padStart(2, "0")}</span>
        <h3>${escapeShowcaseHtml(screen.name)}</h3>
        <p class="muted">${escapeShowcaseHtml(screen.goal)}</p>
      </a>`,
    )
    .join("");

  return renderPrototypeDocument({
    accent: seed.screens[0]?.accent ?? "#12A7FF",
    title: `${seed.name} Prototype`,
    body: `<main class="stage">
  <section class="shell" data-od-id="prototype-launcher">
    <aside class="sidebar">
      <div class="logo"><span class="mark"></span>${escapeShowcaseHtml(seed.name)}</div>
      <div class="nav">${seed.screens
        .map(
          (screen, index) =>
            `<a href="screens/${String(index + 1).padStart(2, "0")}-${screen.slug}.html">${escapeShowcaseHtml(screen.name)}</a>`,
        )
        .join("")}</div>
    </aside>
    <div class="workspace">
      <span class="eyebrow">Generated product prototype</span>
      <h1>${escapeShowcaseHtml(seed.name)}</h1>
      <p class="muted">${escapeShowcaseHtml(seed.description)}</p>
      <div class="grid" data-od-id="prototype-screen-map">${links}</div>
    </div>
  </section>
</main>`,
  });
}

function renderDesktopProductScreen(
  seed: ShowcaseProjectSeed,
  screen: ShowcaseProjectScreen,
  index: number,
  content: DesktopScreenContent,
) {
  return renderPrototypeDocument({
    accent: screen.accent,
    title: `${screen.name} · ${seed.name}`,
    body: `<main class="stage">
  <section class="shell" data-od-id="${seed.kind}-screen-${index}">
    <aside class="sidebar">
      <div class="logo"><span class="mark"></span>${escapeShowcaseHtml(seed.name)}</div>
      <nav class="nav">${renderScreenNav(seed, index)}</nav>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <div>
          <span class="eyebrow">${escapeShowcaseHtml(content.feedTitle)}</span>
          <h1 data-od-id="screen-title-${index}">${escapeShowcaseHtml(content.headline)}</h1>
        </div>
        <button data-od-id="primary-action-${index}">${escapeShowcaseHtml(screen.primaryAction)}</button>
      </header>
      <section class="hero" data-od-id="hero-${index}">
        <div class="hero-head">
          <p class="muted">${escapeShowcaseHtml(screen.goal)}</p>
          <strong>${escapeShowcaseHtml(screen.metric)}</strong>
        </div>
        <div class="kpis">${renderMetricTiles(content.metrics, `metric-${index}`)}</div>
      </section>
      <section class="grid">
        <div class="card" data-od-id="primary-panel-${index}">
          <h2>${escapeShowcaseHtml(content.primaryTitle)}</h2>
          <div class="rows">${renderRows(content.primaryRows, `primary-${index}`)}</div>
          <div class="pills">${renderPills(screen.components, `component-${index}`)}</div>
        </div>
        <div class="rail" data-od-id="side-panel-${index}">
          <h2>${escapeShowcaseHtml(content.secondaryTitle)}</h2>
          <div class="rows">${renderRows(content.secondaryRows, `secondary-${index}`)}</div>
        </div>
      </section>
      <section class="grid">
        <div class="card" data-od-id="workflow-${index}">
          <h2>${escapeShowcaseHtml(content.railTitle)}</h2>
          <div class="feed">${content.railItems.map((item, itemIndex) => `<div data-od-id="rail-${index}-${itemIndex}">${escapeShowcaseHtml(item)}</div>`).join("")}</div>
        </div>
      </section>
    </div>
  </section>
</main>`,
  });
}

function renderFinSightScreen(seed: ShowcaseProjectSeed, screen: ShowcaseProjectScreen, index: number) {
  const views: DesktopScreenContent[] = [
    {
      feedTitle: "Market command center",
      headline: "把隔夜市场波动翻译成顾问今天能执行的客户动作",
      metrics: [
        { label: "风险客户", value: "18", note: "组合波动超过阈值" },
        { label: "可发送简报", value: "42", note: "已通过合规校验" },
        { label: "AI 摘要耗时", value: "2m 18s", note: "含宏观、行业和持仓解释" },
      ],
      primaryRows: [
        { label: "美债收益率上行", value: "高影响", note: "影响固收和红利配置" },
        { label: "AI 芯片板块回撤", value: "需解释", note: "3 位客户持仓集中" },
        { label: "黄金波动放大", value: "观察", note: "避险资产配置复核" },
      ],
      primaryTitle: "今日市场雷达",
      railItems: ["生成 3 版不同风险偏好的市场简报", "标记需要人工复核的合规措辞", "把客户组合页同步为待跟进队列"],
      railTitle: "顾问下一步",
      secondaryRows: [
        { label: "王女士", value: "优先", note: "科技股仓位 38%" },
        { label: "陈先生", value: "今日联系", note: "债券久期偏长" },
        { label: "家庭账户 A", value: "简报可发", note: "低风险措辞已替换" },
      ],
      secondaryTitle: "客户跟进优先级",
    },
    {
      feedTitle: "Portfolio rebalance",
      headline: "从客户目标反推组合偏离，并给出可解释的再平衡建议",
      metrics: [
        { label: "偏离组合", value: "7", note: "超过 IPS 范围" },
        { label: "预计回撤改善", value: "-1.8%", note: "基于压力情景" },
        { label: "建议可信度", value: "82%", note: "需要顾问确认" },
      ],
      primaryRows: [
        { label: "减持纳指 ETF", value: "-6%", note: "降低单一因子暴露" },
        { label: "增配短债", value: "+4%", note: "匹配 12 个月现金需求" },
        { label: "保留黄金", value: "不变", note: "对冲地缘风险" },
      ],
      primaryTitle: "组合调整建议",
      railItems: ["对比调整前后风险雷达", "生成客户可读解释", "保留每条建议的市场依据和 PRD 链接"],
      railTitle: "解释链路",
      secondaryRows: [
        { label: "适配客户", value: "稳健型" },
        { label: "审批状态", value: "待顾问确认" },
        { label: "预计沟通时间", value: "6 分钟" },
      ],
      secondaryTitle: "执行状态",
    },
    {
      feedTitle: "Client handoff",
      headline: "把确认后的投顾建议变成可发送的客户材料和审计记录",
      metrics: [
        { label: "合规命中", value: "0", note: "当前版本无阻断" },
        { label: "材料页数", value: "6", note: "含摘要、依据、风险揭示" },
        { label: "返工风险", value: "低", note: "已替换收益承诺表述" },
      ],
      primaryRows: [
        { label: "客户摘要", value: "已生成", note: "口吻偏稳健" },
        { label: "风险揭示", value: "已插入", note: "覆盖波动和流动性" },
        { label: "附件导出", value: "PDF + PPT", note: "可发邮件或企微" },
      ],
      primaryTitle: "客户材料预览",
      railItems: ["顾问确认材料版本", "系统记录依据、修改和导出时间", "客户回复后回写跟进状态"],
      railTitle: "交付流程",
      secondaryRows: [
        { label: "审计轨迹", value: "完整" },
        { label: "版本", value: "v3" },
        { label: "下一步", value: "预约沟通" },
      ],
      secondaryTitle: "交付检查",
    },
  ];

  return renderDesktopProductScreen(seed, screen, index, views[index] ?? views[0]);
}

function renderReadFlowScreen(seed: ShowcaseProjectSeed, screen: ShowcaseProjectScreen, index: number) {
  const views = [
    {
      badge: "今晚 21:30 推荐",
      headline: "继续读《长日将尽》",
      meta: "第 4 章 · 还剩 18 分钟",
      primary: "回到上次阅读位置",
      rows: ["通勤 12 分钟短篇推荐", "睡前护眼主题已开启", "本周目标 4/5 天"],
      side: ["用户打开后 3 秒内回到阅读", "首页优先展示最近书籍而不是运营 banner", "推荐理由使用用户可理解的标签"],
    },
    {
      badge: "专注阅读中",
      headline: "第 4 章：黄昏后的信",
      meta: "42% · 预计 18 分钟读完",
      primary: "添加高亮笔记",
      rows: ["字号 17 · 行高舒适", "当前段落已标注 2 条笔记", "下滑显示目录和主题设置"],
      side: ["正文区域避免营销入口", "笔记按钮靠近选中文本", "进度和时间反馈保持低干扰"],
    },
    {
      badge: "本周复盘",
      headline: "连续阅读 6 天",
      meta: "本周 3 小时 45 分钟 · 完成 76%",
      primary: "调整下周目标",
      rows: ["睡前阅读完成率 83%", "通勤阅读平均 14 分钟", "下周建议目标 5 天"],
      side: ["把留存目标转成可见成就", "允许用户调低目标避免挫败", "复盘页连接书架和下一本推荐"],
    },
  ];
  const view = views[index] ?? views[0];

  return renderPrototypeDocument({
    accent: screen.accent,
    title: `${screen.name} · ${seed.name}`,
    body: `<main class="phone-stage">
  <section class="phone" data-od-id="reading-screen-${index}">
    <div class="status"><span>9:41</span><span>ReadFlow</span></div>
    <div class="phone-main">
      <span class="eyebrow">${escapeShowcaseHtml(view.badge)}</span>
      <h1 data-od-id="reading-title-${index}">${escapeShowcaseHtml(view.headline)}</h1>
      <p class="muted">${escapeShowcaseHtml(view.meta)}</p>
      <section class="book-card" data-od-id="reading-card-${index}">
        <div class="hero-head"><strong>${escapeShowcaseHtml(screen.primaryAction)}</strong><button>${escapeShowcaseHtml(view.primary)}</button></div>
        <div class="reading-lines"><i style="width: 94%"></i><i style="width: 82%"></i><i style="width: 68%"></i><i style="width: 88%"></i></div>
        <div class="pills">${renderPills(screen.components, `reading-${index}`)}</div>
      </section>
      <div class="rows">${renderRows(
        view.rows.map((item, itemIndex) => ({ label: item, value: itemIndex === 0 ? "现在" : "已同步" })),
        `reading-row-${index}`,
      )}</div>
      <nav class="bottom-nav">${seed.screens.map((item, itemIndex) => `<a class="${itemIndex === index ? "active" : ""}" href="${String(itemIndex + 1).padStart(2, "0")}-${item.slug}.html">${escapeShowcaseHtml(item.name)}</a>`).join("")}</nav>
    </div>
  </section>
  <aside class="rail" data-od-id="reading-prd-trace-${index}">
    <span class="eyebrow">PRD trace</span>
    <h2>${escapeShowcaseHtml(screen.goal)}</h2>
    <div class="feed">${view.side.map((item, itemIndex) => `<div data-od-id="reading-trace-${index}-${itemIndex}">${escapeShowcaseHtml(item)}</div>`).join("")}</div>
  </aside>
</main>`,
  });
}

function renderCoffeeOpsScreen(seed: ShowcaseProjectSeed, screen: ShowcaseProjectScreen, index: number) {
  const views: DesktopScreenContent[] = [
    {
      feedTitle: "Store operating room",
      headline: "老板一打开就知道今天缺什么货、哪个高峰需要加人",
      metrics: [
        { label: "今日预测营收", value: "¥8,420", note: "较上周同日 +12%" },
        { label: "缺货风险", value: "3 项", note: "燕麦奶、冷萃豆、杯盖" },
        { label: "待执行任务", value: "9", note: "已按影响排序" },
      ],
      primaryRows: [
        { label: "燕麦拿铁", value: "高峰 14:00", note: "预计售罄前 2 小时" },
        { label: "冷萃豆", value: "库存 1.5 天", note: "供应商 A 今日可送" },
        { label: "兼职排班", value: "缺 1 人", note: "周六早高峰" },
      ],
      primaryTitle: "今日经营信号",
      railItems: ["生成可编辑补货单", "把高峰预测同步到排班", "会员券只推给 21 天未到店用户"],
      railTitle: "AI 执行建议",
      secondaryRows: [
        { label: "毛利预警", value: "奶制品 +8%" },
        { label: "会员唤醒", value: "126 人" },
        { label: "门店状态", value: "可控" },
      ],
      secondaryTitle: "老板看板",
    },
    {
      feedTitle: "Replenishment planner",
      headline: "根据销量预测、库存和供应商报价生成一张可确认的订货单",
      metrics: [
        { label: "预计节省", value: "¥312", note: "合并供应商起送价" },
        { label: "安全库存", value: "92%", note: "核心原料覆盖" },
        { label: "确认耗时", value: "3m", note: "比手工表格快" },
      ],
      primaryRows: [
        { label: "燕麦奶 1L", value: "24 盒", note: "供应商 B 更便宜 4%" },
        { label: "冷萃豆", value: "6 kg", note: "按周末预测上调" },
        { label: "12oz 杯盖", value: "800 个", note: "避免下午断货" },
      ],
      primaryTitle: "订货建议",
      railItems: ["老板可调数量并查看影响", "替代供应商自动显示交期", "确认后生成采购消息和库存更新"],
      railTitle: "确认流程",
      secondaryRows: [
        { label: "供应商 A", value: "今日达" },
        { label: "供应商 B", value: "低价" },
        { label: "现金流影响", value: "¥1,860" },
      ],
      secondaryTitle: "供应商比较",
    },
    {
      feedTitle: "Daily execution",
      headline: "把订货、排班、会员运营排成今天每个人都能执行的任务板",
      metrics: [
        { label: "任务完成", value: "6/9", note: "剩余 3 项需老板确认" },
        { label: "高峰覆盖", value: "100%", note: "已补齐周六早班" },
        { label: "会员回流", value: "预计 18 单", note: "券成本可控" },
      ],
      primaryRows: [
        { label: "10:30 确认补货", value: "店长" },
        { label: "14:00 上架冷萃活动", value: "运营" },
        { label: "18:00 复盘损耗", value: "老板" },
      ],
      primaryTitle: "今日任务板",
      railItems: ["每个任务保留 AI 生成依据", "完成状态回写下一次预测", "异常库存自动生成明日提醒"],
      railTitle: "运营闭环",
      secondaryRows: [
        { label: "已分配", value: "7 人" },
        { label: "待确认", value: "2 项" },
        { label: "预计人效", value: "+18%" },
      ],
      secondaryTitle: "执行质量",
    },
  ];

  return renderDesktopProductScreen(seed, screen, index, views[index] ?? views[0]);
}

function renderClinicPilotScreen(seed: ShowcaseProjectSeed, screen: ShowcaseProjectScreen, index: number) {
  const views: DesktopScreenContent[] = [
    {
      feedTitle: "Clinic intake board",
      headline: "把预约队列、症状摘要和医生容量放在一个可调度工作台",
      metrics: [
        { label: "等待中", value: "14", note: "3 人超过目标等待" },
        { label: "高风险提示", value: "2", note: "需护士立即确认" },
        { label: "今日容量", value: "82%", note: "儿科下午已满" },
      ],
      primaryRows: [
        { label: "张女士", value: "胸闷", note: "建议优先分诊" },
        { label: "李同学", value: "发热", note: "儿科 16:20 可排" },
        { label: "王先生", value: "复诊", note: "可转线上随访" },
      ],
      primaryTitle: "预约分诊队列",
      railItems: ["AI 先摘要症状，不自动下诊断", "护士确认优先级后进入医生工作台", "异常等待时间触发前台提示"],
      railTitle: "安全流程",
      secondaryRows: [
        { label: "全科医生", value: "6 个空位" },
        { label: "儿科", value: "已满" },
        { label: "线上复诊", value: "可转 4 人" },
      ],
      secondaryTitle: "容量分配",
    },
    {
      feedTitle: "AI assisted triage",
      headline: "把患者表单转成可解释的分诊建议，并要求人工确认",
      metrics: [
        { label: "建议等级", value: "中高", note: "因胸闷和持续时长" },
        { label: "需补充问题", value: "3", note: "疼痛范围、过敏史、用药" },
        { label: "确认率", value: "74%", note: "历史同类病例" },
      ],
      primaryRows: [
        { label: "症状摘要", value: "已生成", note: "患者语言转换为医学描述" },
        { label: "科室建议", value: "全科优先", note: "保留护士修改入口" },
        { label: "风险提示", value: "需复核", note: "避免自动诊断" },
      ],
      primaryTitle: "分诊建议卡",
      railItems: ["所有建议显示依据而不是黑盒结论", "护士确认后才能进入排班", "高风险词自动要求二次确认"],
      railTitle: "人工确认",
      secondaryRows: [
        { label: "下一步", value: "补问 3 题" },
        { label: "医生", value: "林医生" },
        { label: "预计等待", value: "18 分钟" },
      ],
      secondaryTitle: "安排结果",
    },
    {
      feedTitle: "Follow-up automation",
      headline: "诊后自动生成复诊、用药和异常反馈跟进计划",
      metrics: [
        { label: "待随访", value: "31", note: "8 人今日到期" },
        { label: "异常反馈", value: "4", note: "需护士电话确认" },
        { label: "完成率", value: "86%", note: "较上周 +11%" },
      ],
      primaryRows: [
        { label: "术后第 3 天", value: "短信 + 电话", note: "询问疼痛和发热" },
        { label: "慢病复诊", value: "7 天后", note: "提醒带检查报告" },
        { label: "用药提醒", value: "每日 20:00", note: "可患者自助确认" },
      ],
      primaryTitle: "随访计划",
      railItems: ["异常反馈进入诊所任务池", "已完成随访写回患者时间线", "重复沟通由模板和变量自动生成"],
      railTitle: "闭环记录",
      secondaryRows: [
        { label: "自动触达", value: "23 人" },
        { label: "人工电话", value: "8 人" },
        { label: "复诊预约", value: "12 单" },
      ],
      secondaryTitle: "随访渠道",
    },
  ];

  return renderDesktopProductScreen(seed, screen, index, views[index] ?? views[0]);
}

function renderShowcaseScreen(seed: ShowcaseProjectSeed, _pack: ProductPack, screen: ShowcaseProjectScreen, index: number) {
  if (seed.kind === "reading") return renderReadFlowScreen(seed, screen, index);
  if (seed.kind === "coffee") return renderCoffeeOpsScreen(seed, screen, index);
  if (seed.kind === "clinic") return renderClinicPilotScreen(seed, screen, index);

  return renderFinSightScreen(seed, screen, index);
}

function buildShowcaseProject(seed: ShowcaseProjectSeed): StudioProjectRecord {
  const productPack = buildProductPackFromIdea(seed.sourceIdea);
  const generatedFiles = seed.screens.map((screen, index) => ({
    body: renderShowcaseScreen(seed, productPack, screen, index),
    editable: true,
    mimeType: "text/html",
    path: `screens/${String(index + 1).padStart(2, "0")}-${screen.slug}.html`,
    purpose: `showcase generated prototype screen: ${screen.name}`,
  }));

  productPack.id = `${seed.id}-product-pack`;
  productPack.sourceIdea = seed.sourceIdea;
  productPack.generatedAt = seed.createdAt;
  productPack.project.title = seed.name;
  productPack.project.oneLiner = seed.description;
  productPack.project.valueProposition = seed.description;
  productPack.prd.objective = `让目标用户在 5 分钟内理解 ${seed.name} 的核心价值，并完成一条可评审的 PRD 到原型链路。`;
  productPack.prototype.userFlow = seed.screens.map((screen) => screen.name).join(" -> ");
  productPack.prototype.screens = seed.screens.map(({ accent: _accent, metric: _metric, slug: _slug, ...screen }) => screen);
  productPack.prototype.prdLinks = seed.screens.map((screen, index) => ({
    rationale: `展示项目第 ${index + 1} 屏把 PRD 目标转成可检查的产品界面。`,
    requirement: productPack.prd.coreFeatures[index % productPack.prd.coreFeatures.length] ?? screen.goal,
    screen: screen.name,
  }));
  productPack.prototype.openDesignPrompt = `参考 OpenDesign 的项目页、Artifact Canvas 和 iframe preview，为 ${seed.name} 生成可编辑多屏原型。`;
  productPack.prototype.liveArtifact = {
    ...productPack.prototype.liveArtifact,
    id: `${seed.id}-prototype-preview`,
    title: `${seed.name} Prototype Preview`,
    files: [
      { path: "artifact.json", mimeType: "application/json", purpose: "artifact manifest" },
      { path: "data.json", mimeType: "application/json", purpose: "structured product pack data" },
      { path: "index.html", mimeType: "text/html", purpose: "prototype launcher" },
      ...generatedFiles.map((file) => ({
        mimeType: file.mimeType,
        path: file.path,
        purpose: file.purpose,
      })),
    ],
  };
  productPack.prototype.generatedArtifact = {
    entryFile: "index.html",
    files: [
      {
        body: renderShowcaseIndex(seed),
        editable: true,
        mimeType: "text/html",
        path: "index.html",
        purpose: "showcase generated prototype launcher",
      },
      ...generatedFiles,
    ],
    schemaVersion: "pmstudio.generated-prototype-files.v1",
  };
  productPack.summary.headline = `${seed.name} 已准备好用于演示 PRD 到原型工作流。`;
  productPack.summary.bullets = [
    seed.description,
    `包含 ${seed.screens.length} 个可预览、可编辑的生成原型屏幕。`,
    "项目可继续用 Codex 或 Claude Code adapter 重新生成。",
  ];

  return {
    agentEvents: [
      {
        agent: "Showcase Seeder",
        artifactId: "product-pack",
        message: `${seed.name} 示例项目已准备好，可打开查看 PRD、原型和路线图。`,
        type: "done",
      },
    ],
    createdAt: seed.createdAt,
    description: seed.description,
    designSystem: seed.designSystem,
    id: seed.id,
    name: seed.name,
    productPack,
    providerId: defaultProviderId,
    runHistory: [
      {
        createdAt: seed.createdAt,
        projectTitle: seed.name,
        providerId: defaultProviderId,
        runId: `${seed.id}-showcase-run`,
        runMode: "mock",
        sourceIdea: seed.sourceIdea,
        workflowId: defaultWorkflowId,
      },
    ],
    sourceIdea: seed.sourceIdea,
    status: "ready",
    updatedAt: seed.createdAt,
    workflowId: defaultWorkflowId,
  };
}

export function buildShowcaseProjects(): StudioProjectRecord[] {
  return showcaseProjectSeeds.map((seed) => buildShowcaseProject(seed));
}

export function ensureShowcaseProjects(storage = getBrowserStorage()): StudioProjectRecord[] {
  if (!storage) return [];

  const projects = readProjects(storage);

  if (storage.getItem(storageShowcaseSeededKey) === "1") return projects;

  const showcaseProjects = buildShowcaseProjects();
  const showcaseIds = new Set(showcaseProjects.map((project) => project.id));
  const nextProjects = [...showcaseProjects, ...projects.filter((project) => !showcaseIds.has(project.id))];

  storage.setItem(storageShowcaseSeededKey, "1");

  saveProjects(nextProjects, storage);

  const storedActiveId = storage.getItem(storageActiveProjectKey);
  const hasActive = Boolean(storedActiveId && nextProjects.some((project) => project.id === storedActiveId));

  if (!hasActive) {
    storage.setItem(storageActiveProjectKey, showcaseProjects[0]!.id);
  }

  notifyChanged();

  return nextProjects;
}

export function readProjects(storage = getBrowserStorage()): StudioProjectRecord[] {
  if (!storage) return [];

  const currentValue = parseJson(storage.getItem(storageProjectKey));
  const currentProjects = normalizeProjectList(currentValue);

  if (currentProjects.length > 0) return currentProjects;

  const migratedProjects = readLegacyProjects(storage);

  if (migratedProjects.length > 0) {
    saveProjects(migratedProjects, storage);
    const legacyActiveId = storage.getItem(legacyActiveProjectKey);
    const activeId =
      legacyActiveId && migratedProjects.some((project) => project.id === legacyActiveId)
        ? legacyActiveId
        : migratedProjects[0].id;

    storage.setItem(storageActiveProjectKey, activeId);
  }

  return migratedProjects;
}

export function listProjects(): StudioProjectRecord[] {
  return readProjects();
}

export function getProject(id: string, storage = getBrowserStorage()): StudioProjectRecord | null {
  if (!storage) return null;

  return readProjects(storage).find((project) => project.id === id) ?? null;
}

export function getActiveProjectId(storage = getBrowserStorage()): string | null {
  if (!storage) return null;

  const projects = readProjects(storage);
  const storedId = storage.getItem(storageActiveProjectKey);

  if (storedId && projects.some((project) => project.id === storedId)) return storedId;

  const firstActive = projects.find((project) => project.status !== "archived") ?? projects[0];

  if (!firstActive) return null;

  storage.setItem(storageActiveProjectKey, firstActive.id);

  return firstActive.id;
}

export function setActiveProject(id: string, storage = getBrowserStorage()) {
  if (!storage) return;

  storage.setItem(storageActiveProjectKey, id);
  notifyChanged();
}

export function createProject(
  input: CreateStudioProjectInput,
  storage = getBrowserStorage(),
): StudioProjectRecord {
  const now = new Date().toISOString();
  const sourceIdea = input.sourceIdea.trim();
  const project: StudioProjectRecord = {
    agentEvents: [],
    createdAt: now,
    description: input.description?.trim() ?? "",
    designSystem: input.designSystem ?? defaultDesignSystem,
    id: makeProjectId(),
    name: input.name?.trim() || projectNameFromIdea(sourceIdea),
    providerId: input.providerId ?? defaultProviderId,
    runHistory: [],
    sourceIdea,
    status: "empty",
    updatedAt: now,
    workflowId: input.workflowId ?? defaultWorkflowId,
  };

  if (!storage) return project;

  const projects = readProjects(storage);

  saveProjects([project, ...projects], storage);
  storage.setItem(storageActiveProjectKey, project.id);
  notifyChanged();

  return project;
}

export function updateProject(
  id: string,
  patch: Partial<Omit<StudioProjectRecord, "id" | "createdAt">>,
  storage = getBrowserStorage(),
): StudioProjectRecord | null {
  if (!storage) return null;

  const projects = readProjects(storage);
  const existing = projects.find((project) => project.id === id);

  if (!existing) return null;

  const updated: StudioProjectRecord = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: patch.updatedAt ?? new Date().toISOString(),
  };
  const nextProjects = projects.map((project) => (project.id === id ? updated : project));

  saveProjects(nextProjects, storage);
  notifyChanged();

  return updated;
}

export function duplicateProject(id: string, storage = getBrowserStorage()): StudioProjectRecord | null {
  if (!storage) return null;

  const projects = readProjects(storage);
  const source = projects.find((project) => project.id === id);

  if (!source) return null;

  const now = new Date().toISOString();
  const copy: StudioProjectRecord = {
    ...cloneJson(source),
    createdAt: now,
    id: makeProjectId(),
    name: `${source.name} 副本`,
    status: source.status === "archived" ? "ready" : source.status,
    updatedAt: now,
  };

  saveProjects([copy, ...projects], storage);
  storage.setItem(storageActiveProjectKey, copy.id);
  notifyChanged();

  return copy;
}

export function archiveProject(id: string, storage = getBrowserStorage()): StudioProjectRecord | null {
  return updateProject(id, { status: "archived" }, storage);
}

export function restoreProject(id: string, storage = getBrowserStorage()): StudioProjectRecord | null {
  const project = getProject(id, storage);

  if (!project) return null;

  return updateProject(id, { status: project.productPack ? "ready" : "empty" }, storage);
}

export function deleteProject(id: string, storage = getBrowserStorage()): boolean {
  if (!storage) return false;

  const projects = readProjects(storage);
  const nextProjects = projects.filter((project) => project.id !== id);

  if (nextProjects.length === projects.length) return false;

  saveProjects(nextProjects, storage);

  if (storage.getItem(storageActiveProjectKey) === id) {
    const nextActive = nextProjects.find((project) => project.status !== "archived") ?? nextProjects[0];

    if (nextActive) {
      storage.setItem(storageActiveProjectKey, nextActive.id);
    } else {
      storage.removeItem(storageActiveProjectKey);
    }
  }

  notifyChanged();

  return true;
}

export function buildDemoProject(storage = getBrowserStorage()): StudioProjectRecord {
  const showcaseDemo = buildShowcaseProjects().find((project) => project.id === "demo");
  const existing = storage ? getProject("demo", storage) : null;

  if (showcaseDemo) {
    if (storage) {
      const projects = readProjects(storage);
      const existingGeneratedHtml = existing?.productPack?.prototype.generatedArtifact?.files
        .map((file) => file.body)
        .join("\n");
      const shouldRefreshDemo = !existingGeneratedHtml?.includes("Market command center");

      if (!existing || shouldRefreshDemo) {
        saveProjects([showcaseDemo, ...projects.filter((project) => project.id !== "demo")], storage);
        storage.setItem(storageActiveProjectKey, showcaseDemo.id);
        notifyChanged();

        return showcaseDemo;
      }
    }

    if (!existing) return showcaseDemo;
  }

  if (existing) return existing;

  const productPack = buildProductPackFromIdea(defaultFinSightIdea);
  const now = new Date().toISOString();
  const project: StudioProjectRecord = {
    agentEvents: [
      {
        agent: "Demo Harness",
        artifactId: "product-pack",
        message: "FinSight 示例项目已加载，可继续编辑、导出或重新运行。",
        type: "done",
      },
    ],
    createdAt: productPack.generatedAt,
    description: productPack.project.oneLiner,
    designSystem: defaultDesignSystem,
    id: "demo",
    name: productPack.project.title,
    productPack,
    providerId: defaultProviderId,
    runHistory: [
      {
        createdAt: now,
        projectTitle: productPack.project.title,
        providerId: defaultProviderId,
        runId: "demo-run",
        runMode: "mock",
        sourceIdea: productPack.sourceIdea,
        workflowId: defaultWorkflowId,
      },
    ],
    sourceIdea: productPack.sourceIdea,
    status: "ready",
    updatedAt: now,
    workflowId: defaultWorkflowId,
  };

  if (storage) {
    const projects = readProjects(storage);

    saveProjects([project, ...projects.filter((item) => item.id !== project.id)], storage);
    storage.setItem(storageActiveProjectKey, project.id);
    notifyChanged();
  }

  return project;
}
