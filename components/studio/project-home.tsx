"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  BookOpen,
  Boxes,
  ChevronRight,
  Copy,
  FileText,
  FolderKanban,
  Inbox,
  LayoutGrid,
  Pencil,
  Plus,
  RotateCcw,
  Route,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import Image from "next/image";

import { agentProviders, type AgentProvider, type AgentProviderId, type WorkflowId } from "@/lib/agent-harness";
import { studioDesignSystems } from "@/lib/mock-data";
import { getPublicPMWorkflows } from "@/lib/pm-workflows";
import {
  archiveProject,
  createProject,
  deleteProject,
  duplicateProject,
  ensureShowcaseProjects,
  getActiveProjectId,
  listProjects,
  restoreProject,
  setActiveProject,
  studioProjectsChangedEvent,
  type StudioProjectRecord,
  type StudioProjectStatus,
  updateProject,
} from "@/lib/studio-projects";
import { cn } from "@/lib/utils";

type StatusFilter = "active" | "all" | StudioProjectStatus;
type ProjectSort = "updated" | "created" | "name";

type HarnessApiResponse = {
  providers?: AgentProvider[];
};

const statusLabels: Record<StudioProjectStatus, string> = {
  archived: "已归档",
  awaiting_input: "待确认",
  empty: "空项目",
  error: "失败",
  ready: "已生成",
  running: "生成中",
};

const statusStyles: Record<StudioProjectStatus, string> = {
  archived: "bg-neutral-100 text-neutral-500",
  awaiting_input: "bg-amber-50 text-amber-700",
  empty: "bg-neutral-100 text-neutral-600",
  error: "bg-red-50 text-red-700",
  ready: "bg-emerald-50 text-emerald-700",
  running: "bg-blue-50 text-blue-700",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "刚刚";

  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(date);
}

function workflowLabel(workflowId: WorkflowId) {
  return getPublicPMWorkflows().find((workflow) => workflow.id === workflowId)?.name ?? workflowId;
}

function projectSummary(project: StudioProjectRecord) {
  return project.productPack?.project.oneLiner || project.description || project.sourceIdea || "等待你在工作区运行 agent。";
}

function workflowIcon(workflowId: WorkflowId) {
  const icons: Partial<Record<WorkflowId, typeof Sparkles>> = {
    "competitor-analysis": Boxes,
    "generate-prd": FileText,
    "idea-to-product-pack": Sparkles,
    "market-research": BookOpen,
    "prd-to-prototype-linker": LayoutGrid,
    "roadmap-generator": Route,
    "user-personas": FolderKanban,
  };

  return icons[workflowId] ?? Sparkles;
}

function ProjectStatusBadge({ status }: { status: StudioProjectStatus }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-md px-2 text-xs font-medium", statusStyles[status])}>
      {status === "running" ? <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {statusLabels[status]}
    </span>
  );
}

