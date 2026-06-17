"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  Download,
  Eye,
  FileCode2,
  FileText,
  Layers3,
  Loader2,
  MessageSquareText,
  MoreHorizontal,
  MousePointer2,
  Pencil,
  Presentation,
  RotateCcw,
  Save,
  Send,
  Share2,
  Sparkles,
} from "lucide-react";

import { AgentPanel } from "@/components/studio/agent-panel";
import { ProductPackSummary } from "@/components/studio/product-pack-summary";
import { PrdPreview } from "@/components/studio/prd-preview";
import { PrdPrototypeMap } from "@/components/prd-prototype-map";
import { ResearchPreview } from "@/components/studio/research-preview";
import { StudioPrototypePreview } from "@/components/studio/prototype-preview";
import { SummaryPreview } from "@/components/studio/summary-preview";
import {
  studioTabs,
} from "@/lib/mock-data";
import type {
  AgentProviderId,
  AgentRunMode,
  AgentRunHistoryItem,
  GeneratedPack,
  HarnessEvent,
  WorkflowId,
} from "@/lib/agent-harness";
import {
  buildFinSightProductPack,
  defaultFinSightIdea,
  type ProductPack,
} from "@/lib/product-pack";
import { cn } from "@/lib/utils";

function CompetitorsPreview({ productPack }: { productPack?: ProductPack }) {
  const competitors = productPack?.competitors ?? [];
  const opportunitySummary =
    productPack?.project.valueProposition ??
    "金融数据终端强在数据深度，自动化投顾强在配置体验。FinSight 的机会在顾问工作流和客户解释层。";

  return (
    <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <aside className="bg-neutral-950 p-6 text-white">
          <h2 className="text-xl font-semibold">竞品机会矩阵</h2>
          <p className="mt-3 text-sm leading-7 text-white/65">
            {opportunitySummary}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
            <span className="rounded-full bg-white/10 px-3 py-2">数据深度</span>
            <span className="rounded-full bg-white/10 px-3 py-2">客户沟通</span>
            <span className="rounded-full bg-white/10 px-3 py-2">合规审阅</span>
            <span className="rounded-full bg-white/10 px-3 py-2">任务闭环</span>
          </div>
        </aside>
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[860px] border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-neutral-500">
                <th className="px-4 py-2">竞品</th>
                <th className="px-4 py-2">定位</th>
                <th className="px-4 py-2">优势</th>
                <th className="px-4 py-2">短板</th>
                <th className="px-4 py-2">机会</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((item) => (
                <tr className="bg-neutral-50 text-neutral-700 shadow-sm" key={item.competitor}>
                  <td className="rounded-l-2xl border-y border-l border-black/10 px-4 py-4 font-semibold text-neutral-950">
                    {item.competitor}
                  </td>
                  <td className="border-y border-black/10 px-4 py-4">{item.positioning}</td>
                  <td className="border-y border-black/10 px-4 py-4">{item.strength}</td>
                  <td className="border-y border-black/10 px-4 py-4 text-neutral-500">{item.weakness}</td>
                  <td className="rounded-r-2xl border-y border-r border-black/10 px-4 py-4 text-emerald-700">
                    {item.opportunity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PersonasPreview({ productPack }: { productPack?: ProductPack }) {
  const personas = productPack?.personas ?? [];

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-5">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-950">用户画像与服务路径</h2>
          <p className="mt-1 text-sm text-neutral-500">从会前准备到会后跟进，覆盖财富管理团队的核心协作角色。</p>
        </div>
        <span className="rounded-full border border-black/10 bg-neutral-50 px-3 py-1 text-xs text-neutral-500">
          {personas.length} 个核心角色
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
      {personas.map((persona) => (
        <article className="rounded-[24px] border border-black/10 bg-neutral-50 p-5" key={persona.name}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold">{persona.name}</p>
              <p className="mt-1 text-sm text-emerald-700">{persona.role}</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileText className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 border-l-2 border-emerald-500 pl-4">
            <p className="text-xs font-semibold tracking-normal text-neutral-500">目标</p>
            <p className="mt-2 text-sm leading-6 text-neutral-700">{persona.goal}</p>
          </div>
          <div className="mt-4 border-l-2 border-rose-400 pl-4">
            <p className="text-xs font-semibold tracking-normal text-rose-600">痛点</p>
            <p className="mt-2 text-sm leading-6 text-neutral-700">{persona.pain}</p>
          </div>
        </article>
      ))}
      </div>
    </div>
  );
}

function RoadmapPreview({ productPack }: { productPack?: ProductPack }) {
  const roadmap = productPack?.roadmap ?? [];

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-950">产品路线图</h2>
        <p className="mt-2 text-sm text-neutral-500">{productPack?.summary.headline}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
      {roadmap.map((column) => (
        <section className="relative border-t-2 border-neutral-950 pt-5" key={column.horizon}>
          <span className="absolute -top-[9px] left-0 h-4 w-4 rounded-full bg-neutral-950 ring-4 ring-white" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{column.horizon}</h2>
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-500">
              {column.items.length} 项
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {column.items.map((item) => (
              <div
                className="rounded-full border border-black/10 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-700"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      ))}
      </div>
    </div>
  );
}

const localProductPackStorageKey = "pmstudio:last-product-pack:v1";
const localEventsStorageKey = "pmstudio:last-agent-events:v1";
const localRunHistoryStorageKey = "pmstudio:run-history:v1";

type ExportFormat = ProductPack["artifactIndex"][number]["exportFormats"][number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProductPack(value: unknown): value is ProductPack {
  return (
    isRecord(value) &&
    value.schemaVersion === "pm-product-pack.v1" &&
    typeof value.sourceIdea === "string" &&
    isRecord(value.project) &&
    isRecord(value.prd) &&
    isRecord(value.prototype)
  );
}

function isHarnessEventList(value: unknown): value is HarnessEvent[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.type === "string" &&
        typeof item.agent === "string" &&
        typeof item.message === "string",
    )
  );
}

function isRunHistoryList(value: unknown): value is AgentRunHistoryItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.runId === "string" &&
        typeof item.providerId === "string" &&
        typeof item.runMode === "string" &&
        typeof item.workflowId === "string" &&
        typeof item.projectTitle === "string" &&
        typeof item.sourceIdea === "string" &&
        typeof item.createdAt === "string",
    )
  );
}

function listToEditableValue(items: string[]) {
  return items.join("\n");
}

function editableValueToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function EditableListField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-neutral-500">{label}</span>
      <textarea
        className="mt-2 min-h-28 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 text-sm leading-6 text-neutral-800 outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/35"
        onChange={(event) => onChange(editableValueToList(event.target.value))}
        value={listToEditableValue(value)}
      />
    </label>
  );
}

