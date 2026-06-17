import {
  ArrowRight,
  CheckCircle2,
  FileText,
  PanelTop,
  Route,
  Sparkles,
} from "lucide-react";

import {
  buildFinSightProductPack,
  defaultFinSightIdea,
  type ProductPack,
} from "@/lib/product-pack";

export function PrdPrototypeMap({ productPack }: { productPack?: ProductPack }) {
  const pack = productPack ?? buildFinSightProductPack(defaultFinSightIdea);
  const userFlowSteps = pack.prototype.userFlow.split(" -> ");

  return (
    <div className="liquid-card overflow-hidden rounded-[2rem]">
      <div className="border-b border-white/50 bg-white/28 px-5 py-4 backdrop-blur sm:px-6">
        <p className="text-xs font-medium text-[#808080]">PRD 到原型的生成链路</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-normal text-black">
          对照 PRD 要点，生成可评审原型结构
        </h3>
      </div>

      <div className="grid gap-0 xl:grid-cols-[1fr_auto_0.8fr_auto_1fr]">
        <div className="space-y-3 p-5 sm:p-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-black">
            <FileText className="h-4 w-4 text-[#12a7ff]" />
            PRD 要点
          </div>
          {pack.prototype.prdLinks.map((item, index) => (
            <div
              className="rounded-2xl border border-white/55 bg-white/45 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/70"
              key={item.requirement}
            >
              <p className="text-xs font-medium text-[#808080]">要点 {index + 1}</p>
              <p className="mt-2 text-sm leading-6 text-[#101010]">{item.requirement}</p>
            </div>
          ))}
        </div>

        <div className="hidden w-px bg-white/55 xl:block" />

        <div className="space-y-3 border-t border-white/55 p-5 sm:p-6 xl:border-t-0">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-black">
            <Route className="h-4 w-4 text-emerald-600" />
            用户流程
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/58 p-4 shadow-sm backdrop-blur">
            <div className="space-y-3">
              {userFlowSteps.map((step, index) => (
                <div className="flex items-center gap-3" key={step}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e1f2e6] text-xs font-semibold text-[#166c13]">
                    {index + 1}
                  </span>
                  <p className="min-w-0 text-sm leading-6 text-[#101010]">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs leading-5 text-[#808080]">
            用户路径将驱动页面结构、原型说明和导出材料。
          </p>
        </div>

        <div className="hidden w-px bg-white/55 xl:block" />

        <div className="space-y-3 border-t border-white/55 p-5 sm:p-6 xl:border-t-0">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-black">
            <PanelTop className="h-4 w-4 text-[#34c759]" />
            原型模块
          </div>
          {pack.prototype.prdLinks.map((item) => (
            <div
              className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/78"
              key={item.screen}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e1f2e6] text-[#166c13]">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-black">{item.screen}</p>
                    <ArrowRight className="h-4 w-4 text-[#808080]" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#6a6b6c]">{item.rationale}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/50 bg-white/34 p-5 backdrop-blur sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-white/60 bg-white/58 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-black">
              <Sparkles className="h-4 w-4 text-amber-600" />
              OpenDesign Prompt
            </div>
            <p className="text-sm leading-7 text-[#5f6062]">{pack.prototype.openDesignPrompt}</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/58 p-4">
            <p className="text-sm font-semibold text-black">原型文件清单</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {pack.prototype.liveArtifact.files.map((file) => (
                <span
                  className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs text-[#606164]"
                  key={file.path}
                >
                  {file.path}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-[#808080]">
              {pack.prototype.liveArtifact.preview.type} preview · {pack.prototype.liveArtifact.preview.entry}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
