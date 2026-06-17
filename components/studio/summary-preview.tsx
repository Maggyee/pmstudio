import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Layers3,
  Presentation,
  Sparkles,
} from "lucide-react";

import {
  buildFinSightProductPack,
  defaultFinSightIdea,
  type ProductPack,
} from "@/lib/product-pack";

function getSurfaceLabel(surface: ProductPack["artifactIndex"][number]["surface"]) {
  const labels: Record<ProductPack["artifactIndex"][number]["surface"], string> = {
    "product-pack": "方案包",
    competitors: "竞品",
    personas: "画像",
    prd: "PRD",
    prototype: "原型",
    research: "调研",
    roadmap: "路线图",
    summary: "摘要",
  };

  return labels[surface];
}

export function SummaryPreview({ productPack }: { productPack?: ProductPack }) {
  const pack = productPack ?? buildFinSightProductPack(defaultFinSightIdea);
  const readyArtifacts = pack.artifactIndex.filter((artifact) => artifact.status === "ready");

  return (
    <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-neutral-950 p-6 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
            <Presentation className="h-3.5 w-3.5" />
            项目汇报摘要
          </div>
          <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-normal">
            {pack.summary.headline}
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            {pack.project.oneLiner}
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-white/50">
              <Sparkles className="h-4 w-4" />
              AI 提效比赛叙事
            </div>
            <p className="mt-2 text-sm leading-6 text-white/78">
              从一句产品想法出发，PM Studio 自动生成可评审、可编辑、可导出的产品方案包，并把 PRD、原型和市场分析放到同一个工作台里。
            </p>
          </div>
        </section>

        <section className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                关键结论
              </div>
              <div className="mt-4 space-y-3">
                {pack.summary.bullets.map((bullet) => (
                  <div className="flex gap-3" key={bullet}>
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <p className="text-sm leading-6 text-neutral-700">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
                <ArrowRight className="h-4 w-4 text-[#12a7ff]" />
                下一步动作
              </div>
              <div className="mt-4 space-y-3">
                {pack.summary.nextActions.map((action, index) => (
                  <div className="grid grid-cols-[28px_1fr] gap-3" key={action}>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-neutral-700">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-black/10 bg-[#fbfaf7] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
                <Layers3 className="h-4 w-4 text-neutral-600" />
                方案包交付物
              </div>
              <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs text-neutral-500">
                {readyArtifacts.length} ready
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {readyArtifacts.map((artifact) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  key={artifact.id}
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="truncate text-neutral-700">{artifact.title}</span>
                  </span>
                  <span className="shrink-0 text-xs text-neutral-400">
                    {getSurfaceLabel(artifact.surface)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