function ArtifactEditPanel({
  activeTab,
  productPack,
  onChange,
  onReset,
}: {
  activeTab: (typeof studioTabs)[number];
  productPack: ProductPack;
  onChange: (productPack: ProductPack) => void;
  onReset: () => void;
}) {
  function update(updater: (productPack: ProductPack) => ProductPack) {
    onChange(updater(productPack));
  }

  return (
    <div className="mb-5 rounded-2xl border border-black/10 bg-neutral-50 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-950">本地编辑模式</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            修改会立即更新当前画布、预览和导出链接，并自动保存到本机浏览器。
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <span className="inline-flex h-8 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-medium text-emerald-700">
            <Save className="h-3.5 w-3.5" />
            自动保存
          </span>
          <button
            className="inline-flex h-8 items-center gap-2 rounded-full border border-black/10 bg-white px-3 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100"
            onClick={onReset}
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            恢复默认
          </button>
        </div>
      </div>

      {activeTab === "PRD" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block lg:col-span-2">
            <span className="text-xs font-semibold text-neutral-500">PRD 目标</span>
            <textarea
              className="mt-2 min-h-20 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 text-sm leading-6 text-neutral-800 outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/35"
              onChange={(event) =>
                update((pack) => ({
                  ...pack,
                  prd: {
                    ...pack.prd,
                    objective: event.target.value,
                  },
                }))
              }
              value={productPack.prd.objective}
            />
          </label>
          <EditableListField
            label="核心功能，一行一个"
            onChange={(coreFeatures) =>
              update((pack) => ({
                ...pack,
                prd: {
                  ...pack.prd,
                  coreFeatures,
                },
              }))
            }
            value={productPack.prd.coreFeatures}
          />
          <EditableListField
            label="MVP 范围，一行一个"
            onChange={(mvpScope) =>
              update((pack) => ({
                ...pack,
                prd: {
                  ...pack.prd,
                  mvpScope,
                },
              }))
            }
            value={productPack.prd.mvpScope}
          />
        </div>
      ) : null}

      {activeTab === "原型" ? (
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-neutral-500">用户流程</span>
            <textarea
              className="mt-2 min-h-20 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 text-sm leading-6 text-neutral-800 outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/35"
              onChange={(event) =>
                update((pack) => ({
                  ...pack,
                  prototype: {
                    ...pack.prototype,
                    userFlow: event.target.value,
                  },
                }))
              }
              value={productPack.prototype.userFlow}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-neutral-500">OpenDesign 原型提示词</span>
            <textarea
              className="mt-2 min-h-24 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 text-sm leading-6 text-neutral-800 outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/35"
              onChange={(event) =>
                update((pack) => ({
                  ...pack,
                  prototype: {
                    ...pack.prototype,
                    openDesignPrompt: event.target.value,
                  },
                }))
              }
              value={productPack.prototype.openDesignPrompt}
            />
          </label>
          <div className="grid gap-3 lg:grid-cols-2">
            {productPack.prototype.screens.map((screen, index) => (
              <div className="rounded-xl border border-black/10 bg-white p-3" key={screen.name}>
                <p className="text-xs font-semibold text-neutral-500">{screen.name}</p>
                <label className="mt-3 block">
                  <span className="text-[11px] font-medium text-neutral-400">页面目标</span>
                  <textarea
                    className="mt-1 min-h-20 w-full resize-y rounded-lg border border-black/10 bg-neutral-50 px-3 py-2 text-sm leading-6 text-neutral-800 outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/35"
                    onChange={(event) =>
                      update((pack) => ({
                        ...pack,
                        prototype: {
                          ...pack.prototype,
                          screens: pack.prototype.screens.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  goal: event.target.value,
                                }
                              : item,
                          ),
                        },
                      }))
                    }
                    value={screen.goal}
                  />
                </label>
                <label className="mt-3 block">
                  <span className="text-[11px] font-medium text-neutral-400">主操作</span>
                  <input
                    className="mt-1 h-9 w-full rounded-lg border border-black/10 bg-neutral-50 px-3 text-sm text-neutral-800 outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/35"
                    onChange={(event) =>
                      update((pack) => ({
                        ...pack,
                        prototype: {
                          ...pack.prototype,
                          screens: pack.prototype.screens.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  primaryAction: event.target.value,
                                }
                              : item,
                          ),
                        },
                      }))
                    }
                    value={screen.primaryAction}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab !== "PRD" && activeTab !== "原型" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block lg:col-span-2">
            <span className="text-xs font-semibold text-neutral-500">产品定位</span>
            <textarea
              className="mt-2 min-h-20 w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 text-sm leading-6 text-neutral-800 outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/35"
              onChange={(event) =>
                update((pack) => ({
                  ...pack,
                  project: {
                    ...pack.project,
                    positioning: event.target.value,
                  },
                }))
              }
              value={productPack.project.positioning}
            />
          </label>
          <EditableListField
            label="项目摘要要点，一行一个"
            onChange={(bullets) =>
              update((pack) => ({
                ...pack,
                summary: {
                  ...pack.summary,
                  bullets,
                },
              }))
            }
            value={productPack.summary.bullets}
          />
          <EditableListField
            label="下一步动作，一行一个"
            onChange={(nextActions) =>
              update((pack) => ({
                ...pack,
                summary: {
                  ...pack.summary,
                  nextActions,
                },
              }))
            }
            value={productPack.summary.nextActions}
          />
        </div>
      ) : null}
    </div>
  );
}

