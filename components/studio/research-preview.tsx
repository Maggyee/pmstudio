import { BarChart3, Lightbulb, TrendingUp } from "lucide-react";

import { marketResearch, studioResearchCards, studioResearchInsights } from "@/lib/mock-data";

export function ResearchPreview() {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-black/10 bg-white">
        <div className="grid lg:grid-cols-[300px_1fr]">
          <div className="border-b border-black/10 bg-neutral-950 p-6 text-white lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-cyan-200" />
              市场规模
            </div>
            <p className="mt-4 text-sm leading-7 text-white/65">
              以产品协作、AI 文档和原型工具作为上层市场，优先切入产品经理前期方案准备场景。
            </p>
          </div>
          <div className="space-y-5 p-6">
            {studioResearchCards.map((card, index) => (
              <div className="grid gap-3 sm:grid-cols-[80px_1fr_150px] sm:items-center" key={card.label}>
                <p className="text-sm font-semibold text-neutral-950">{card.label}</p>
                <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#111827,#14b8a6)]"
                    style={{ width: `${92 - index * 24}%` }}
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold text-neutral-950">{card.value}</p>
                  <p className="text-xs text-neutral-500">{card.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[28px] border border-black/10 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            市场机会
          </div>
          <div className="mt-5 space-y-5">
            {marketResearch.map((item, index) => (
              <div className="grid grid-cols-[28px_1fr] gap-3" key={item.label}>
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <div className="border-b border-black/10 pb-5">
                  <p className="text-sm font-semibold text-neutral-950">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-black/10 bg-[#f8fafc] p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            关键洞察
          </div>
          <div className="mt-5 grid gap-3">
            {studioResearchInsights.map((insight, index) => (
              <blockquote className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm" key={insight}>
                <p className="text-xs font-medium text-emerald-700">洞察 {index + 1}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-700">{insight}</p>
              </blockquote>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
