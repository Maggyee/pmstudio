"use client";

import { useState } from "react";
import {
  FolderKanban,
  GitBranch,
  Plus,
} from "lucide-react";

import type { HarnessWorkflow } from "@/lib/agent-harness";
import { getPublicPMWorkflows } from "@/lib/pm-workflows";
import type { ProductPack } from "@/lib/product-pack";
import { cn } from "@/lib/utils";

export type StudioProjectNavItem = {
  id: string;
  title: string;
  sourceIdea: string;
  updatedAt: string;
};

function SidebarGroup({
  title,
  items,
  icon,
  activeItem,
  onSelectItem,
}: {
  title: string;
  items: Array<{ id: string; label: string; meta?: string }>;
  icon: React.ReactNode;
  activeItem?: string;
  onSelectItem?: (id: string) => void;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 px-2 text-[11px] font-semibold tracking-normal text-neutral-400">
        {icon}
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const active = item.id === activeItem || item.label === activeItem;

          return (
            <button
              className={cn(
                "flex min-h-9 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950",
                active && "bg-neutral-100 text-neutral-950 shadow-sm ring-1 ring-black/5",
              )}
              key={item.id}
              onClick={() => onSelectItem?.(item.id)}
              type="button"
            >
              <span className="min-w-0">
                <span className="block truncate">{item.label}</span>
                {item.meta ? (
                  <span className="mt-0.5 block truncate text-[11px] text-neutral-400">
                    {item.meta}
                  </span>
                ) : null}
              </span>
              {active ? <span className="h-2 w-2 rounded-full bg-[#20d69b]" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function StudioSidebar({
  activeWorkflow,
  activeProjectId,
  creatingProject,
  onCreateProject,
  onSelectProject,
  productPack,
  projects,
}: {
  activeWorkflow?: HarnessWorkflow;
  activeProjectId?: string;
  creatingProject?: boolean;
  onCreateProject?: (idea: string) => void;
  onSelectProject?: (projectId: string) => void;
  productPack?: ProductPack;
  projects?: StudioProjectNavItem[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [idea, setIdea] = useState("");
  const projectTitle = productPack?.project.title ?? "未生成项目";
  const projectItems =
    projects?.map((project) => ({
      id: project.id,
      label: project.title,
      meta: project.sourceIdea,
    })) ?? [];
  const workflowItems = getPublicPMWorkflows().map((workflow) => ({
    id: workflow.id,
    label: workflow.name,
  }));
  const activeWorkflowTitle = activeWorkflow?.title ?? "Idea-to-Product Pack";

  function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedIdea = idea.trim();

    if (!trimmedIdea || creatingProject) return;

    onCreateProject?.(trimmedIdea);
    setIdea("");
    setShowCreate(false);
  }

  return (
    <div className="border-b border-black/10 p-4">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{projectTitle}</p>
          <p className="text-xs text-neutral-500">产品方案工作区</p>
        </div>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white text-neutral-500 shadow-sm transition hover:text-neutral-950"
          onClick={() => setShowCreate((value) => !value)}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {showCreate ? (
        <form
          className="mb-5 rounded-2xl border border-black/10 bg-white/72 p-3 shadow-sm"
          onSubmit={handleCreateProject}
        >
          <label className="block">
            <span className="text-[11px] font-semibold text-neutral-500">新项目想法</span>
            <textarea
              className="mt-2 min-h-24 w-full resize-y rounded-xl border border-black/10 bg-neutral-50 px-3 py-2 text-xs leading-5 text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30"
              disabled={creatingProject}
              onChange={(event) => setIdea(event.target.value)}
              placeholder="输入一个新的产品想法，现场生成产品方案包..."
              value={idea}
            />
          </label>
          <button
            className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg bg-neutral-950 px-3 text-xs font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-400"
            disabled={creatingProject || !idea.trim()}
            type="submit"
          >
            {creatingProject ? "生成中" : "创建并运行"}
          </button>
        </form>
      ) : null}

      <div className="space-y-5">
        <SidebarGroup
          activeItem={activeProjectId ?? projectTitle}
          icon={<FolderKanban className="h-3.5 w-3.5" />}
          items={projectItems}
          onSelectItem={onSelectProject}
          title="项目"
        />
        <SidebarGroup
          activeItem={activeWorkflowTitle}
          icon={<GitBranch className="h-3.5 w-3.5" />}
          items={workflowItems}
          title="工作流"
        />
      </div>
    </div>
  );
}