type ArtifactAction = {
  artifactId?: string;
  format?: ExportFormat;
  href?: string;
  label: string;
};

function ActionIcon({ action }: { action: ArtifactAction }) {
  if (action.label.includes("Markdown")) return <FileText className="h-4 w-4" />;
  if (action.label.includes("PDF")) return <Download className="h-4 w-4" />;
  if (action.label.includes("HTML")) return <FileCode2 className="h-4 w-4" />;
  if (action.label.includes("JSON")) return <FileCode2 className="h-4 w-4" />;
  if (action.label.includes("PPTX")) return <Presentation className="h-4 w-4" />;
  if (action.label.includes("Codex")) return <Send className="h-4 w-4" />;
  return <Share2 className="h-4 w-4" />;
}

function ArtifactView({
  activeTab,
  activeViewport,
  isPrototypeExporting,
  onEditPrototypePrompt,
  onExportPrototypeHtml,
  onRequestGenerate,
  productPack,
}: {
  activeTab: (typeof studioTabs)[number];
  activeViewport?: string;
  isPrototypeExporting?: boolean;
  onEditPrototypePrompt?: () => void;
  onExportPrototypeHtml?: () => void;
  onRequestGenerate?: () => void;
  productPack?: ProductPack;
}) {
  if (activeTab === "PRD") {
    return <PrdPreview productPack={productPack} />;
  }

  if (activeTab === "原型") {
    return (
      <div className="space-y-5">
        <StudioPrototypePreview
          activeViewport={activeViewport}
          isExporting={isPrototypeExporting}
          onEditPrompt={onEditPrototypePrompt}
          onExportHtml={onExportPrototypeHtml}
          onRegenerate={onRequestGenerate}
          productPack={productPack}
        />
        <PrdPrototypeMap productPack={productPack} />
      </div>
    );
  }

  if (activeTab === "调研") {
    return <ResearchPreview productPack={productPack} />;
  }

  if (activeTab === "竞品") {
    return <CompetitorsPreview productPack={productPack} />;
  }

  if (activeTab === "画像") {
    return <PersonasPreview productPack={productPack} />;
  }

  if (activeTab === "路线图") {
    return <RoadmapPreview productPack={productPack} />;
  }

  return <SummaryPreview productPack={productPack} />;
}

