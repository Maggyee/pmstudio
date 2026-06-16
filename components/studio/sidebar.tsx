import {
  FolderKanban,
  GitBranch,
  Plus,
} from "lucide-react";

import {
  studioProjects,
  studioWorkflows,
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

export function StudioSidebar() {
  return (
    <div className="border-b border-black/10 p-4">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">PM Studio AI 产品经理工作台</p>
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
          activeItem="PM Studio AI 产品经理工作台"
          icon={<FolderKanban className="h-3.5 w-3.5" />}
          items={studioProjects}
          title="项目"
        />
        <SidebarGroup
          activeItem="完整产品方案包"
          icon={<GitBranch className="h-3.5 w-3.5" />}
          items={studioWorkflows}
          title="工作流"
        />
      </div>
    </div>
  );
}
