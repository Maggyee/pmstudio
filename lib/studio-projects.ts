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
const storageShowcaseSeededKey = "pmstudio:showcase-seeded:v5";
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

type ShowcaseProjectSeed = {
  createdAt: string;
  description: string;
  designSystem: string;
  id: string;
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

function renderShowcaseIndex(seed: ShowcaseProjectSeed) {
  const links = seed.screens
    .map(
      (screen, index) => `
        <a class="screen-link" href="screens/${String(index + 1).padStart(2, "0")}-${screen.slug}.html">
          <span>${escapeShowcaseHtml(String(index + 1).padStart(2, "0"))}</span>
          <strong>${escapeShowcaseHtml(screen.name)}</strong>
          <small>${escapeShowcaseHtml(screen.goal)}</small>
        </a>`,
    )
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeShowcaseHtml(seed.name)} Prototype</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: #f5f5f1; color: #111; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { min-height: 100vh; display: grid; place-items: center; padding: 32px; }
    section { width: min(920px, 100%); border: 1px solid #ddd; border-radius: 16px; background: white; box-shadow: 0 24px 60px rgba(17,17,17,.08); padding: 28px; }
    h1 { margin: 10px 0 0; font-size: clamp(32px, 5vw, 56px); line-height: 1.02; letter-spacing: 0; }
    p { margin: 12px 0 0; max-width: 680px; color: #6a6b6c; line-height: 1.7; }
    .eyebrow { color: #12a7ff; font-size: 12px; font-weight: 800; text-transform: uppercase; }
    .grid { margin-top: 24px; display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .screen-link { display: grid; gap: 8px; min-height: 176px; border: 1px solid #eee; border-radius: 12px; background: #fbfaf7; padding: 16px; color: inherit; text-decoration: none; }
    .screen-link span { width: fit-content; border-radius: 999px; background: #111; color: white; padding: 5px 8px; font-size: 11px; font-weight: 800; }
    .screen-link strong { font-size: 18px; }
    .screen-link small { color: #6a6b6c; line-height: 1.5; }
    @media (max-width: 760px) { main { padding: 18px; } section { padding: 20px; } .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <section data-od-id="showcase-index">
      <span class="eyebrow">PM Studio Showcase</span>
      <h1>${escapeShowcaseHtml(seed.name)}</h1>
      <p>${escapeShowcaseHtml(seed.description)}</p>
      <div class="grid">${links}</div>
    </section>
  </main>
</body>
</html>`;
}

function renderShowcaseScreen(seed: ShowcaseProjectSeed, pack: ProductPack, screen: ShowcaseProjectScreen, index: number) {
  const secondary = seed.screens[(index + 1) % seed.screens.length];
  const chips = screen.components
    .map((component) => `<span>${escapeShowcaseHtml(component)}</span>`)
    .join("");
  const roadmapItems = pack.roadmap[0]?.items ?? pack.prd.mvpScope.slice(0, 3);

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeShowcaseHtml(screen.name)} · ${escapeShowcaseHtml(seed.name)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: #f5f5f1; color: #111; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    button { font: inherit; }
    .page { min-height: 100vh; padding: 26px; }
    .shell { min-height: calc(100vh - 52px); display: grid; grid-template-columns: 260px minmax(0, 1fr); border: 1px solid #ddd; border-radius: 18px; background: white; box-shadow: 0 24px 70px rgba(17,17,17,.08); overflow: hidden; }
    aside { border-right: 1px solid #eee; background: #fbfaf7; padding: 18px; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; }
    .dot { width: 12px; height: 12px; border-radius: 999px; background: ${screen.accent}; box-shadow: 0 0 0 5px color-mix(in oklch, ${screen.accent} 14%, transparent); }
    nav { margin-top: 24px; display: grid; gap: 8px; }
    nav a { border: 1px solid #eee; border-radius: 10px; background: white; padding: 11px; color: #6a6b6c; text-decoration: none; font-size: 13px; }
    nav a.active { border-color: color-mix(in oklch, ${screen.accent} 45%, #ddd); color: #111; box-shadow: 0 10px 24px rgba(17,17,17,.06); }
    main { min-width: 0; padding: 24px; }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .label { color: ${screen.accent}; font-size: 12px; font-weight: 800; text-transform: uppercase; }
    h1 { margin: 10px 0 0; max-width: 760px; font-size: clamp(32px, 5vw, 58px); line-height: 1.02; letter-spacing: 0; }
    .goal { margin: 12px 0 0; max-width: 720px; color: #6a6b6c; line-height: 1.7; }
    .primary { border: 0; border-radius: 10px; background: #111; color: white; padding: 11px 14px; font-weight: 750; }
    .grid { margin-top: 24px; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(280px, .8fr); gap: 16px; }
    .panel { border: 1px solid #eee; border-radius: 14px; background: #fff; padding: 16px; }
    .panel.warm { background: #fbfaf7; }
    .metric { display: grid; gap: 8px; border-radius: 14px; background: color-mix(in oklch, ${screen.accent} 13%, white); padding: 16px; }
    .metric strong { font-size: 28px; line-height: 1; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .chips span { border: 1px solid #ddd; border-radius: 999px; background: white; padding: 8px 10px; font-size: 12px; color: #555; }
    .rows { display: grid; gap: 10px; margin-top: 12px; }
    .row { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px solid #eee; padding: 10px 0; color: #6a6b6c; font-size: 13px; }
    .row:last-child { border-bottom: 0; }
    @media (max-width: 860px) { .page { padding: 14px; } .shell, .grid { grid-template-columns: 1fr; } aside { border-right: 0; border-bottom: 1px solid #eee; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="shell" data-od-id="screen-${index}">
      <aside>
        <div class="brand"><span class="dot"></span>${escapeShowcaseHtml(seed.name)}</div>
        <nav>
          ${seed.screens
            .map(
              (item, itemIndex) =>
                `<a class="${itemIndex === index ? "active" : ""}" href="${String(itemIndex + 1).padStart(2, "0")}-${item.slug}.html">${escapeShowcaseHtml(item.name)}</a>`,
            )
            .join("")}
        </nav>
      </aside>
      <main>
        <div class="top">
          <div>
            <span class="label">0${index + 1} / Prototype screen</span>
            <h1 data-od-id="screen-${index}-name">${escapeShowcaseHtml(screen.name)}</h1>
          </div>
          <button class="primary" data-od-id="screen-${index}-action">${escapeShowcaseHtml(screen.primaryAction)}</button>
        </div>
        <p class="goal" data-od-id="screen-${index}-goal">${escapeShowcaseHtml(screen.goal)}</p>
        <div class="grid">
          <section class="panel">
            <span class="label">核心模块</span>
            <div class="chips">${chips}</div>
            <div class="rows">
              ${roadmapItems
                .slice(0, 3)
                .map((item, itemIndex) => `<div class="row"><span>${escapeShowcaseHtml(item)}</span><strong>0${itemIndex + 1}</strong></div>`)
                .join("")}
            </div>
          </section>
          <section class="panel warm">
            <div class="metric">
              <span class="label">Success metric</span>
              <strong>${escapeShowcaseHtml(screen.metric)}</strong>
              <small>${escapeShowcaseHtml(pack.prd.objective)}</small>
            </div>
            <div class="rows">
              <div class="row"><span>下一屏</span><strong>${escapeShowcaseHtml(secondary.name)}</strong></div>
              <div class="row"><span>PRD Trace</span><strong>${escapeShowcaseHtml(pack.prd.coreFeatures[index % pack.prd.coreFeatures.length] ?? "核心功能")}</strong></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</body>
</html>`;
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

  const existingIds = new Set(projects.map((project) => project.id));
  const showcaseProjects = buildShowcaseProjects().filter((project) => !existingIds.has(project.id));

  storage.setItem(storageShowcaseSeededKey, "1");

  if (!showcaseProjects.length) return projects;

  const nextProjects = [...showcaseProjects, ...projects];

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
  const existing = storage ? getProject("demo", storage) : null;

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