function ProjectThumbnail({
  compact,
  project,
}: {
  compact?: boolean;
  project: StudioProjectRecord;
}) {
  const initial = project.name.trim().slice(0, 1).toUpperCase() || "P";
  const hasPack = Boolean(project.productPack);

  return (
    <div className="relative aspect-[16/9] overflow-hidden border-b border-black/8 bg-[#fbfaf7]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(18,167,255,0.14),rgba(255,255,255,0.72)_42%,rgba(52,199,89,0.10))]" />
      {hasPack ? (
        <div className="absolute inset-3 overflow-hidden rounded-md border border-black/10 bg-white/90 p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3 text-[10px] font-medium text-neutral-400">
            <span className="truncate">PM Studio / product-pack</span>
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 h-3 w-3/4 rounded-full bg-neutral-950" />
          <div className="mt-2 h-2 w-full rounded-full bg-neutral-200" />
          <div className="mt-1.5 h-2 w-2/3 rounded-full bg-neutral-100" />
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {["PRD", "Prototype", "Roadmap"].map((label) => (
              <span
                className="truncate rounded border border-black/8 bg-[#f5f5f1] px-1.5 py-1 text-[10px] font-medium text-neutral-500"
                key={label}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-400">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-black/15 bg-white/72 text-base font-semibold text-neutral-700 shadow-sm">
            {initial}
          </div>
          {!compact ? (
            <span className="text-[11px] font-medium text-neutral-500">Empty workspace</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  compact,
  onArchive,
  onDelete,
  onDuplicate,
  onOpen,
  onRename,
  onRestore,
  project,
}: {
  compact?: boolean;
  onArchive: (project: StudioProjectRecord) => void;
  onDelete: (project: StudioProjectRecord) => void;
  onDuplicate: (project: StudioProjectRecord) => void;
  onOpen: (project: StudioProjectRecord) => void;
  onRename: (project: StudioProjectRecord) => void;
  onRestore: (project: StudioProjectRecord) => void;
  project: StudioProjectRecord;
}) {
  return (
    <article
      className={cn(
        "group min-w-0 overflow-hidden rounded-lg border border-black/10 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-white hover:shadow-md",
        compact ? "h-full" : "",
      )}
    >
      <button className="block w-full min-w-0 text-left" onClick={() => onOpen(project)} type="button">
        <ProjectThumbnail compact={compact} project={project} />
        <div className="p-3">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-sm font-semibold leading-5 text-neutral-950">{project.name}</h3>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-neutral-500">{projectSummary(project)}</p>
          <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-neutral-500">
            <span className="truncate">{workflowLabel(project.workflowId)}</span>
            <span className="shrink-0">{formatDate(project.updatedAt)}</span>
          </div>
        </div>
      </button>

      <div className="flex items-center justify-between gap-2 border-t border-black/8 px-3 py-2">
        <span className="min-w-0 truncate text-[11px] text-neutral-400">
          {project.providerId} · {project.designSystem}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
            onClick={() => onOpen(project)}
            title="打开"
            type="button"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
            onClick={() => onRename(project)}
            title="重命名"
            type="button"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
            onClick={() => onDuplicate(project)}
            title="复制"
            type="button"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          {project.status === "archived" ? (
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
              onClick={() => onRestore(project)}
              title="恢复"
              type="button"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
              onClick={() => onArchive(project)}
              title="归档"
              type="button"
            >
              <Archive className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-red-50 hover:text-red-700"
            onClick={() => onDelete(project)}
            title="删除"
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProjectHome() {
  const router = useRouter();
  const [projects, setProjects] = useState<StudioProjectRecord[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [providers, setProviders] = useState<AgentProvider[]>(agentProviders);
  const [sourceIdea, setSourceIdea] = useState("");
  const [name, setName] = useState("");
  const [workflowId, setWorkflowId] = useState<WorkflowId>("idea-to-product-pack");
  const [providerId, setProviderId] = useState<AgentProviderId>("mock");
  const [designSystem, setDesignSystem] = useState(studioDesignSystems[0] ?? "Linear 风格 SaaS");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sort, setSort] = useState<ProjectSort>("updated");
  const workflows = useMemo(() => getPublicPMWorkflows(), []);

  function refreshProjects() {
    ensureShowcaseProjects();
    setProjects(listProjects());
    setActiveProjectIdState(getActiveProjectId());
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(refreshProjects, 0);

    function handleStorage() {
      refreshProjects();
    }

    window.addEventListener(studioProjectsChangedEvent, handleStorage);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener(studioProjectsChangedEvent, handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProviders() {
      try {
        const response = await fetch("/api/harness", { cache: "no-store" });

        if (!response.ok) return;

        const data = (await response.json()) as HarnessApiResponse;

        if (active && data.providers?.length) {
          setProviders(data.providers);
        }
      } catch {
        if (active) setProviders(agentProviders);
      }
    }

    void loadProviders();

    return () => {
      active = false;
    };
  }, []);

  const sortedProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = projects.filter((project) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? project.status !== "archived"
            : project.status === statusFilter;
      const searchable = [
        project.name,
        project.sourceIdea,
        project.description,
        project.productPack?.project.title,
        project.productPack?.project.oneLiner,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
    });

    return filtered.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "zh-CN");
      if (sort === "created") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [projects, query, sort, statusFilter]);

  const recentProjects = useMemo(
    () =>
      [...projects]
        .filter((project) => project.status !== "archived")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6),
    [projects],
  );
  const selectedWorkflow = workflows.find((workflow) => workflow.id === workflowId) ?? workflows[0];

  function openProject(project: StudioProjectRecord) {
    setActiveProject(project.id);
    router.push(`/app/projects/${encodeURIComponent(project.id)}`);
  }

  function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const idea = sourceIdea.trim();

    if (!idea) return;

    const project = createProject({
      designSystem,
      name,
      providerId,
      sourceIdea: idea,
      workflowId,
    });

    setSourceIdea("");
    setName("");
    router.push(`/app/projects/${encodeURIComponent(project.id)}`);
  }

  function renameProject(project: StudioProjectRecord) {
    const nextName = window.prompt("项目名称", project.name)?.trim();

    if (!nextName || nextName === project.name) return;

    updateProject(project.id, { name: nextName });
    refreshProjects();
  }

  function copyProject(project: StudioProjectRecord) {
    const copy = duplicateProject(project.id);

    if (copy) {
      router.push(`/app/projects/${encodeURIComponent(copy.id)}`);
    }
  }

  function archiveProjectFromList(project: StudioProjectRecord) {
    archiveProject(project.id);
    refreshProjects();
  }

  function restoreProjectFromList(project: StudioProjectRecord) {
    restoreProject(project.id);
    refreshProjects();
  }

  function deleteProjectFromList(project: StudioProjectRecord) {
    const ok = window.confirm(`永久删除「${project.name}」？这个操作不能撤销。`);

    if (!ok) return;

    deleteProject(project.id);
    refreshProjects();
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5f5f1] text-[#111111]">
      <header className="sticky top-0 z-30 border-b border-black/8 bg-[#fbfaf7]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-950 shadow-lg shadow-neutral-900/15">
              <Image
                alt="PM Studio"
                className="h-5 w-5 object-contain brightness-0 invert"
                height={20}
                src="/pm-studio-logo.png"
                width={20}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">PM Studio</p>
              <p className="truncate text-xs text-neutral-500">Projects</p>
            </div>
          </div>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border border-black/10 bg-white/80 px-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-neutral-950 hover:shadow-md"
            onClick={() => router.push(activeProjectId ? `/app/projects/${encodeURIComponent(activeProjectId)}` : "/app")}
            type="button"
          >
            <FolderKanban className="h-4 w-4" />
            {activeProjectId ? "继续上次项目" : "项目库"}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-5 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto flex w-full max-w-[960px] flex-col items-center gap-4 pt-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm">
              <Image alt="PM Studio" height={18} src="/pm-studio-logo.png" width={18} />
            </span>
            PM Studio
          </div>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-normal text-neutral-950 md:text-4xl">
            今天要规划什么产品？
          </h1>
          <p className="max-w-xl text-sm leading-6 text-neutral-500">
            输入一个想法或粘贴 PRD，先创建项目空间，再在项目页让 agent 生成 PRD、原型、调研和路线图。
          </p>

          <form className="mt-2 w-full max-w-[760px]" onSubmit={handleCreateProject}>
            <div className="overflow-hidden rounded-lg border border-black/10 bg-white/90 text-left shadow-sm transition focus-within:border-[#12a7ff]/60 focus-within:ring-4 focus-within:ring-[#94D8FF]/25">
              <textarea
                className="min-h-36 w-full resize-none border-0 bg-transparent px-4 py-4 text-sm leading-6 outline-none placeholder:text-neutral-400"
                onChange={(event) => setSourceIdea(event.target.value)}
                placeholder="例如：帮我生成一个阅读 app 的 PRD，并在项目里联动生成可预览的移动端原型..."
                suppressHydrationWarning
                value={sourceIdea}
              />
              <div className="border-t border-black/8 bg-[#fbfaf7]/80 px-3 py-3">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <input
                    className="h-9 min-w-0 rounded-md border border-black/10 bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                    onChange={(event) => setName(event.target.value)}
                    placeholder="项目名称（可选）"
                    suppressHydrationWarning
                    value={name}
                  />
                  <button
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-400"
                    disabled={!sourceIdea.trim()}
                    type="submit"
                  >
                    <Plus className="h-4 w-4" />
                    新建项目
                  </button>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <select
                    aria-label="工作流"
                    className="h-9 rounded-md border border-black/10 bg-white px-2.5 text-xs text-neutral-600 outline-none focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                    onChange={(event) => setWorkflowId(event.target.value as WorkflowId)}
                    value={workflowId}
                  >
                    {workflows.map((workflow) => (
                      <option key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Agent"
                    className="h-9 rounded-md border border-black/10 bg-white px-2.5 text-xs text-neutral-600 outline-none focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                    onChange={(event) => setProviderId(event.target.value as AgentProviderId)}
                    value={providerId}
                  >
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.displayName} · {provider.status === "available" ? "可用" : "待配置"}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="设计系统"
                    className="h-9 rounded-md border border-black/10 bg-white px-2.5 text-xs text-neutral-600 outline-none focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                    onChange={(event) => setDesignSystem(event.target.value)}
                    value={designSystem}
                  >
                    {studioDesignSystems.map((system) => (
                      <option key={system} value={system}>
                        {system}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-neutral-400">
                  <span className="truncate">{selectedWorkflow?.name ?? workflowId}</span>
                  <span className="shrink-0">创建后不会自动生成</span>
                </div>
              </div>
            </div>
          </form>

          <div className="flex w-full max-w-[760px] flex-wrap justify-center gap-2">
            {workflows.map((workflow) => {
              const Icon = workflowIcon(workflow.id);

              return (
                <button
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium shadow-sm transition hover:-translate-y-0.5",
                    workflowId === workflow.id
                      ? "border-[#12a7ff]/35 bg-[#e9f7ff] text-[#087ec4]"
                      : "border-black/10 bg-white/80 text-neutral-500 hover:border-black/20 hover:bg-white hover:text-neutral-950",
                  )}
                  key={workflow.id}
                  onClick={() => setWorkflowId(workflow.id)}
                  type="button"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {workflow.name}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-neutral-950">最近项目</h2>
            {recentProjects.length > 0 ? (
              <button
                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition hover:text-neutral-950"
                onClick={() => setStatusFilter("active")}
                type="button"
              >
                查看全部
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
          {recentProjects.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recentProjects.map((project) => (
                <ProjectCard
                  compact
                  key={project.id}
                  onArchive={archiveProjectFromList}
                  onDelete={deleteProjectFromList}
                  onDuplicate={copyProject}
                  onOpen={openProject}
                  onRename={renameProject}
                  onRestore={restoreProjectFromList}
                  project={project}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-black/15 bg-white/55 p-6 text-center">
              <Inbox className="h-7 w-7 text-neutral-400" />
              <p className="mt-3 text-sm font-medium text-neutral-950">还没有项目</p>
              <p className="mt-1 text-xs text-neutral-500">用上方输入框创建第一个空项目。</p>
            </div>
          )}
        </section>

        <section>
          <div className="flex flex-col gap-3 border-y border-black/10 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">项目库</h2>
              <p className="mt-1 text-xs text-neutral-500">{projects.length} 个本地项目，仅保存在当前浏览器。</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block min-w-0 sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  className="h-10 w-full rounded-lg border border-black/10 bg-white px-9 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索项目、PRD 或想法"
                  suppressHydrationWarning
                  value={query}
                />
              </label>
              <select
                className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30"
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                value={statusFilter}
              >
                <option value="active">未归档</option>
                <option value="all">全部</option>
                <option value="empty">空项目</option>
                <option value="running">生成中</option>
                <option value="ready">已生成</option>
                <option value="error">失败</option>
                <option value="archived">已归档</option>
              </select>
              <select
                className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30"
                onChange={(event) => setSort(event.target.value as ProjectSort)}
                value={sort}
              >
                <option value="updated">最近更新</option>
                <option value="created">创建时间</option>
                <option value="name">项目名称</option>
              </select>
            </div>
          </div>

          {sortedProjects.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  onArchive={archiveProjectFromList}
                  onDelete={deleteProjectFromList}
                  onDuplicate={copyProject}
                  onOpen={openProject}
                  onRename={renameProject}
                  onRestore={restoreProjectFromList}
                  project={project}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex min-h-60 flex-col items-center justify-center rounded-lg border border-dashed border-black/15 bg-white/65 p-8 text-center">
              <Inbox className="h-8 w-8 text-neutral-400" />
              <h3 className="mt-4 text-sm font-semibold text-neutral-950">没有匹配项目</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                调整搜索或筛选条件，或者用上方表单创建一个新的空项目。
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
