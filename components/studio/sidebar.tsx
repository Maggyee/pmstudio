import {
  BarChart3,
  Bot,
  FileText,
  FolderKanban,
  GitBranch,
  LineChart,
  Plus,
  Presentation,
  Scale,
  Search,
  Wand2,
} from "lucide-react";

import {
  pmAgents,
  studioProjects,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function SidebarGroup({
  title,
  items,
  icon,
  activeItem,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  activeItem?: string;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 px-2 text-[11px] font-semibold tracking-normal text-neutral-400">
        {icon}
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const active = item === activeItem;

          return (
            <button
              className={cn(
                "flex min-h-9 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950",
                active && "bg-neutral-100 text-neutral-950 shadow-sm ring-1 ring-black/5",
              )}
              key={item}
              type="button"
            >
              <span className="truncate">{item}</span>
              {active ? <span className="h-2 w-2 rounded-full bg-[#20d69b]" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

const agentIcons = [Search, FileText, LineChart, BarChart3, Wand2, Scale, Presentation];

function getAgentStatusClass(status: string) {
  if (status === "已完成") {
    return "border-emerald-500/15 bg-emerald-50 text-emerald-700";
  }

  if (status === "运行中") {
    return "border-blue-500/15 bg-blue-50 text-blue-700";
  }

  return "border-neutral-200 bg-neutral-50 text-neutral-500";
}

function MultiAgentWorkflow() {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 px-2 text-[11px] font-semibold tracking-normal text-neutral-400">
        <GitBranch className="h-3.5 w-3.5" />
        PM 多 Agent 工作流
      </div>

      <div className="rounded-[22px] border border-black/10 bg-white p-2 shadow-sm">
        <div className="mb-2 rounded-[18px] bg-neutral-950 p-2.5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-emerald-300" />
              <p className="whitespace-nowrap text-sm font-semibold">Agent 团队</p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[11px] text-white/78">
              {pmAgents.length} Agents
            </span>
          </div>
          <p className="mt-1.5 line-clamp-1 text-xs leading-5 text-white/58">
            多个专业 Agent 按产品工作环节协同。
          </p>
        </div>

        <div className="space-y-1">
          {pmAgents.map((agent, index) => {
            const Icon = agentIcons[index] ?? Bot;
            const running = agent.status === "运行中";

            return (
              <button
                className={cn(
                  "group w-full rounded-[16px] px-2.5 py-2 text-left transition hover:bg-neutral-50",
                  running && "bg-blue-50/70 ring-1 ring-blue-200/70",
                )}
                key={agent.name}
                type="button"
              >
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    {index < pmAgents.length - 1 ? (
                      <span className="absolute left-3.5 top-7 h-[calc(100%+3px)] w-px bg-neutral-200" />
                    ) : null}
                    <span
                      className={cn(
                        "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border bg-white text-neutral-500 shadow-sm",
                        running && "border-blue-200 bg-white text-blue-700",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-semibold text-neutral-900">{agent.name}</p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          getAgentStatusClass(agent.status),
                        )}
                      >
                        {agent.status}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-neutral-500">
                      {agent.responsibility}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function StudioSidebar() {
  return (
    <div className="border-b border-black/10 p-4">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">FinSight 智能投研工作台</p>
          <p className="text-xs text-neutral-500">产品方案工作区</p>
        </div>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white text-neutral-500 shadow-sm transition hover:text-neutral-950"
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5">
        <SidebarGroup
          activeItem="FinSight 智能投研工作台"
          icon={<FolderKanban className="h-3.5 w-3.5" />}
          items={studioProjects}
          title="项目"
        />
        <MultiAgentWorkflow />
      </div>
    </div>
  );
}