const artifactParamByTab: Record<(typeof studioTabs)[number], string> = {
  PRD: "prd",
  原型: "prototype",
  调研: "research",
  竞品: "competitors",
  画像: "personas",
  路线图: "roadmap",
  总结: "summary",
};

const artifactIndexIdByTab: Record<(typeof studioTabs)[number], string> = {
  PRD: "prd",
  原型: "prototype",
  调研: "research",
  竞品: "competitors",
  画像: "personas",
  路线图: "roadmap",
  总结: "executive-summary",
};

const tabByArtifactParam: Record<string, (typeof studioTabs)[number]> = {
  prd: "PRD",
  prototype: "原型",
  research: "调研",
  competitors: "竞品",
  personas: "画像",
  roadmap: "路线图",
  summary: "总结",
  "executive-summary": "总结",
};

function getTabFromArtifactParam(artifact?: string) {
  if (!artifact) return "原型";

  return tabByArtifactParam[artifact] ?? "原型";
}

function getArtifactHref(tab: (typeof studioTabs)[number], activeViewport?: string) {
  const artifact = artifactParamByTab[tab];

  if (tab === "原型" && activeViewport) {
    return `/app?artifact=${artifact}&viewport=${activeViewport}`;
  }

  return `/app?artifact=${artifact}`;
}

function getExportActionLabel(format: ExportFormat) {
  const labels: Record<ExportFormat, string> = {
    html: "导出 HTML",
    json: "导出 JSON",
    markdown: "导出 Markdown",
    pdf: "导出 PDF",
    pptx: "导出 PPTX",
  };

  return labels[format];
}

