import { ArrowRight, CheckCircle2, FileText, PanelTop } from "lucide-react";

import { prdPrototypeAlignment } from "@/lib/mock-data";

export function PrdPrototypeMap() {
  return (
    <div className="liquid-card overflow-hidden rounded-[2rem]">
      <div className="border-b border-white/50 bg-white/28 px-5 py-4 backdrop-blur sm:px-6">
        <p className="text-xs font-medium text-[#808080]">PRD 到原型的生成链路</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-normal text-black">
          对照 PRD 要点，生成可评审原型
        </h3>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-3 p-5 sm:p-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-black">
            <FileText className="h-4 w-4 text-[#12a7ff]" />
            PRD 要点
          </div>
          {prdPrototypeAlignment.map((item, index) => (
            <div className="rounded-2xl border border-white/55 bg-white/45 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/70" key={item.prdPoint}>
              <p className="text-xs font-medium text-[#808080]">要点 {index + 1}</p>
              <p className="mt-2 text-sm leading-6 text-[#101010]">{item.prdPoint}</p>
            </div>
          ))}
        </div>

        <div className="hidden w-px bg-white/55 lg:block" />

        <div className="space-y-3 border-t border-white/55 p-5 sm:p-6 lg:border-t-0">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-black">
            <PanelTop className="h-4 w-4 text-[#34c759]" />
            原型模块
          </div>
          {prdPrototypeAlignment.map((item) => (
            <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/78" key={item.prototypeBlock}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e1f2e6] text-[#166c13]">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-black">{item.prototypeBlock}</p>
                    <ArrowRight className="h-4 w-4 text-[#808080]" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#6a6b6c]">{item.rationale}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
