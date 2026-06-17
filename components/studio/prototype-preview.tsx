"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Code2,
  Monitor,
  PanelTop,
  RefreshCw,
  Smartphone,
  Tablet,
} from "lucide-react";

import { prototypeHighlights } from "@/lib/mock-data";
import type { ProductPack } from "@/lib/product-pack";
import { cn } from "@/lib/utils";

const viewports = [
  { label: "桌面", param: "desktop", icon: Monitor, width: "w-full max-w-5xl", size: "1200px" },
  { label: "平板", param: "tablet", icon: Tablet, width: "w-[680px] max-w-full", size: "768px" },
  { label: "手机", param: "mobile", icon: Smartphone, width: "w-[360px] max-w-full", size: "390px" },
];

function getViewportFromParam(viewport?: string) {
  return viewports.find((item) => item.param === viewport) ?? viewports[0];
}

function getPreviewDomain(productPack?: ProductPack) {
  return `${productPack?.id.replace(/-product-pack$/, "") ?? "finsight"}.pm`;
}

export function StudioPrototypePreview({
  activeViewport,
  exportHref,
  isExporting,
  onEditPrompt,
  onExportHtml,
  onRegenerate,
  productPack,
}: {
  activeViewport?: string;
  exportHref?: string;
  isExporting?: boolean;
  onEditPrompt?: () => void;
  onExportHtml?: () => void;
  onRegenerate?: () => void;
  productPack?: ProductPack;
}) {
  const [briefGenerated, setBriefGenerated] = useState(false);
  const selectedViewport = getViewportFromParam(activeViewport);
  const isMobile = selectedViewport.param === "mobile";
  const isTablet = selectedViewport.param === "tablet";
  const projectTitle = productPack?.project.title ?? "FinSight";
  const prototypeTitle = productPack?.prototype.liveArtifact.title ?? "金融投研工作台变体 A";
  const deliveryFiles = productPack?.prototype.liveArtifact.files.map((file) => file.path) ?? [
    "市场简报.pdf",
    "配置建议.md",
    "风险提示.txt",
    "跟进任务.csv",
  ];
  const highlights =
    productPack?.prototype.screens.slice(0, 4).map((screen) => screen.name) ?? prototypeHighlights;
  const navItems =
    productPack?.prototype.screens.slice(1, 5).map((screen) => screen.name) ?? [
      "市场雷达",
      "配置建议",
      "产品池",
      "合规审阅",
    ];
  const generatedLabel = productPack ? "已生成方案" : "已生成客户简报";
  const primaryAction = productPack?.prototype.screens[0]?.primaryAction ?? "生成简报";
  const promptPlaceholder = productPack
    ? `为 ${projectTitle} 生成核心用户路径...`
    : "为稳健型客户生成本周配置复盘...";
  const heroTitle =
    productPack?.project.valueProposition ?? "把市场信号，变成客户可理解的配置建议。";
  const heroDescription =
    productPack?.prototype.userFlow ??
    "在一个工作区内生成市场简报、客户画像、资产配置草案、风险提示和跟进任务。";

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-500">原型交付物</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-neutral-950">{prototypeTitle}</h2>
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-500">
              {selectedViewport.label} · {selectedViewport.size}
            </span>
          </div>
        </div>
        <div className="flex w-full overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-100 p-1 md:w-auto">
          {viewports.map((item) => {
            const Icon = item.icon;
            const active = item.param === selectedViewport.param;

            return (
              <Link
                className={cn(
                  "flex h-8 flex-1 items-center justify-center gap-2 rounded-md px-3 text-xs font-medium text-neutral-500 transition hover:bg-white/70 hover:text-neutral-950 active:scale-[0.98] md:flex-none",
                  active && "bg-white text-neutral-950 shadow-sm ring-1 ring-black/5",
                )}
                key={item.label}
                href={`/app?artifact=prototype&viewport=${item.param}`}
                role="tab"
                aria-selected={active}
                scroll={false}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_32%),linear-gradient(135deg,#f3f4f6,#ffffff)] p-3 sm:p-5">
        <div
          className={cn(
            "mx-auto min-w-0 transition-all duration-500 ease-out",
            selectedViewport.width,
          )}
          key={selectedViewport.param}
        >
          <div className="min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-white text-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex items-center gap-2">
                {briefGenerated ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                    {generatedLabel}
                  </span>
                ) : null}
                <span className="text-xs font-medium text-zinc-500">{getPreviewDomain(productPack)}</span>
              </div>
            </div>

            <div className={cn("min-w-0 p-5", !isMobile && "sm:p-8")}>
              <nav className={cn("flex items-center gap-6", isMobile ? "mb-7" : "mb-8")}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-xs text-white">
                    AI
                  </span>
                  <span className="max-w-[180px] truncate">{projectTitle}</span>
                </div>
                <div
                  className={cn(
                    "hidden items-center gap-5 text-xs font-medium text-zinc-500 md:flex",
                    (isMobile || isTablet) && "md:hidden",
                  )}
                >
                  {navItems.map((item) => (
                    <span className="max-w-[88px] truncate" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <button
                  className={cn(
                    "pointer-events-auto relative z-50 h-9 rounded-md bg-zinc-950 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-black active:scale-[0.98]",
                    briefGenerated && "bg-emerald-600 hover:bg-emerald-700",
                    isMobile ? "hidden" : "hidden sm:block",
                  )}
                  onClick={() => setBriefGenerated(true)}
                  type="button"
                >
                  {briefGenerated ? "已生成" : primaryAction}
                </button>
              </nav>

              <section
                className={cn(
                  "grid gap-8",
                  !isMobile && !isTablet && "2xl:grid-cols-[1fr_0.85fr] 2xl:items-center",
                )}
              >
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <PanelTop className="h-3.5 w-3.5" />
                    AI 产品方案工作台
                    {briefGenerated ? (
                      <span className="rounded-full bg-white px-2 py-0.5 text-emerald-700">
                        {generatedLabel}
                      </span>
                    ) : null}
                  </div>
                  <h3
                    className={cn(
                      "break-words font-semibold tracking-normal text-zinc-950",
                      isMobile ? "text-2xl" : isTablet ? "text-3xl sm:text-4xl" : "text-3xl sm:text-4xl 2xl:text-5xl",
                    )}
                  >
                    {heroTitle}
                  </h3>
                  <p
                    className={cn(
                      "mt-4 max-w-xl text-sm text-zinc-600",
                      isMobile ? "leading-6" : "leading-7",
                    )}
                  >
                    {heroDescription}
                  </p>
                  <div className={cn("mt-5 flex max-w-xl flex-col gap-2", !isMobile && "sm:flex-row")}>
                    <div className="min-h-10 flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500">
                      {promptPlaceholder}
                    </div>
                    <button
                      className={cn(
                        "pointer-events-auto relative z-50 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-black active:scale-[0.98]",
                        briefGenerated && "bg-emerald-600 hover:bg-emerald-700",
                      )}
                      onClick={() => setBriefGenerated(true)}
                      type="button"
                    >
                      {briefGenerated ? generatedLabel : primaryAction}
                      {briefGenerated ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">方案交付物</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      {deliveryFiles.length} 份文件
                    </span>
                  </div>
                  <div className="space-y-2">
                    {deliveryFiles.map((item) => (
                      <div
                        className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 text-sm"
                        key={item}
                      >
                        <span>{item}</span>
                        <Check className="h-4 w-4 text-emerald-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div
                className={cn(
                  "mt-8 grid gap-3",
                  isMobile ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-4",
                )}
              >
                {highlights.map((item) => (
                  <div className="rounded-lg border border-zinc-200 bg-white p-3" key={item}>
                    <Check className="mb-2 h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-medium text-zinc-800">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto border-t border-neutral-200 bg-white p-4 sm:justify-end">
        <button
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          onClick={onRegenerate}
          type="button"
        >
          <RefreshCw className="h-4 w-4" />
          重新生成
        </button>
        <button
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          onClick={onEditPrompt}
          type="button"
        >
          <PanelTop className="h-4 w-4" />
          编辑提示词
        </button>
        {onExportHtml ? (
          <button
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-neutral-950 px-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-400"
            disabled={isExporting}
            onClick={onExportHtml}
            type="button"
          >
            <Code2 className="h-4 w-4" />
            {isExporting ? "导出中" : "导出 HTML"}
          </button>
        ) : exportHref ? (
          <a
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-neutral-950 px-3 text-sm font-medium text-white transition hover:bg-black"
            href={exportHref}
          >
            <Code2 className="h-4 w-4" />
            导出 HTML
          </a>
        ) : (
          <button
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-neutral-950 px-3 text-sm font-medium text-white transition hover:bg-black"
            type="button"
          >
            <Code2 className="h-4 w-4" />
            导出 HTML
          </button>
        )}
      </div>
    </div>
  );
}