function getArtifactActions(tab: (typeof studioTabs)[number], productPack: ProductPack): ArtifactAction[] {
  const artifactId = artifactIndexIdByTab[tab];
  const artifact = productPack.artifactIndex.find((item) => item.id === artifactId);
  const exportActions =
    artifact?.exportFormats.map((format) => ({
      artifactId,
      format,
      label: getExportActionLabel(format),
    })) ?? [
      {
        artifactId,
        format: "markdown" as const,
        label: "导出 Markdown",
      },
    ];
  const openAction = { label: tab === "原型" ? "在 Open Design 打开" : "发送到 Codex" };

  return [...exportActions, openAction];
}

function getWorkflowIdForTab(tab: (typeof studioTabs)[number]): WorkflowId {
  if (tab === "原型") return "prd-to-prototype-linker";
  if (tab === "总结") return "project-summarizer";

  return "idea-to-product-pack";
}

const demoPromptPresets = [
  {
    label: "完整方案",
    prompt: defaultFinSightIdea,
  },
  {
    label: "原型联动",
    prompt:
      "基于 FinSight 的 PRD，提取核心功能、用户路径和页面需求，生成可预览的财富顾问工作台原型结构。",
  },
  {
    label: "汇报摘要",
    prompt:
      "把 FinSight 的产品定位、PRD、原型、市场机会、竞品方向和路线图整理成 AI 提效比赛的项目汇报摘要。",
  },
];

function getRunModeLabel(mode?: AgentRunMode) {
  const labels: Record<AgentRunMode, string> = {
    "api-fallback-dry-run": "API dry-run",
    "claude-dry-run": "Claude dry-run",
    "codex-cli": "Codex CLI",
    "codex-dry-run": "Codex dry-run",
    mock: "Mock provider",
  };

  return mode ? labels[mode] : "Mock provider";
}

function getProviderLabel(providerId: AgentProviderId) {
  const labels: Record<AgentProviderId, string> = {
    "api-fallback": "API fallback",
    "claude-code": "Claude Code",
    codex: "Codex",
    mock: "Mock",
  };

  return labels[providerId];
}

