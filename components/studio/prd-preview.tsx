import { CheckCircle2, FileText, Goal, ShieldCheck, Users } from "lucide-react";

import {
  prdSections,
  prdSummary,
  studioCoreFeatures,
  studioSuccessMetrics,
} from "@/lib/mock-data";

export function PrdPreview() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-[#111827] p-6 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-cyan-200 ring-1 ring-white/15">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-white/55">PRD 摘要</p>
              <h2 className="text-2xl font-semibold">{prdSummary.productName}</h2>
            </div>
          </div>
          <p className="mt-6 text-sm leading-7 text-white/72">{prdSummary.oneLiner}</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Goal className="h-4 w-4 text-cyan-200" />
              产品目标
            </div>
            <p className="mt-3 text-sm leading-7 text-white/70">{prdSummary.objective}</p>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">
            <ShieldCheck className="h-4 w-4" />
            合规提示、审阅状态和客户跟进记录进入 MVP 范围
          </div>
        </section>

        <section className="p-6">
          <div className="grid gap-3 md:grid-cols-3">
            {prdSections.map((section) => (
              <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4" key={section.label}>
                <p className="text-xs font-semibold text-neutral-500">{section.label}</p>
                <p className="mt-3 text-sm leading-6 text-neutral-800">{section.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
                <Users className="h-4 w-4 text-blue-600" />
                核心功能路径
              </div>
              <div className="mt-4 space-y-3">
                {studioCoreFeatures.map((feature, index) => (
                  <div className="grid grid-cols-[36px_1fr] items-start gap-3" key={feature}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-xs font-semibold">
                      {index + 1}
                    </span>
                    <div className="border-b border-black/10 pb-3 text-sm leading-6 text-neutral-700">
                      {feature}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-950">成功指标</h3>
              <div className="mt-4 space-y-3">
                {studioSuccessMetrics.map((metric) => (
                  <div className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm" key={metric}>
                    <CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-600" />
                    {metric}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
