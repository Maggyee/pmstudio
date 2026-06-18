import {
  ArrowUp,
  Check,
  CircleDashed,
  Clock3,
  Loader2,
  MessageSquareText,
  Paperclip,
} from "lucide-react";

import type { AgentRunHistoryItem, HarnessEvent } from "@/lib/agent-harness";
import {
  buildFinSightProductPack,
  defaultFinSightIdea,
  type ProductPack,
} from "@/lib/product-pack";
import { cn } from "@/lib/utils";

const fallbackEvents: HarnessEvent[] = [
  {
    type: "queued",
    agent: "需求理解",
    message: "读取产品想法并确定 Product Pack 的文档产物范围。",
  },
  {
    type: "running",
    agent: "机会梳理",
    message: "拆解目标用户、场景、痛点和产品假设。",
  },
  {
    type: "artifact",
    agent: "PRD 文档",
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
  if (event.artifactId) return `${event.agent} · ${getArtifactLabel(event.artifactId)}`;

  return event.agent;
}

function getArtifactLabel(artifactId: string) {
  const labels: Record<string, string> = {
    "competitor-analysis": "竞品分析",
    "core-features": "核心功能",
    "executive-summary": "汇报摘要",
    personas: "用户画像",
    prd: "PRD",
    prototype: "原型",
    "prototype-structure": "原型结构",
    research: "市场研究",
    roadmap: "路线图",
  };

  return labels[artifactId] ?? artifactId;
}

function getRunModeLabel(item: AgentRunHistoryItem) {
  const labels: Record<AgentRunHistoryItem["runMode"], string> = {
    "api-fallback-dry-run": "API dry-run",
    "claude-cli": "Claude CLI",
    "claude-dry-run": "Claude dry-run",
    "codex-cli": "Codex CLI",
    "codex-dry-run": "Codex dry-run",
    mock: "Mock",
  };

  return labels[item.runMode];
}

function formatRunTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "刚刚";

  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AgentPanel({
  events = fallbackEvents,
  productPack,
  runHistory = [],
  variant = "column",
}: {
  events?: HarnessEvent[];
  productPack?: ProductPack;
  runHistory?: AgentRunHistoryItem[];
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
          工作流笔记
        </div>
        <div className={cn("space-y-3 text-sm leading-6 text-neutral-700", floating && "text-[13px] leading-6")}>
          <p>
            PM Studio 正在围绕 {pack.project.title} 生成、校验和整理产品方案包。
          </p>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
              已组织 {generatedCount} 个可编辑、可评审、可导出的 artifact。
            </li>
            <li className="flex gap-2">
              <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
              当前数据来自统一 Product Pack，后续可替换为真实 Codex / Claude Code 运行结果。
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
          <p className="text-sm font-semibold">编排进度</p>
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

      <section
        className={cn(
          "rounded-[22px] border border-black/10 bg-white p-4 shadow-sm",
          !floating && "liquid-card",
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">最近运行</p>
          <span className="rounded-full border border-black/10 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-500">
            {runHistory.length} 条
          </span>
        </div>
        {runHistory.length > 0 ? (
          <div className="space-y-2">
            {runHistory.slice(0, floating ? 4 : 6).map((item) => (
              <div className="rounded-xl border border-black/10 bg-neutral-50 p-3" key={item.runId}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-neutral-800">
                    {getRunModeLabel(item)}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-neutral-400">
                    <Clock3 className="h-3 w-3" />
                    {formatRunTime(item.createdAt)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
                  {item.sourceIdea}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs leading-5 text-neutral-500">
            运行一次生成后，这里会保留最近的 provider、workflow 和输入想法。
          </p>
        )}
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