export function ArtifactCanvas({
  activeArtifact,
  activeViewport,
  agentEvents,
  onProductPackChange,
  productPack,
  providerId = "mock",
}: {
  activeArtifact?: string;
  activeViewport?: string;
  agentEvents?: HarnessEvent[];
  onProductPackChange?: (productPack: ProductPack) => void;
  productPack?: ProductPack;
  providerId?: AgentProviderId;
}) {
  const activeTab = getTabFromArtifactParam(activeArtifact);
  const [activeMode, setActiveMode] = useState<"生成" | "修改" | "预览">("生成");
  const [currentEvents, setCurrentEvents] = useState(agentEvents);
  const [currentPack, setCurrentPack] = useState(
    productPack ?? buildFinSightProductPack(defaultFinSightIdea),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportingAction, setExportingAction] = useState<string | null>(null);
  const [lastRunMode, setLastRunMode] = useState<AgentRunMode>("mock");
  const [runHistory, setRunHistory] = useState<AgentRunHistoryItem[]>([]);
  const [prompt, setPrompt] = useState(currentPack.sourceIdea);
  const [runError, setRunError] = useState<string | null>(null);
  const runInputRef = useRef<HTMLInputElement>(null);
  const projectTitle = currentPack.project.title;
  const artifactActions = getArtifactActions(activeTab, currentPack);

  useEffect(() => {
    let storedPack: ProductPack | null = null;
    let storedEvents: HarnessEvent[] | null = null;
    let storedRunHistory: AgentRunHistoryItem[] | null = null;

    try {
      const storedPackValue = window.localStorage.getItem(localProductPackStorageKey);
      const storedEventsValue = window.localStorage.getItem(localEventsStorageKey);
      const storedRunHistoryValue = window.localStorage.getItem(localRunHistoryStorageKey);

      if (storedPackValue) {
        const parsedPack: unknown = JSON.parse(storedPackValue);

        if (isProductPack(parsedPack)) {
          storedPack = parsedPack;
        }
      }

      if (storedEventsValue) {
        const parsedEvents: unknown = JSON.parse(storedEventsValue);

        if (isHarnessEventList(parsedEvents)) {
          storedEvents = parsedEvents;
        }
      }

      if (storedRunHistoryValue) {
        const parsedRunHistory: unknown = JSON.parse(storedRunHistoryValue);

        if (isRunHistoryList(parsedRunHistory)) {
          storedRunHistory = parsedRunHistory;
        }
      }
    } catch {
      window.localStorage.removeItem(localProductPackStorageKey);
      window.localStorage.removeItem(localEventsStorageKey);
      window.localStorage.removeItem(localRunHistoryStorageKey);
    }

    const timeoutId = window.setTimeout(() => {
      if (storedPack) {
        setCurrentPack(storedPack);
        setPrompt(storedPack.sourceIdea);
      }

      if (storedEvents) {
        setCurrentEvents(storedEvents);
      }

      if (storedRunHistory) {
        setRunHistory(storedRunHistory);
        setLastRunMode(storedRunHistory[0]?.runMode ?? "mock");
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(localProductPackStorageKey, JSON.stringify(currentPack));
    onProductPackChange?.(currentPack);
  }, [currentPack, onProductPackChange]);

  useEffect(() => {
    if (currentEvents?.length) {
      window.localStorage.setItem(localEventsStorageKey, JSON.stringify(currentEvents));
    }
  }, [currentEvents]);

  useEffect(() => {
    window.localStorage.setItem(localRunHistoryStorageKey, JSON.stringify(runHistory));
  }, [runHistory]);

  function handleResetToDefault() {
    const nextPack = buildFinSightProductPack(defaultFinSightIdea);

    window.localStorage.removeItem(localProductPackStorageKey);
    window.localStorage.removeItem(localEventsStorageKey);
    window.localStorage.removeItem(localRunHistoryStorageKey);
    setCurrentPack(nextPack);
    setCurrentEvents(agentEvents);
    setRunHistory([]);
    setLastRunMode("mock");
    setPrompt(nextPack.sourceIdea);
    setActiveMode("预览");
  }

  const handleExportAction = useCallback(async (action: ArtifactAction) => {
    if (!action.artifactId || !action.format) return;

    const actionKey = `${action.artifactId}:${action.format}`;
    setExportingAction(actionKey);
    setRunError(null);

    try {
      const response = await fetch("/api/export", {
        body: JSON.stringify({
          artifact: action.artifactId,
          format: action.format,
          productPack: currentPack,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? "Export failed");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filename =
        disposition?.match(/filename="([^"]+)"/)?.[1] ??
        `${currentPack.id}-${action.artifactId}.${action.format === "markdown" ? "md" : action.format}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "导出失败");
    } finally {
      setExportingAction(null);
    }
  }, [currentPack]);

  useEffect(() => {
    function focusRunInput() {
      setActiveMode("生成");
      window.setTimeout(() => {
        runInputRef.current?.focus();
        runInputRef.current?.select();
      }, 0);
    }

    function exportCurrentPack() {
      void handleExportAction({
        artifactId: "product-pack",
        format: "markdown",
        label: "导出 Markdown",
      });
    }

    window.addEventListener("pmstudio:focus-run-input", focusRunInput);
    window.addEventListener("pmstudio:export-current-pack", exportCurrentPack);

    return () => {
      window.removeEventListener("pmstudio:focus-run-input", focusRunInput);
      window.removeEventListener("pmstudio:export-current-pack", exportCurrentPack);
    };
  }, [handleExportAction]);

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = prompt.trim() || currentPack.sourceIdea || defaultFinSightIdea;
    setIsGenerating(true);
    setRunError(null);

    try {
      const response = await fetch("/api/generate", {
        body: JSON.stringify({
          input,
          providerId,
          workflowId: getWorkflowIdForTab(activeTab),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? "Generation failed");
      }

      const generated = (await response.json()) as GeneratedPack;
      setCurrentPack(generated.productPack);
      setCurrentEvents(generated.events);
      setLastRunMode(generated.runMode ?? "mock");
      setRunHistory((history) => [
        {
          createdAt: new Date().toISOString(),
          projectTitle: generated.productPack.project.title,
          providerId: generated.providerId ?? providerId,
          runId: generated.runId ?? `run-${Date.now()}`,
          runMode: generated.runMode ?? "mock",
          sourceIdea: generated.input,
          workflowId: generated.workflowId,
        },
        ...history,
      ].slice(0, 8));
      setPrompt(generated.input);
      setActiveMode("预览");
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="min-h-screen bg-[#fbfaf7]/62">
      <div className="relative z-50 flex flex-col gap-3 border-b border-black/10 bg-[#fbfaf7]/72 px-4 py-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Layers3 className="h-4 w-4 text-neutral-500" />
          <div className="min-w-0">
            <p className="text-xs text-neutral-500">交付物画布</p>
            <h1 className="truncate text-lg font-semibold">{projectTitle}</h1>
          </div>
        </div>
        <div className="liquid-glass relative z-50 flex w-full max-w-full gap-1 overflow-x-auto rounded-full p-1 sm:w-auto">
          {studioTabs.map((tab) => (
            <Link
              className={cn(
                "pointer-events-auto relative z-50 inline-flex h-8 shrink-0 items-center rounded-full px-3 text-sm font-medium text-neutral-500 transition hover:bg-white/70 hover:text-neutral-950 active:scale-[0.98]",
                activeTab === tab && "bg-white text-neutral-950 shadow-sm ring-1 ring-black/5",
              )}
              href={getArtifactHref(tab, activeViewport)}
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              scroll={false}
            >
              {tab}
            </Link>
          ))}
        </div>
      </div>

      <div className="relative min-h-[980px] overflow-hidden bg-[linear-gradient(rgba(38,38,38,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(38,38,38,0.045)_1px,transparent_1px)] bg-[size:24px_24px] px-3 py-8 sm:px-5">
        <div className="liquid-glass pointer-events-none absolute right-4 top-5 z-40 hidden rounded-full p-1 lg:flex 2xl:right-8">
          <button
            className={cn(
              "pointer-events-auto inline-flex h-8 items-center gap-2 rounded-full px-3 text-sm font-medium transition hover:bg-white active:scale-[0.98]",
              activeMode === "生成"
                ? "bg-white text-neutral-950 shadow-sm"
                : "text-neutral-600 hover:text-black",
            )}
            onClick={() => setActiveMode("生成")}
            type="button"
          >
            <Sparkles className="h-4 w-4" />
            生成
          </button>
          <button
            className={cn(
              "pointer-events-auto inline-flex h-8 items-center gap-2 rounded-full px-3 text-sm font-medium transition hover:bg-white active:scale-[0.98]",
              activeMode === "修改"
                ? "bg-white text-neutral-950 shadow-sm"
                : "text-neutral-600 hover:text-black",
            )}
            onClick={() => setActiveMode("修改")}
            type="button"
          >
            <Pencil className="h-4 w-4" />
            修改
          </button>
          <button
            className={cn(
              "pointer-events-auto inline-flex h-8 items-center gap-2 rounded-full px-3 text-sm font-medium transition hover:bg-white active:scale-[0.98]",
              activeMode === "预览"
                ? "bg-white text-neutral-950 shadow-sm"
                : "text-neutral-600 hover:text-black",
            )}
            onClick={() => setActiveMode("预览")}
            type="button"
          >
            <Eye className="h-4 w-4" />
            预览
          </button>
          <button
            className="pointer-events-auto inline-flex h-8 items-center gap-2 rounded-full px-2 text-neutral-600 transition hover:bg-white hover:text-black active:scale-[0.98]"
            type="button"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="pointer-events-none absolute right-4 top-36 z-30 hidden w-[290px] lg:block 2xl:right-8 2xl:w-[310px]">
          <div className="pointer-events-none">
            <AgentPanel
              events={currentEvents}
              productPack={currentPack}
              runHistory={runHistory}
              variant="floating"
            />
          </div>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="min-w-0 space-y-6">
            <ProductPackSummary productPack={currentPack} />

            <div className="mx-auto min-w-0 max-w-5xl overflow-hidden rounded-[24px] border border-black/10 bg-white/72 shadow-2xl shadow-black/10 backdrop-blur">
              <div className="flex items-center justify-between border-b border-neutral-200 bg-white/78 px-4 py-2 backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                  <MousePointer2 className="h-4 w-4 text-neutral-500" />
                  当前交付物
                  <span className="rounded-full bg-neutral-950 px-2 py-1 text-white">
                    {activeTab}
                  </span>
                </div>
              </div>
              <div key={activeTab} className="min-w-0 bg-white/72 p-3 sm:p-6">
                {activeMode === "修改" ? (
                  <ArtifactEditPanel
                    activeTab={activeTab}
                    onChange={setCurrentPack}
                    onReset={handleResetToDefault}
                    productPack={currentPack}
                  />
                ) : null}
                <ArtifactView
                  activeTab={activeTab}
                  activeViewport={activeViewport}
                  isPrototypeExporting={exportingAction === "prototype:html"}
                  onEditPrototypePrompt={() => setActiveMode("修改")}
                  onExportPrototypeHtml={() =>
                    handleExportAction({
                      artifactId: "prototype",
                      format: "html",
                      label: "导出 HTML",
                    })
                  }
                  onRequestGenerate={() => setActiveMode("生成")}
                  productPack={currentPack}
                />
              </div>
            </div>

            <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto pb-2">
              {artifactActions.map((action, index) => (
                action.href ? (
                  <a
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border px-3 text-sm font-medium shadow-sm transition",
                      "border-black/10 bg-white text-neutral-700 hover:bg-neutral-50",
                    )}
                    href={action.href}
                    key={action.label}
                  >
                    <ActionIcon action={action} />
                    {action.label}
                  </a>
                ) : (
                  <button
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border px-3 text-sm font-medium shadow-sm transition",
                      index === artifactActions.length - 1
                        ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
                        : "border-black/10 bg-white text-neutral-700 hover:bg-neutral-50",
                    )}
                    disabled={exportingAction === `${action.artifactId}:${action.format}`}
                    key={action.label}
                    onClick={() => handleExportAction(action)}
                    type="button"
                  >
                    <ActionIcon action={action} />
                    {exportingAction === `${action.artifactId}:${action.format}` ? "导出中" : action.label}
                  </button>
                )
              ))}
            </div>
          </div>
        </div>

        <form
          className="liquid-glass sticky bottom-5 z-30 mx-auto mt-10 max-w-2xl rounded-[22px] p-3"
          onSubmit={handleGenerate}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="truncate px-2 text-xs font-medium text-neutral-500">
              智能体：{getProviderLabel(providerId)}
            </span>
            <span className="px-2 text-xs font-medium text-neutral-500">
              {getRunModeLabel(lastRunMode)}
            </span>
          </div>
          <div className="mb-2 flex gap-1 overflow-x-auto px-8">
            {demoPromptPresets.map((preset) => (
              <button
                className="h-7 shrink-0 rounded-full border border-black/8 bg-white/55 px-3 text-xs font-medium text-neutral-500 transition hover:bg-white hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isGenerating}
                key={preset.label}
                onClick={() => setPrompt(preset.prompt)}
                type="button"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <MessageSquareText className="h-5 w-5 text-neutral-400" />
            <input
              ref={runInputRef}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
              disabled={isGenerating}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="让 PM Studio 继续细化任意交付物..."
              type="text"
              value={prompt}
            />
            <button
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white disabled:cursor-not-allowed disabled:bg-neutral-400"
              disabled={isGenerating}
              type="submit"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
          {runError ? <p className="mt-2 px-8 text-xs text-rose-600">{runError}</p> : null}
        </form>
      </div>
    </section>
  );
}
