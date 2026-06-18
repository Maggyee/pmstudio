"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Braces,
  Download,
  Eye,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  Layers3,
  Loader2,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  Presentation,
  RotateCcw,
  Save,
  Send,
  Share2,
  Sparkles,
} from "lucide-react";

import { AgentPanel } from "@/components/studio/agent-panel";
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
  handoffTarget?: "codex" | "open-design";
  href?: string;
  label: string;
};

function ActionIcon({ action }: { action: ArtifactAction }) {
  if (action.label.includes("Markdown")) return <FileText className="h-4 w-4" />;
  if (action.label.includes("PDF")) return <Download className="h-4 w-4" />;
  if (action.label.includes("HTML")) return <FileCode2 className="h-4 w-4" />;
  if (action.label.includes("Artifact")) return <FileCode2 className="h-4 w-4" />;
  if (action.label.includes("JSON")) return <FileCode2 className="h-4 w-4" />;
  if (action.label.includes("PPTX")) return <Presentation className="h-4 w-4" />;
  if (action.label.includes("Codex")) return <Send className="h-4 w-4" />;
  return <Share2 className="h-4 w-4" />;
}

function ArtifactView({
  activeTab,
  activeViewport,
  isPrototypeExporting,
  isEditing,
  onEditPrototypePrompt,
  onExportPrototypeHtml,
  onRequestGenerate,
  productPack,
  onChange,
}: {
  activeTab: (typeof studioTabs)[number];
  activeViewport?: string;
  isPrototypeExporting?: boolean;
  isEditing?: boolean;
  onEditPrototypePrompt?: () => void;
  onExportPrototypeHtml?: () => void;
  onRequestGenerate?: () => void;
  productPack?: ProductPack;
  onChange?: (pack: ProductPack) => void;
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
          isEditing={isEditing}
          onEditPrompt={onEditPrototypePrompt}
          onExportHtml={onExportPrototypeHtml}
          onRegenerate={onRequestGenerate}
          productPack={productPack}
          onChange={onChange}
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

function getExportActionLabel(format: ExportFormat, artifactId?: string) {
  if (artifactId === "prototype" && format === "json") return "导出 Live Artifact";

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
      label: getExportActionLabel(format, artifactId),
    })) ?? [
      {
        artifactId,
        format: "markdown" as const,
        label: "导出 Markdown",
      },
    ];
  const openAction: ArtifactAction =
    tab === "原型"
      ? { handoffTarget: "open-design", label: "导出 OpenDesign 包" }
      : { handoffTarget: "codex", label: "导出 Codex 交接包" };

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

type StudioFileKind = "deck" | "html" | "json" | "markdown";

type StudioFile = {
  artifactId: string;
  description: string;
  editable: boolean;
  id: string;
  kind: StudioFileKind;
  name: string;
  section: "Artifacts" | "Prototype" | "Research" | "Workspace";
  tab: (typeof studioTabs)[number];
  updatedAt: string;
};

const fileIdByTab: Record<(typeof studioTabs)[number], string> = {
  PRD: "artifacts/PRD.md",
  原型: "prototype/index.html",
  调研: "research/market.md",
  竞品: "research/competitors.md",
  画像: "research/personas.md",
  路线图: "planning/roadmap.pptx",
  总结: "README.md",
};

function getFileIdForArtifact(artifact?: string) {
  return fileIdByTab[getTabFromArtifactParam(artifact)];
}

