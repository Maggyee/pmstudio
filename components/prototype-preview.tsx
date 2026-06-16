import { ArrowRight, Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function PrototypePreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className="liquid-card overflow-hidden rounded-[28px]">
      <div className="flex items-center justify-between border-b border-white/55 bg-white/38 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs font-medium text-neutral-500">落地页.tsx</span>
      </div>
      <div className="bg-white/42 p-5 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-950 text-xs text-white">
                LP
              </span>
              FinSight
            </div>
            <div className="hidden gap-4 text-xs font-medium text-neutral-500 sm:flex">
              <span>市场雷达</span>
              <span>配置建议</span>
              <span>合规</span>
            </div>
          </div>
          <section className="rounded-[24px] border border-white/60 bg-[linear-gradient(135deg,rgba(250,250,250,0.9),rgba(255,255,255,0.66)_55%,rgba(236,254,255,0.78))] p-5 shadow-sm backdrop-blur sm:p-7">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              AI 财富投研助手
            </Badge>
            <h3
              className={
                compact
                  ? "mt-4 text-2xl font-semibold tracking-normal text-neutral-950"
                  : "mt-4 text-3xl font-semibold tracking-normal text-neutral-950"
              }
            >
              把分散市场信号，变成客户可理解的配置方案。
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
              在一个工作区内生成市场简报、客户画像、配置建议、风险提示和跟进任务。
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <div className="min-h-10 flex-1 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-neutral-500">
                为稳健型客户生成本周配置复盘...
              </div>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 text-sm font-medium text-white shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-black"
                type="button"
              >
                生成简报
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {["投研简报", "配置草案", "合规提示"].map((item) => (
              <div className="rounded-[18px] border border-white/60 bg-white/62 p-3 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/78" key={item}>
                <Check className="mb-2 h-4 w-4 text-emerald-600" />
                <p className="text-sm font-medium text-neutral-950">{item}</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  可进入团队评审
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
