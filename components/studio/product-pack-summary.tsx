"use client";

import {
  CheckCircle2,
  FileText,
  Layers3,
  Route,
  Search,
  Sparkles,
} from "lucide-react";

import type { ProductPack } from "@/lib/product-pack";

function getSurfaceLabel(surface: ProductPack["artifactIndex"][number]["surface"]) {
  const labels: Record<ProductPack["artifactIndex"][number]["surface"], string> = {
    "product-pack": "方案包",
    prd: "PRD",
    prototype: "原型",
    research: "调研",
    competitors: "竞品",
    personas: "画像",
    roadmap: "路线图",
    summary: "摘要",
  };

  return labels[surface];
}

export function ProductPackSummary({ productPack }: { productPack: ProductPack }) {
  const readyArtifacts = productPack.artifactIndex.filter((artifact) => artifact.status === "ready");
  const exportFormats = Array.from(
    new Set(productPack.artifactIndex.flatMap((artifact) => artifact.exportFormats)),
  );

  return (
    <section className="mx-auto max-w-5xl overflow-hidden rounded-[24px] border border-black/10 bg-white/72 shadow-xl shadow-black/5 backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Product Pack Ready
            </span>
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-neutral-500">
              {productPack.schemaVersion}
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-normal text-neutral-950">
            {productPack.project.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-neutral-600">
            {productPack.project.positioning}
          </p>
          <div className="mt-4 rounded-[18px] border border-black/10 bg-white/62 px-4 py-3 text-sm leading-6 text-neutral-600">
            <span className="mr-2 font-medium text-neutral-950">输入想法</span>
            {productPack.sourceIdea}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] border border-black/10 bg-white/70 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                <FileText className="h-4 w-4 text-[#12a7ff]" />
                PRD 目标
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-800">{productPack.prd.objective}</p>
            </div>
            <div className="rounded-[18px] border border-black/10 bg-white/70 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                <Route className="h-4 w-4 text-emerald-600" />
                原型流程
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-800">{productPack.prototype.userFlow}</p>
            </div>
            <div className="rounded-[18px] border border-black/10 bg-white/70 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                <Search className="h-4 w-4 text-amber-600" />
                市场切入
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-800">
                {productPack.research.marketOpportunity[1]?.detail}
              </p>
            </div>
          </div>
        </div>

        <aside className="border-t border-black/10 bg-neutral-950 p-5 text-white lg:border-l lg:border-t-0 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-white/50">生成产物</p>
              <p className="mt-1 text-3xl font-semibold">{readyArtifacts.length}</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <Layers3 className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {readyArtifacts.map((artifact) => (
              <span
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80"
                key={artifact.id}
              >
                {getSurfaceLabel(artifact.surface)}
              </span>
            ))}
          </div>

          <div className="mt-6 rounded-[18px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-white/50">
              <Sparkles className="h-4 w-4" />
              OpenDesign Prompt
            </div>
            <p className="mt-2 text-sm leading-6 text-white/78">{productPack.prototype.openDesignPrompt}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {exportFormats.map((format) => (
              <span
                className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase text-white/55"
                key={format}
              >
                {format}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