function getStudioFiles(pack: ProductPack): StudioFile[] {
  return [
    {
      artifactId: "product-pack",
      description: pack.project.oneLiner,
      editable: true,
      id: "README.md",
      kind: "markdown",
      name: "README.md",
      section: "Workspace",
      tab: "总结",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "prd",
      description: pack.prd.objective,
      editable: true,
      id: "artifacts/PRD.md",
      kind: "markdown",
      name: "PRD.md",
      section: "Artifacts",
      tab: "PRD",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "prototype",
      description: pack.prototype.userFlow,
      editable: true,
      id: "prototype/index.html",
      kind: "html",
      name: "index.html",
      section: "Prototype",
      tab: "原型",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "prototype",
      description: "Prototype data, screen goals, PRD links, and OpenDesign prompt.",
      editable: true,
      id: "prototype/data.json",
      kind: "json",
      name: "data.json",
      section: "Prototype",
      tab: "原型",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "research",
      description: pack.research.marketOpportunity[0]?.detail ?? "Market opportunity notes.",
      editable: true,
      id: "research/market.md",
      kind: "markdown",
      name: "market.md",
      section: "Research",
      tab: "调研",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "competitors",
      description: "Competitor matrix and opportunity gaps.",
      editable: true,
      id: "research/competitors.md",
      kind: "markdown",
      name: "competitors.md",
      section: "Research",
      tab: "竞品",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "personas",
      description: "Primary personas, goals, and pains.",
      editable: true,
      id: "research/personas.md",
      kind: "markdown",
      name: "personas.md",
      section: "Research",
      tab: "画像",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "roadmap",
      description: "MVP, next, and later delivery plan.",
      editable: true,
      id: "planning/roadmap.pptx",
      kind: "deck",
      name: "roadmap.pptx",
      section: "Artifacts",
      tab: "路线图",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "executive-summary",
      description: pack.summary.headline,
      editable: true,
      id: "planning/executive-summary.md",
      kind: "markdown",
      name: "executive-summary.md",
      section: "Artifacts",
      tab: "总结",
      updatedAt: pack.generatedAt,
    },
  ];
}

function formatFileTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "just now";

  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fileKindLabel(kind: StudioFileKind) {
  const labels: Record<StudioFileKind, string> = {
    deck: "Deck",
    html: "HTML",
    json: "JSON",
    markdown: "Markdown",
  };

  return labels[kind];
}

function StudioFileIcon({ file }: { file: StudioFile }) {
  if (file.kind === "html") return <FileCode2 className="h-4 w-4" />;
  if (file.kind === "json") return <FileJson className="h-4 w-4" />;
  if (file.kind === "deck") return <Presentation className="h-4 w-4" />;

  return <FileText className="h-4 w-4" />;
}

function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function renderStudioFileSource(file: StudioFile, pack: ProductPack) {
  if (file.id === "prototype/data.json") {
    return JSON.stringify(
      {
        project: pack.project,
        prototype: pack.prototype,
      },
      null,
      2,
    );
  }

  if (file.tab === "PRD") {
    return [
      `# ${pack.project.title} PRD`,
      "",
      `Objective: ${pack.prd.objective}`,
      "",
      "## Core Features",
      markdownList(pack.prd.coreFeatures),
      "",
      "## MVP Scope",
      markdownList(pack.prd.mvpScope),
      "",
      "## Success Metrics",
      markdownList(pack.prd.successMetrics),
    ].join("\n");
  }

  if (file.tab === "原型") {
    return [
      "<!-- PM Studio prototype source -->",
      `<!-- Live artifact: ${pack.prototype.liveArtifact.id} -->`,
      "",
      pack.prototype.openDesignPrompt,
    ].join("\n");
  }

  if (file.tab === "调研") {
    return [
      `# ${pack.project.title} Market Research`,
      "",
      ...pack.research.marketOpportunity.flatMap((item) => [
        `## ${item.label}: ${item.value}`,
        item.detail,
        "",
      ]),
      "## Insights",
      markdownList(pack.research.insights),
    ].join("\n");
  }

  if (file.tab === "竞品") {
    return [
      `# ${pack.project.title} Competitors`,
      "",
      "| Competitor | Positioning | Strength | Weakness | Opportunity |",
      "| --- | --- | --- | --- | --- |",
      ...pack.competitors.map(
        (item) =>
          `| ${item.competitor} | ${item.positioning} | ${item.strength} | ${item.weakness} | ${item.opportunity} |`,
      ),
    ].join("\n");
  }

  if (file.tab === "画像") {
    return pack.personas
      .map((persona) =>
        [
          `# ${persona.name}`,
          "",
          `Role: ${persona.role}`,
          `Goal: ${persona.goal}`,
          `Pain: ${persona.pain}`,
        ].join("\n"),
      )
      .join("\n\n");
  }

  if (file.tab === "路线图") {
    return pack.roadmap
      .map((column) => [`# ${column.horizon}`, "", markdownList(column.items)].join("\n"))
      .join("\n\n");
  }

  return [
    `# ${pack.project.title}`,
    "",
    pack.summary.headline,
    "",
    "## Positioning",
    pack.project.positioning,
    "",
    "## Value Proposition",
    pack.project.valueProposition,
    "",
    "## Next Actions",
    markdownList(pack.summary.nextActions),
  ].join("\n");
}

