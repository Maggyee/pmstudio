import { CheckCircle2, Circle, Loader2 } from "lucide-react";

import { agentSteps } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function AgentTimeline() {
  return (
    <div className="space-y-4">
      {agentSteps.map((step, index) => {
        const Icon = step.icon;
        const isDone = step.status === "Done";
        const isRunning = step.status === "Running";
        const statusLabel = isDone ? "已完成" : isRunning ? "生成中" : "排队中";

        return (
          <div className="relative flex gap-4" key={step.title}>
            {index < agentSteps.length - 1 ? (
              <div className="absolute left-5 top-11 h-[calc(100%-1.25rem)] w-px bg-neutral-200" />
            ) : null}
            <div
              className={cn(
                "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-white",
                isDone && "border-emerald-200 bg-emerald-50 text-emerald-700",
                isRunning && "border-blue-200 bg-blue-50 text-blue-700",
                !isDone && !isRunning && "border-neutral-200 text-neutral-400",
              )}
            >
              {isDone ? <CheckCircle2 className="h-5 w-5" /> : null}
              {isRunning ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {!isDone && !isRunning ? <Circle className="h-5 w-5" /> : null}
            </div>
            <div className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-neutral-500" />
                    <h3 className="text-sm font-semibold text-neutral-950">{step.title}</h3>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{step.detail}</p>
                </div>
                <span
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium",
                    isDone && "bg-emerald-50 text-emerald-700",
                    isRunning && "bg-blue-50 text-blue-700",
                    !isDone && !isRunning && "bg-neutral-100 text-neutral-500",
                  )}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
