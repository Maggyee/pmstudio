"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot,
  ChevronDown,
  Download,
  FileText,
  GalleryVerticalEnd,
  Play,
  RefreshCw,
  Share2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

import { ArtifactCanvas } from "@/components/studio/artifact-canvas";
import { StudioSidebar } from "@/components/studio/sidebar";
import { studioDesignSystems } from "@/lib/mock-data";
import type {
  AgentProvider,
  AgentProviderId,
  GeneratedPack,
  HarnessEvent,
  HarnessWorkflow,
} from "@/lib/agent-harness";
import type { ProductPack } from "@/lib/product-pack";
import { cn } from "@/lib/utils";

const fallbackProviders: AgentProvider[] = [
  {
    capabilities: {
      fileEditing: false,
      nativeSkillLoading: false,
      permissionMode: "none",
      resume: false,
      streaming: true,
    },
    command: "in-process",
    displayName: "Mock PM Agent",
    id: "mock",
    status: "available",
  },
  {
    capabilities: {
      fileEditing: true,
      nativeSkillLoading: true,
      permissionMode: "strict",
      resume: false,
      streaming: true,
    },
    command: "codex exec --cwd <artifact-dir> <prompt>",
    displayName: "Codex",
    id: "codex",
    status: "planned",
  },
  {
    capabilities: {
      fileEditing: true,
      nativeSkillLoading: true,
      permissionMode: "strict",
      resume: true,
      streaming: true,
    },
    command: "claude --print --output-format stream-json --cwd <artifact-dir> <prompt>",
    displayName: "Claude Code",
    id: "claude-code",
    status: "planned",
  },
  {
    capabilities: {
      fileEditing: false,
      nativeSkillLoading: false,
      permissionMode: "permissive",
      resume: false,
      streaming: true,
    },
    command: "server-side provider call",
    displayName: "API Fallback",
    id: "api-fallback",
    status: "planned",
  },
];

type HarnessApiResponse = {
  providers?: AgentProvider[];
};

type DemoProject = {
  id: string;
  productPack: ProductPack;
  agentEvents: HarnessEvent[];
  createdAt: string;
  updatedAt: string;
};

const localProjectsStorageKey = "pmstudio:demo-projects:v1";
const localActiveProjectStorageKey = "pmstudio:active-project-id:v1";

function TopbarPicker({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      className="group inline-flex h-9 min-w-0 items-center gap-2 rounded-full border border-black/8 bg-white/60 px-3 text-left text-sm shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-black/14 hover:bg-white hover:shadow-md"
      type="button"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition group-hover:bg-neutral-950 group-hover:text-white">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] leading-none text-neutral-400">{label}</span>
        <span className="mt-0.5 block max-w-[118px] truncate font-medium text-neutral-800 xl:max-w-[150px]">
          {value}
        </span>
      </span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400 transition group-hover:text-neutral-600" />
    </button>
  );
}

function getProviderStatusLabel(provider?: AgentProvider, loading?: boolean) {
  if (loading) return "检测中";
  if (!provider) return "未检测";
  if (provider.status === "available") return "available";

  return "dry-run";
}

function AgentProviderPicker({
  loading,
  onChange,
  onRefresh,
  providers,
  value,
}: {
  loading: boolean;
  onChange: (value: AgentProviderId) => void;
  onRefresh: () => void;
  providers: AgentProvider[];
  value: AgentProviderId;
}) {
  const currentProvider =
    providers.find((provider) => provider.id === value) ??
    fallbackProviders.find((provider) => provider.id === value);
  const statusLabel = getProviderStatusLabel(currentProvider, loading);

  return (
    <div className="inline-flex items-center gap-1">
      <label className="group relative inline-flex h-9 min-w-0 items-center gap-2 rounded-full border border-black/8 bg-white/60 px-3 text-left text-sm shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-black/14 hover:bg-white hover:shadow-md">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition group-hover:bg-neutral-950 group-hover:text-white">
          <Bot className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] leading-none text-neutral-400">智能体</span>
          <span className="mt-0.5 flex max-w-[142px] items-center gap-1.5 truncate font-medium text-neutral-800 xl:max-w-[170px]">
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                currentProvider?.status === "available" ? "bg-emerald-500" : "bg-amber-400",
                loading && "bg-neutral-300",
              )}
            />
            <span className="truncate">{currentProvider?.displayName ?? value}</span>
            <span className="shrink-0 text-[10px] font-medium text-neutral-400">
              {statusLabel}
            </span>
          </span>
        </span>
        <select
          aria-label="智能体"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={(event) => onChange(event.target.value as AgentProviderId)}
          value={value}
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.displayName} · {getProviderStatusLabel(provider)}
            </option>
          ))}
        </select>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400 transition group-hover:text-neutral-600" />
      </label>
      <button
        aria-label="重新检测智能体"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white/60 text-neutral-500 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-neutral-950 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        onClick={onRefresh}
        type="button"
      >
        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
      </button>
    </div>
  );
}

