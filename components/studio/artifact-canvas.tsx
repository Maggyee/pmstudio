"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  Download,
  Eye,
  FileCode2,
  FileText,
  Layers3,
  MessageSquareText,
  MoreHorizontal,
  MousePointer2,
  Pencil,
  Presentation,
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
import {
  artifactActions,
  personas,
  studioCompetitors,
  studioRoadmap,
  studioTabs,
} from "@/lib/mock-data";
import type { ProductPack } from "@/lib/product-pack";
import { cn } from "@/lib/utils";

function CompetitorsPreview() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <aside className="bg-neutral-950 p-6 text-white">
          <h2 className="text-xl font-semibold">竞品机会矩阵</h2>
          <p className="mt-3 text-sm leading-7 text-white/65">
            金融数据终端强在数据深度，自动化投顾强在配置体验。FinSight 的机会在顾问工作流和客户解释层。
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
              {studioCompetitors.map((item) => (
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

function PersonasPreview() {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-5">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-950">用户画像与服务路径</h2>
          <p className="mt-1 text-sm text-neutral-500">从会前准备到会后跟进，覆盖财富管理团队的核心协作角色。</p>
        </div>
        <span className="rounded-full border border-black/10 bg-neutral-50 px-3 py-1 text-xs text-neutral-500">
          3 个核心角色
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

function RoadmapPreview() {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-950">产品路线图</h2>
        <p className="mt-2 text-sm text-neutral-500">围绕顾问工作流，从可用的会前准备工具推进到机构级投研协作系统。</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
      {studioRoadmap.map((column) => (
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

function ActionIcon({ action }: { action: string }) {
  if (action.includes("Markdown")) return <FileText className="h-4 w-4" />;
  if (action.includes("PDF")) return <Download className="h-4 w-4" />;
  if (action.includes("HTML")) return <FileCode2 className="h-4 w-4" />;
  if (action.includes("PPTX")) return <Presentation className="h-4 w-4" />;
  if (action.includes("Codex")) return <Send className="h-4 w-4" />;
  return <Share2 className="h-4 w-4" />;
}

function ArtifactView({
  activeTab,
  activeViewport,
  productPack,
}: {
  activeTab: (typeof studioTabs)[number];
  activeViewport?: string;
  productPack?: ProductPack;
}) {
  if (activeTab === "PRD") {
    return <PrdPreview />;
  }

  if (activeTab === "原型") {
    return (
      <div className="space-y-5">
        <StudioPrototypePreview activeViewport={activeViewport} productPack={productPack} />
        <PrdPrototypeMap productPack={productPack} />
      </div>
    );
  }

  if (activeTab === "调研") {
    return <ResearchPreview />;
  }

  if (activeTab === "竞品") {
    return <CompetitorsPreview />;
  }

  if (activeTab === "画像") {
    return <PersonasPreview />;
  }

  return <RoadmapPreview />;
}

const artifactParamByTab: Record<(typeof studioTabs)[number], string> = {
  PRD: "prd",
  原型: "prototype",
  调研: "research",
  竞品: "competitors",
  画像: "personas",
  路线图: "roadmap",
};

const tabByArtifactParam: Record<string, (typeof studioTabs)[number]> = {
  prd: "PRD",
  prototype: "原型",
  research: "调研",
  competitors: "竞品",
  personas: "画像",
  roadmap: "路线图",
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

export function ArtifactCanvas({
  activeArtifact,
  activeViewport,
  productPack,
}: {
  activeArtifact?: string;
  activeViewport?: string;
  productPack?: ProductPack;
}) {
  const activeTab = getTabFromArtifactParam(activeArtifact);
  const [activeMode, setActiveMode] = useState<"生成" | "修改" | "预览">("生成");
  const projectTitle = productPack?.project.title ?? "FinSight 智能投研工作台";

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
            <AgentPanel variant="floating" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="min-w-0 space-y-6">
            {productPack ? <ProductPackSummary productPack={productPack} /> : null}

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
                <ArtifactView
                  activeTab={activeTab}
                  activeViewport={activeViewport}
                  productPack={productPack}
                />
              </div>
            </div>

            <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto pb-2">
              {artifactActions.map((action, index) => (
                <button
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border px-3 text-sm font-medium shadow-sm transition",
                    index === artifactActions.length - 1
                      ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
                      : "border-black/10 bg-white text-neutral-700 hover:bg-neutral-50",
                  )}
                  key={action}
                  type="button"
                >
                  <ActionIcon action={action} />
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="liquid-glass sticky bottom-5 z-30 mx-auto mt-10 max-w-2xl rounded-[22px] p-3">
          <div className="flex items-center gap-3">
            <MessageSquareText className="h-5 w-5 text-neutral-400" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
              placeholder="让 PM Studio 继续细化任意交付物..."
              type="text"
            />
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-950 text-white">
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
