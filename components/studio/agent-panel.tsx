import {
  ArrowUp,
  Check,
  CircleDashed,
  Loader2,
  MessageSquareText,
  Paperclip,
} from "lucide-react";

import type { HarnessEvent } from "@/lib/agent-harness";
import {
  buildFinSightProductPack,
  defaultFinSightIdea,
  type ProductPack,
} from "@/lib/product-pack";
import { cn } from "@/lib/utils";

const fallbackEvents: HarnessEvent[] = [
  {
    type: "queued",
    agent: "PM Orchestrator",
    message: "读取产品想法并加载 Product Pack workflow。",
  },
  {
    type: "running",
    agent: "需求分析 Agent",
    message: "拆解目标用户、场景、痛点和产品假设。",
  },
  {
    type: "artifact",
    agent: "PRD Agent",
    message: "输出 PRD、核心功能和 MVP 范围。",
    artifactId: "prd",
  },
];

function getEventIcon(event: HarnessEvent) {
  if (event.type === "done" || event.type === "artifact") return <Check className="h-3.5 w-3.5" />;
  if (event.type === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin" />;

  return <CircleDashed className="h-3.5 w-3.5" />;
}

function getEventLabel(event: HarnessEvent) {
  if (event.artifactId) return `${event.agent} · ${event.artifactId}`;

  return event.agent;
}

export function AgentPanel({
  events = fallbackEvents,
  productPack,
  variant = "column",
}: {
  events?: HarnessEvent[];
  productPack?: ProductPack;
  variant?: "column" | "floating";
}) {
  const floating = variant === "floating";
  const pack = productPack ?? buildFinSightProductPack(defaultFinSightIdea);
  const generatedCount = pack.artifactIndex.filter((artifact) => artifact.status === "ready").length;

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
            多个 Agent 正在围绕 {pack.project.title} 生成、校验和整理产品方案包。
          </p>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
              已组织 {generatedCount} 个可编辑、可评审、可导出的 artifact。
            </li>
            <li className="flex gap-2">
              <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
              当前数据来自统一 Product Pack，可替换为真实 Codex / Claude Code 运行结果。
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
          {events.map((event, index) => {
            const done = event.type === "done" || event.type === "artifact";
            const running = event.type === "running";

            return (
              <div className="flex items-start gap-3" key={`${event.agent}-${event.message}-${index}`}>
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    done && "border-emerald-500 bg-emerald-500 text-white",
                    running && "border-blue-500 bg-blue-50 text-blue-700",
                    !done && !running && "border-neutral-200 bg-white text-neutral-400",
                  )}
                >
                  {getEventIcon(event)}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-800">{getEventLabel(event)}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-neutral-500">{event.message}</span>
                </span>
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