function getRunModeLabel(mode?: AgentRunMode) {
  const labels: Record<AgentRunMode, string> = {
    "api-fallback-dry-run": "API dry-run",
    "claude-cli": "Claude CLI",
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

function downloadBrowserFile({
  body,
  filename,
  type,
}: {
  body: BlobPart;
  filename: string;
  type: string;
}) {
  const blob = new Blob([body], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function buildCodexHandoffMarkdown(
  pack: ProductPack,
  activeTab: (typeof studioTabs)[number],
) {
  return [
    `# ${pack.project.title} Codex Handoff`,
    "",
    "## Goal",
    "",
    "Continue this PM Studio product pack without changing the provider-neutral artifact contract.",
    "",
    "## Source Idea",
    "",
    pack.sourceIdea,
    "",
    "## Product Context",
    "",
    `- One-liner: ${pack.project.oneLiner}`,
    `- Positioning: ${pack.project.positioning}`,
    `- Value proposition: ${pack.project.valueProposition}`,
    "",
    "## Active Artifact",
    "",
    `- Tab: ${activeTab}`,
    `- Artifact id: ${artifactIndexIdByTab[activeTab]}`,
    "",
    "## PRD Objective",
    "",
    pack.prd.objective,
    "",
    "## Prototype Prompt",
    "",
    pack.prototype.openDesignPrompt,
    "",
    "## Next Actions",
    "",
    ...pack.summary.nextActions.map((item) => `- ${item}`),
    "",
    "## Product Pack JSON",
    "",
    "```json",
    JSON.stringify(pack, null, 2),
    "```",
  ].join("\n");
}

function buildOpenDesignHandoffJson(pack: ProductPack) {
  return JSON.stringify(
    {
      schemaVersion: "pmstudio-opendesign-handoff.v1",
      source: {
        product: "PM Studio",
        productPackId: pack.id,
        generatedAt: pack.generatedAt,
      },
      intent:
        "Use OpenDesign-style Studio Shell, Artifact Canvas, and iframe preview patterns to continue this prototype artifact.",
      liveArtifact: pack.prototype.liveArtifact,
      prompt: pack.prototype.openDesignPrompt,
      product: pack.project,
      prd: {
        objective: pack.prd.objective,
        coreFeatures: pack.prd.coreFeatures,
        mvpScope: pack.prd.mvpScope,
        successMetrics: pack.prd.successMetrics,
      },
      prototype: {
        userFlow: pack.prototype.userFlow,
        screens: pack.prototype.screens,
        prdLinks: pack.prototype.prdLinks,
      },
      exportHint:
        "Call /api/export with artifact=prototype&format=json to download artifact.json, data.json, and index.html bodies.",
    },
    null,
    2,
  );
}

function StudioFileTree({
  activeFileId,
  files,
  openFileIds,
  onOpenFile,
}: {
  activeFileId: string;
  files: StudioFile[];
  openFileIds: string[];
  onOpenFile: (fileId: string) => void;
}) {
  const sections: StudioFile["section"][] = ["Workspace", "Artifacts", "Prototype", "Research"];

  return (
    <div className="hidden h-full min-h-0 flex-col bg-white/74 lg:flex">
      <div className="border-b border-black/10 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
          <Folder className="h-4 w-4 text-[#12a7ff]" />
          Design files
        </div>
        <p className="mt-1 text-xs leading-5 text-neutral-500">
          打开文件后在右侧 inspector 修改内容，保持 Product Pack 和导出同步。
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {sections.map((section) => {
          const sectionFiles = files.filter((file) => file.section === section);

          if (!sectionFiles.length) return null;

          return (
            <section className="mb-5" key={section}>
              <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-semibold uppercase text-neutral-400">
                <span>{section}</span>
                <span>{sectionFiles.length}</span>
              </div>
              <div className="space-y-1">
                {sectionFiles.map((file) => {
                  const active = file.id === activeFileId;
                  const open = openFileIds.includes(file.id);

                  return (
                    <button
                      className={cn(
                        "group grid w-full grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2 py-2 text-left transition",
                        active
                          ? "bg-neutral-950 text-white shadow-sm"
                          : "text-neutral-700 hover:bg-neutral-100",
                      )}
                      key={file.id}
                      onClick={() => onOpenFile(file.id)}
                      type="button"
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-md",
                          active ? "bg-white/12 text-white" : "bg-neutral-100 text-neutral-500",
                        )}
                      >
                        <StudioFileIcon file={file} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{file.name}</span>
                        <span
                          className={cn(
                            "mt-0.5 block truncate text-[11px]",
                            active ? "text-white/58" : "text-neutral-400",
                          )}
                        >
                          {fileKindLabel(file.kind)} · {formatFileTime(file.updatedAt)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          open ? "bg-emerald-400" : "bg-transparent group-hover:bg-neutral-300",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function OpenFileTabs({
  activeFileId,
  files,
  onCloseFile,
  onOpenFile,
}: {
  activeFileId: string;
  files: StudioFile[];
  onCloseFile: (fileId: string) => void;
  onOpenFile: (fileId: string) => void;
}) {
  return (
    <div className="flex min-w-0 items-end gap-1 overflow-x-auto border-b border-black/10 bg-[#f5f5f1]/78 px-2 pt-2">
      {files.map((file) => {
        const active = file.id === activeFileId;

        return (
          <div
            className={cn(
              "group flex h-9 min-w-[148px] max-w-[230px] items-center gap-2 rounded-t-lg border border-b-0 px-3 text-sm transition",
              active
                ? "border-black/10 bg-white text-neutral-950 shadow-sm"
                : "border-transparent bg-transparent text-neutral-500 hover:bg-white/70 hover:text-neutral-950",
            )}
            key={file.id}
          >
            <button
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              onClick={() => onOpenFile(file.id)}
              type="button"
            >
              <StudioFileIcon file={file} />
              <span className="truncate">{file.name}</span>
            </button>
            {files.length > 1 ? (
              <button
                aria-label={`Close ${file.name}`}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-neutral-400 opacity-0 transition hover:bg-neutral-100 hover:text-neutral-950 group-hover:opacity-100"
                onClick={() => onCloseFile(file.id)}
                type="button"
              >
                ×
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function SourceViewer({ file, productPack }: { file: StudioFile; productPack: ProductPack }) {
  return (
    <pre className="min-h-[560px] overflow-auto rounded-xl border border-black/10 bg-[#111111] p-4 text-xs leading-5 text-white/82">
      <code>{renderStudioFileSource(file, productPack)}</code>
    </pre>
  );
}

function FilePreviewSurface({
  activeMode,
  activeViewport,
  file,
  isPrototypeExporting,
  onChange,
  onExportAction,
  onSwitchMode,
  productPack,
}: {
  activeMode: "生成" | "修改" | "源码" | "预览";
  activeViewport?: string;
  file: StudioFile;
  isPrototypeExporting?: boolean;
  onChange: (productPack: ProductPack) => void;
  onExportAction: (action: ArtifactAction) => void;
  onSwitchMode: (mode: "生成" | "修改" | "源码" | "预览") => void;
  productPack: ProductPack;
}) {
  if (activeMode === "源码" || file.id === "prototype/data.json") {
    return <SourceViewer file={file} productPack={productPack} />;
  }

  return (
    <ArtifactView
      activeTab={file.tab}
      activeViewport={activeViewport}
      isPrototypeExporting={isPrototypeExporting}
      isEditing={activeMode === "修改"}
      onEditPrototypePrompt={() => onSwitchMode("修改")}
      onExportPrototypeHtml={() =>
        onExportAction({
          artifactId: "prototype",
          format: "html",
          label: "导出 HTML",
        })
      }
      onRequestGenerate={() => onSwitchMode("生成")}
      productPack={productPack}
      onChange={onChange}
    />
  );
}

function FileInspector({
  activeMode,
  agentEvents,
  file,
  onChange,
  onReset,
  productPack,
  runHistory,
}: {
  activeMode: "生成" | "修改" | "源码" | "预览";
  agentEvents?: HarnessEvent[];
  file: StudioFile;
  onChange: (productPack: ProductPack) => void;
  onReset: () => void;
  productPack: ProductPack;
  runHistory: AgentRunHistoryItem[];
}) {
  function update(updater: (productPack: ProductPack) => ProductPack) {
    onChange(updater(productPack));
  }

  return (
    <aside className="hidden h-full min-h-0 flex-col border-l border-black/10 bg-white/76 lg:flex">
      <div className="border-b border-black/10 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-950">{file.name}</p>
            <p className="mt-1 truncate text-xs text-neutral-500">{file.id}</p>
          </div>
          <span className="rounded-md border border-black/10 bg-neutral-50 px-2 py-1 text-[11px] font-medium text-neutral-500">
            {activeMode}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <section className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <Save className="h-3.5 w-3.5" />
            自动保存
          </div>
          修改会立即写回当前 Product Pack，并影响预览、handoff 和导出文件。
        </section>

        {file.tab === "PRD" ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-neutral-500">PRD 目标</span>
              <textarea
                className="mt-2 min-h-24 w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30"
                onChange={(event) =>
                  update((pack) => ({
                    ...pack,
                    prd: { ...pack.prd, objective: event.target.value },
                  }))
                }
                value={productPack.prd.objective}
              />
            </label>
            <EditableListField
              label="核心功能"
              onChange={(coreFeatures) =>
                update((pack) => ({
                  ...pack,
                  prd: { ...pack.prd, coreFeatures },
                }))
              }
              value={productPack.prd.coreFeatures}
            />
            <EditableListField
              label="成功指标"
              onChange={(successMetrics) =>
                update((pack) => ({
                  ...pack,
                  prd: { ...pack.prd, successMetrics },
                }))
              }
              value={productPack.prd.successMetrics}
            />
          </div>
        ) : null}

        {file.tab === "原型" ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-neutral-500">用户流程</span>
              <textarea
                className="mt-2 min-h-20 w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30"
                onChange={(event) =>
                  update((pack) => ({
                    ...pack,
                    prototype: { ...pack.prototype, userFlow: event.target.value },
                  }))
                }
                value={productPack.prototype.userFlow}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-neutral-500">OpenDesign prompt</span>
              <textarea
                className="mt-2 min-h-28 w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30"
                onChange={(event) =>
                  update((pack) => ({
                    ...pack,
                    prototype: { ...pack.prototype, openDesignPrompt: event.target.value },
                  }))
                }
                value={productPack.prototype.openDesignPrompt}
              />
            </label>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-neutral-500">Screens</p>
              {productPack.prototype.screens.map((screen, index) => (
                <label className="block rounded-lg border border-black/10 bg-neutral-50 p-3" key={screen.name}>
                  <span className="text-xs font-semibold text-neutral-800">{screen.name}</span>
                  <textarea
                    className="mt-2 min-h-16 w-full resize-y rounded-md border border-black/10 bg-white px-2 py-2 text-xs leading-5 outline-none focus:border-[#12a7ff]"
                    onChange={(event) =>
                      update((pack) => ({
                        ...pack,
                        prototype: {
                          ...pack.prototype,
                          screens: pack.prototype.screens.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, goal: event.target.value } : item,
                          ),
                        },
                      }))
                    }
                    value={screen.goal}
                  />
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {file.tab !== "PRD" && file.tab !== "原型" ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-neutral-500">产品定位</span>
              <textarea
                className="mt-2 min-h-24 w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30"
                onChange={(event) =>
                  update((pack) => ({
                    ...pack,
                    project: { ...pack.project, positioning: event.target.value },
                  }))
                }
                value={productPack.project.positioning}
              />
            </label>
            <EditableListField
              label="摘要要点"
              onChange={(bullets) =>
                update((pack) => ({
                  ...pack,
                  summary: { ...pack.summary, bullets },
                }))
              }
              value={productPack.summary.bullets}
            />
            <EditableListField
              label="下一步"
              onChange={(nextActions) =>
                update((pack) => ({
                  ...pack,
                  summary: { ...pack.summary, nextActions },
                }))
              }
              value={productPack.summary.nextActions}
            />
          </div>
        ) : null}

        <div className="mt-5">
          <button
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100"
            onClick={onReset}
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            恢复默认
          </button>
        </div>

        <div className="mt-5 border-t border-black/10 pt-4">
          <AgentPanel
            events={agentEvents}
            productPack={productPack}
            runHistory={runHistory}
            variant="floating"
          />
        </div>
      </div>
    </aside>
  );
}

export function ArtifactCanvas({
  activeArtifact,
  activeViewport,
  agentEvents,
  onAgentEventsChange,
  onProductPackChange,
  productPack,
  providerId = "mock",
}: {
  activeArtifact?: string;
  activeViewport?: string;
  agentEvents?: HarnessEvent[];
  onAgentEventsChange?: (events: HarnessEvent[]) => void;
  onProductPackChange?: (productPack: ProductPack) => void;
  productPack?: ProductPack;
  providerId?: AgentProviderId;
}) {
  const requestedFileId = getFileIdForArtifact(activeArtifact);
  const [activeMode, setActiveMode] = useState<"生成" | "修改" | "源码" | "预览">("预览");
  const [currentEvents, setCurrentEvents] = useState(agentEvents);
  const [currentPack, setCurrentPack] = useState(
    productPack ?? buildFinSightProductPack(defaultFinSightIdea),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportingAction, setExportingAction] = useState<string | null>(null);
  const [lastRunMode, setLastRunMode] = useState<AgentRunMode>("mock");
  const [runHistory, setRunHistory] = useState<AgentRunHistoryItem[]>([]);
  const [prompt, setPrompt] = useState(currentPack.sourceIdea);
  const [intakeAudience, setIntakeAudience] = useState("");
  const [intakeOutcome, setIntakeOutcome] = useState("");
  const [intakeConstraints, setIntakeConstraints] = useState("");
  const [runError, setRunError] = useState<string | null>(null);
  const [activeFileId, setActiveFileId] = useState(requestedFileId);
  const [openFileIds, setOpenFileIds] = useState<string[]>([requestedFileId]);
  const runInputRef = useRef<HTMLInputElement>(null);
  const activeTabRef = useRef(getTabFromArtifactParam(activeArtifact));
  const currentPackRef = useRef(currentPack);
  const studioFiles = getStudioFiles(currentPack);
  const activeFile = studioFiles.find((file) => file.id === activeFileId) ?? studioFiles[0]!;
  const openFiles = openFileIds
    .map((fileId) => studioFiles.find((file) => file.id === fileId))
    .filter((file): file is StudioFile => Boolean(file));
  const activeTab = activeFile.tab;
  const projectTitle = currentPack.project.title;
  const artifactActions = getArtifactActions(activeTab, currentPack);

  const openStudioFile = useCallback((fileId: string) => {
    setOpenFileIds((currentFileIds) =>
      currentFileIds.includes(fileId) ? currentFileIds : [...currentFileIds, fileId],
    );
    setActiveFileId(fileId);
  }, []);

  function closeStudioFile(fileId: string) {
    setOpenFileIds((currentFileIds) => {
      if (currentFileIds.length <= 1) return currentFileIds;

      const nextFileIds = currentFileIds.filter((item) => item !== fileId);

      if (fileId === activeFileId) {
        setActiveFileId(nextFileIds[Math.max(0, currentFileIds.indexOf(fileId) - 1)] ?? nextFileIds[0]!);
      }

      return nextFileIds;
    });
  }

  useEffect(() => {
    activeTabRef.current = activeTab;
    currentPackRef.current = currentPack;
  }, [activeTab, currentPack]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => openStudioFile(requestedFileId), 0);

    return () => window.clearTimeout(timeoutId);
  }, [openStudioFile, requestedFileId]);

  useEffect(() => {
    if (productPack) return;

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
  }, [productPack]);

  useEffect(() => {
    if (!productPack) return;

    const timeoutId = window.setTimeout(() => {
      setCurrentPack(productPack);
      setPrompt(productPack.sourceIdea);
      setCurrentEvents(agentEvents);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [agentEvents, productPack]);

  useEffect(() => {
    window.localStorage.setItem(localProductPackStorageKey, JSON.stringify(currentPack));
    onProductPackChange?.(currentPack);
  }, [currentPack, onProductPackChange]);

  useEffect(() => {
    if (currentEvents?.length) {
      window.localStorage.setItem(localEventsStorageKey, JSON.stringify(currentEvents));
      onAgentEventsChange?.(currentEvents);
    }
  }, [currentEvents, onAgentEventsChange]);

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
    setIntakeAudience("");
    setIntakeOutcome("");
    setIntakeConstraints("");
    setActiveMode("预览");
  }

  const handleHandoffAction = useCallback((action: ArtifactAction) => {
    const pack = currentPackRef.current;
    const tab = activeTabRef.current;

    if (action.handoffTarget === "open-design") {
      downloadBrowserFile({
        body: buildOpenDesignHandoffJson(pack),
        filename: `${pack.id}-opendesign-handoff.json`,
        type: "application/json;charset=utf-8",
      });
      return;
    }

    if (action.handoffTarget === "codex") {
      downloadBrowserFile({
        body: buildCodexHandoffMarkdown(pack, tab),
        filename: `${pack.id}-codex-handoff.md`,
        type: "text/markdown;charset=utf-8",
      });
    }
  }, []);

  const handleExportAction = useCallback(async (action: ArtifactAction) => {
    if (action.handoffTarget) {
      handleHandoffAction(action);
      return;
    }

    if (!action.artifactId || !action.format) return;

    const pack = currentPackRef.current;
    const actionKey = `${action.artifactId}:${action.format}`;
    setExportingAction(actionKey);
    setRunError(null);

    try {
      const response = await fetch("/api/export", {
        body: JSON.stringify({
          artifact: action.artifactId,
          format: action.format,
          productPack: pack,
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
        `${pack.id}-${action.artifactId}.${action.format === "markdown" ? "md" : action.format}`;
      downloadBrowserFile({
        body: blob,
        filename,
        type: response.headers.get("Content-Type") ?? "application/octet-stream",
      });
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "导出失败");
    } finally {
      setExportingAction(null);
    }
  }, [handleHandoffAction]);

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

  function buildIntakeInput(baseInput: string) {
    const context = [
      intakeAudience.trim() ? `面向${intakeAudience.trim()}。` : "",
      intakeOutcome.trim() ? `帮助${intakeOutcome.trim()}。` : "",
      intakeConstraints.trim() ? `约束条件：${intakeConstraints.trim()}` : "",
    ].filter(Boolean);

    return [baseInput, ...context].join("\n");
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const baseInput = prompt.trim() || currentPack.sourceIdea || defaultFinSightIdea;
    const input = buildIntakeInput(baseInput);
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
      setPrompt(baseInput);
      setActiveMode("预览");
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="flex min-h-screen flex-col bg-[#f5f5f1] text-[#111111] lg:h-[calc(100vh-56px)] lg:min-h-[780px]">
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        <StudioFileTree
          activeFileId={activeFile.id}
          files={studioFiles}
          openFileIds={openFileIds}
          onOpenFile={openStudioFile}
        />

        <main className="flex min-h-0 min-w-0 flex-col border-x border-black/10 bg-[#fbfaf7]">
          <OpenFileTabs
            activeFileId={activeFile.id}
            files={openFiles.length ? openFiles : [activeFile]}
            onCloseFile={closeStudioFile}
            onOpenFile={openStudioFile}
          />

          <div className="flex min-h-0 flex-1 flex-col">
            <header className="flex flex-col gap-3 border-b border-black/10 bg-white px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                    <StudioFileIcon file={activeFile} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-950">{activeFile.id}</p>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">{activeFile.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg border border-black/10 bg-neutral-50 p-1">
                  {(["预览", "修改", "源码", "生成"] as const).map((mode) => (
                    <button
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition",
                        activeMode === mode
                          ? "bg-white text-neutral-950 shadow-sm"
                          : "text-neutral-500 hover:text-neutral-950",
                      )}
                      key={mode}
                      onClick={() => setActiveMode(mode)}
                      type="button"
                    >
                      {mode === "预览" ? <Eye className="h-3.5 w-3.5" /> : null}
                      {mode === "修改" ? <Pencil className="h-3.5 w-3.5" /> : null}
                      {mode === "源码" ? <Braces className="h-3.5 w-3.5" /> : null}
                      {mode === "生成" ? <Sparkles className="h-3.5 w-3.5" /> : null}
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1 overflow-x-auto">
                  {artifactActions.map((action, index) => (
                    <button
                      className={cn(
                        "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-medium shadow-sm transition",
                        index === artifactActions.length - 1
                          ? "border-neutral-950 bg-neutral-950 text-white hover:bg-black"
                          : "border-black/10 bg-white text-neutral-700 hover:bg-neutral-50",
                      )}
                      disabled={exportingAction === [action.artifactId, action.format].join(":")}
                      key={action.label}
                      onClick={() => handleExportAction(action)}
                      type="button"
                    >
                      <ActionIcon action={action} />
                      {exportingAction === [action.artifactId, action.format].join(":") ? "导出中" : action.label}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-auto p-4 lg:p-5">
              <FilePreviewSurface
                activeMode={activeMode}
                activeViewport={activeViewport}
                file={activeFile}
                isPrototypeExporting={exportingAction === "prototype:html"}
                onChange={setCurrentPack}
                onExportAction={handleExportAction}
                onSwitchMode={setActiveMode}
                productPack={currentPack}
              />
            </div>
          </div>
        </main>

        <FileInspector
          activeMode={activeMode}
          agentEvents={currentEvents}
          file={activeFile}
          onChange={setCurrentPack}
          onReset={handleResetToDefault}
          productPack={currentPack}
          runHistory={runHistory}
        />
      </div>

      <form
        className="border-t border-black/10 bg-white/86 px-3 py-3 backdrop-blur-xl"
        onSubmit={handleGenerate}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="truncate text-xs font-medium text-neutral-500">
                智能体：{getProviderLabel(providerId)} · {getRunModeLabel(lastRunMode)}
              </span>
              <span className="hidden text-xs text-neutral-400 sm:inline">
                当前工作流：{getWorkflowIdForTab(activeTab)}
              </span>
            </div>
            {activeMode === "生成" ? (
              <div className="mb-2 grid gap-2 sm:grid-cols-3">
                <label className="block">
                  <span className="px-1 text-[11px] font-semibold text-neutral-500">目标用户</span>
                  <input
                    className="mt-1 h-9 w-full rounded-lg border border-black/10 bg-white px-3 text-xs text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30"
                    disabled={isGenerating}
                    onChange={(event) => setIntakeAudience(event.target.value)}
                    placeholder="财富顾问 / 店长 / HR"
                    type="text"
                    value={intakeAudience}
                  />
                </label>
                <label className="block">
                  <span className="px-1 text-[11px] font-semibold text-neutral-500">成功结果</span>
                  <input
                    className="mt-1 h-9 w-full rounded-lg border border-black/10 bg-white px-3 text-xs text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30"
                    disabled={isGenerating}
                    onChange={(event) => setIntakeOutcome(event.target.value)}
                    placeholder="缩短准备时间 / 提高转化"
                    type="text"
                    value={intakeOutcome}
                  />
                </label>
                <label className="block">
                  <span className="px-1 text-[11px] font-semibold text-neutral-500">约束条件</span>
                  <input
                    className="mt-1 h-9 w-full rounded-lg border border-black/10 bg-white px-3 text-xs text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30"
                    disabled={isGenerating}
                    onChange={(event) => setIntakeConstraints(event.target.value)}
                    placeholder="MVP / 合规 / 2 周内"
                    type="text"
                    value={intakeConstraints}
                  />
                </label>
              </div>
            ) : null}
            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-black/10 bg-[#fbfaf7] p-2">
              <input
                className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-neutral-400"
                disabled={isGenerating}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="输入产品想法，或选择一个 demo prompt 重新生成当前文件工作区..."
                ref={runInputRef}
                type="text"
                value={prompt}
              />
              <button
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-400"
                disabled={isGenerating}
                type="submit"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                {isGenerating ? "生成中" : "运行"}
              </button>
            </div>
            {runError ? <p className="mt-2 text-xs font-medium text-red-600">{runError}</p> : null}
          </div>

          <div className="flex shrink-0 gap-1 overflow-x-auto pb-1 lg:w-[280px]">
            {demoPromptPresets.map((preset) => (
              <button
                className="h-8 shrink-0 rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isGenerating}
                key={preset.label}
                onClick={() => {
                  setPrompt(preset.prompt);
                  setIntakeAudience("");
                  setIntakeOutcome("");
                  setIntakeConstraints("");
                  setActiveMode("生成");
                }}
                type="button"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </section>
  );
}