export function StudioShell({
  activeArtifact,
  activeViewport,
  activeWorkflow,
  agentEvents,
  productPack,
}: {
  activeArtifact?: string;
  activeViewport?: string;
  activeWorkflow?: HarnessWorkflow;
  agentEvents?: HarnessEvent[];
  productPack?: ProductPack;
}) {
  const fallbackProject: DemoProject | undefined = useMemo(
    () =>
      productPack
        ? {
            agentEvents: agentEvents ?? [],
            createdAt: productPack.generatedAt,
            id: productPack.id,
            productPack,
            updatedAt: productPack.generatedAt,
          }
        : undefined,
    [agentEvents, productPack],
  );
  const [projects, setProjects] = useState<DemoProject[]>(fallbackProject ? [fallbackProject] : []);
  const [activeProjectId, setActiveProjectId] = useState(fallbackProject?.id);
  const activeProject =
    projects.find((project) => project.id === activeProjectId) ?? projects[0] ?? fallbackProject;
  const [shellProductPack, setShellProductPack] = useState(activeProject?.productPack ?? productPack);
  const [shellAgentEvents, setShellAgentEvents] = useState<HarnessEvent[]>(
    activeProject?.agentEvents ?? agentEvents ?? [],
  );
  const [creatingProject, setCreatingProject] = useState(false);
  const projectTitle = shellProductPack?.project.title ?? "FinSight 智能投研工作台";
  const workflowTitle = activeWorkflow?.title ?? "Idea-to-Product Pack";
  const [selectedProvider, setSelectedProvider] = useState<AgentProviderId>("mock");
  const [providers, setProviders] = useState<AgentProvider[]>(fallbackProviders);
  const [providersLoading, setProvidersLoading] = useState(true);

  useEffect(() => {
    try {
      const storedProjectsValue = window.localStorage.getItem(localProjectsStorageKey);
      const storedActiveProjectId = window.localStorage.getItem(localActiveProjectStorageKey);

      if (!storedProjectsValue) return;

      const parsedProjects = JSON.parse(storedProjectsValue) as DemoProject[];

      if (!Array.isArray(parsedProjects) || parsedProjects.length === 0) return;

      window.setTimeout(() => {
        setProjects(parsedProjects);
        setActiveProjectId(
          storedActiveProjectId && parsedProjects.some((project) => project.id === storedActiveProjectId)
            ? storedActiveProjectId
            : parsedProjects[0].id,
        );
      }, 0);
    } catch {
      window.localStorage.removeItem(localProjectsStorageKey);
      window.localStorage.removeItem(localActiveProjectStorageKey);
    }
  }, []);

  useEffect(() => {
    const nextProject =
      projects.find((project) => project.id === activeProjectId) ?? projects[0] ?? fallbackProject;

    if (!nextProject) return;

    window.setTimeout(() => {
      setShellProductPack(nextProject.productPack);
      setShellAgentEvents(nextProject.agentEvents);
    }, 0);
  }, [activeProjectId, fallbackProject, projects]);

  useEffect(() => {
    if (!projects.length) return;

    window.localStorage.setItem(localProjectsStorageKey, JSON.stringify(projects));

    if (activeProjectId) {
      window.localStorage.setItem(localActiveProjectStorageKey, activeProjectId);
    }
  }, [activeProjectId, projects]);

  const upsertProject = useCallback(({
    agentEvents: nextEvents,
    productPack: nextPack,
  }: {
    agentEvents?: HarnessEvent[];
    productPack: ProductPack;
  }) => {
    const now = new Date().toISOString();

    setShellProductPack(nextPack);

    if (nextEvents) {
      setShellAgentEvents(nextEvents);
    }

    setProjects((currentProjects) => {
      const existing = currentProjects.find((project) => project.id === nextPack.id);
      const nextProject: DemoProject = {
        agentEvents: nextEvents ?? existing?.agentEvents ?? shellAgentEvents,
        createdAt: existing?.createdAt ?? nextPack.generatedAt ?? now,
        id: nextPack.id,
        productPack: nextPack,
        updatedAt: now,
      };
      const withoutCurrent = currentProjects.filter((project) => project.id !== nextPack.id);

      return [nextProject, ...withoutCurrent].slice(0, 12);
    });
    setActiveProjectId(nextPack.id);
  }, [shellAgentEvents]);

  const handleProductPackChange = useCallback((nextProductPack: ProductPack) => {
    upsertProject({
      productPack: nextProductPack,
    });
  }, [upsertProject]);

  async function refreshProviders() {
    setProvidersLoading(true);

    try {
      const response = await fetch("/api/harness", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Provider detection failed");
      }

      const data = (await response.json()) as HarnessApiResponse;

      if (data.providers?.length) {
        setProviders(data.providers);
      }
    } catch {
      setProviders(fallbackProviders);
    } finally {
      setProvidersLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadProviders() {
      try {
        const response = await fetch("/api/harness", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as HarnessApiResponse;

        if (active && data.providers?.length) {
          setProviders(data.providers);
        }
      } catch {
        if (active) {
          setProviders(fallbackProviders);
        }
      } finally {
        if (active) {
          setProvidersLoading(false);
        }
      }
    }

    void loadProviders();

    return () => {
      active = false;
    };
  }, []);

  async function handleShareWorkspace() {
    try {
      await window.navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard can be unavailable in some local browser contexts.
    }
  }

  function handleExportCurrentPack() {
    window.dispatchEvent(new CustomEvent("pmstudio:export-current-pack"));
  }

  function handleFocusRunInput() {
    window.dispatchEvent(new CustomEvent("pmstudio:focus-run-input"));
  }

  async function handleCreateProject(idea: string) {
    setCreatingProject(true);

    try {
      const response = await fetch("/api/generate", {
        body: JSON.stringify({
          input: idea,
          providerId: selectedProvider,
          workflowId: "idea-to-product-pack",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Project generation failed");
      }

      const generated = (await response.json()) as GeneratedPack;

      upsertProject({
        agentEvents: generated.events,
        productPack: generated.productPack,
      });
    } finally {
      setCreatingProject(false);
    }
  }

  return (
    <main className="min-h-screen text-[#191919]">
      <header className="relative z-40 border-b border-black/8 bg-white/60 backdrop-blur-2xl">
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-5">
          {/* Left: Logo + Title */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-neutral-900 to-neutral-700 shadow-lg shadow-neutral-900/20">
              <Image
                alt="PM Studio"
                className="h-6 w-6 object-contain brightness-0 invert"
                height={24}
                src="/pm-studio-logo.png"
                width={24}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">PM Studio</p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
                <span>工作台</span>
                <span className="text-neutral-300">/</span>
                <span className="truncate text-neutral-500">{projectTitle}</span>
              </div>
            </div>
          </div>

          {/* Center: Pickers */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 px-4 lg:flex">
            <TopbarPicker
              icon={<Sparkles className="h-3.5 w-3.5" />}
              label="设计系统"
              value={studioDesignSystems[0]}
            />
            <TopbarPicker
              icon={<GalleryVerticalEnd className="h-3.5 w-3.5" />}
              label="工作流"
              value={workflowTitle}
            />
            <AgentProviderPicker
              loading={providersLoading}
              onChange={setSelectedProvider}
              onRefresh={refreshProviders}
              providers={providers}
              value={selectedProvider}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-black/8 bg-white/70 px-3 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              onClick={handleShareWorkspace}
              type="button"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">分享</span>
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-black/8 bg-white/70 px-3 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              onClick={handleExportCurrentPack}
              type="button"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">导出</span>
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 text-sm font-medium text-white shadow-lg shadow-neutral-900/20 transition hover:-translate-y-0.5 hover:bg-black hover:shadow-xl hover:shadow-neutral-900/25"
              onClick={handleFocusRunInput}
              type="button"
            >
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">运行生成</span>
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-screen grid-cols-1">
        <aside className="hidden border-r border-[#eeeeee] bg-white/72">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <StudioSidebar
              activeProjectId={activeProjectId}
              activeWorkflow={activeWorkflow}
              creatingProject={creatingProject}
              onCreateProject={handleCreateProject}
              onSelectProject={setActiveProjectId}
              productPack={shellProductPack}
              projects={projects.map((project) => ({
                id: project.id,
                sourceIdea: project.productPack.sourceIdea,
                title: project.productPack.project.title,
                updatedAt: project.updatedAt,
              }))}
            />
          </div>
        </aside>

        <section className="min-w-0">
          <div className="hidden border-b border-[#eeeeee] bg-white/70 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-[#12a7ff]" />
              {projectTitle}
            </div>
          </div>
          <ArtifactCanvas
            activeArtifact={activeArtifact}
            activeViewport={activeViewport}
            agentEvents={shellAgentEvents}
            key={activeProjectId}
            onAgentEventsChange={setShellAgentEvents}
            onProductPackChange={handleProductPackChange}
            productPack={shellProductPack}
            providerId={selectedProvider}
          />
        </section>
      </div>
    </main>
  );
}
