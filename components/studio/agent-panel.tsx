import {
  ArrowUp,
  Check,
  CircleDashed,
  Loader2,
  MessageSquareText,
  Paperclip,
} from "lucide-react";

import { studioTimeline } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function AgentPanel({ variant = "column" }: { variant?: "column" | "floating" }) {
  const floating = variant === "floating";

  return (
    <div className={cn("space-y-3", floating ? "" : "p-4")}>
      <section
        className={cn(
          "rounded-[22px] border border-black/10 bg-white p-4 shadow-sm",
          !floating && "liquid-card",
        )}
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <MessageSquareText className="h-4 w-4 text-emerald-600" />
          多 Agent 协作笔记
        </div>
        <div className={cn("space-y-3 text-sm leading-6 text-neutral-700", floating && "text-[13px] leading-6")}>
          <p>
            需求分析、PRD、竞品、调研、原型和汇报材料 Agent 正在协同生成金融产品方案。
          </p>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
              每个 Agent 负责一个产品经理工作环节。
            </li>
            <li className="flex gap-2">
              <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
              交付物保持可编辑、可评审、可导出。
            </li>
          </ul>
        </div>
      </section>

      <section
        className={cn(
          "rounded-[22px] border border-black/10 bg-white p-4 shadow-sm",
          !floating && "liquid-card",
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Agent 编排</p>
          <span className="rounded-full border border-blue-500/10 bg-blue-50/80 px-2 py-1 text-xs font-medium text-blue-700">
            生成中
          </span>
        </div>
        <div className="space-y-3">
          {studioTimeline.map((step, index) => {
            const done = index < 3;
            const running = index === 3;

            return (
              <div className="flex items-center gap-3" key={step}>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border",
                    done && "border-emerald-500 bg-emerald-500 text-white",
                    running && "border-blue-500 bg-blue-50 text-blue-700",
                    !done && !running && "border-neutral-200 bg-white text-neutral-400",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : null}
                  {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  {!done && !running ? <CircleDashed className="h-3.5 w-3.5" /> : null}
                </span>
                <span className="text-sm text-neutral-700">{step}</span>
              </div>
            );
          })}
        </div>
      </section>

      {!floating ? (
        <section className="liquid-card rounded-[22px] p-3">
          <textarea
            className="h-28 w-full resize-none rounded-[18px] border border-black/10 bg-white/46 p-3 text-sm leading-6 outline-none backdrop-blur placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white/70"
            placeholder="描述产品想法、目标用户和需要生成的交付物..."
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/60 text-neutral-500 transition hover:bg-white"
              type="button"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              className="ml-auto flex h-9 items-center gap-2 rounded-full bg-[#191919] px-3 text-sm font-medium text-white shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-black"
              type="button"
            >
              生成
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
