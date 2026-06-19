"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  Download,
  FileText,
  GalleryVerticalEnd,
  GitBranchPlus,
  RefreshCw,
  Search,
  Settings2,
  Share2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

import { ArtifactCanvas } from "@/components/studio/artifact-canvas";
import { StudioSidebar } from "@/components/studio/sidebar";
import { WorkflowHarnessDialog } from "@/components/studio/workflow-harness-dialog";
import { studioDesignSystems } from "@/lib/mock-data";
import type {
  AgentProvider,
  AgentProviderId,
  GeneratedPack,
  HarnessEvent,
  HarnessWorkflow,
  WorkflowId,
} from "@/lib/agent-harness";
import type { ProductPack } from "@/lib/product-pack";
import {
  getPresetWorkflowDefinition,
  presetWorkflowDefinitions,
  type WorkflowDefinition,
} from "@/lib/workflow-harness";
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
    displayName: "Mock PM Studio",
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
  providerSettings?: ProviderPathSettings;
  providers?: AgentProvider[];
};

type ProviderPathSettings = {
  claudeCodePath?: string;
  codexPath?: string;
  updatedAt?: string;
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

const designSystemOptions = [
  {
    description: "紧凑、清晰、适合 PM Studio 的工作台和 artifact 预览。",
    name: "Linear 风格 SaaS",
    swatches: ["#111111", "#FFFFFF", "#12A7FF", "#34C759"],
  },
  {
    description: "更少装饰、更强留白，用于评审型文档和公开演示。",
    name: "Vercel 极简",
    swatches: ["#000000", "#FAFAFA", "#666666", "#EAEAEA"],
  },
  {
    description: "偏文档协作的柔和界面，适合 PRD、路线图和研究材料。",
    name: "Notion AI",
    swatches: ["#191919", "#FBFAF7", "#EDEAE2", "#2EAADC"],
  },
  {
    description: "面向 B2B 决策场景，强调状态、权限、审阅和稳定交付。",
    name: "企业级 B2B",
    swatches: ["#111827", "#F8FAFC", "#2563EB", "#059669"],
  },
];

function workflowOptionId(definition: WorkflowDefinition): WorkflowId {
  return definition.workflowId ?? "idea-to-product-pack";
}

function getArtifactLabel(artifactId: string) {
  const labels: Record<string, string> = {
    "competitor-analysis": "竞品",
    "core-features": "功能",
    "executive-summary": "摘要",
    "market-research": "调研",
    personas: "画像",
    positioning: "定位",
    prd: "PRD",
    "prototype-brief": "原型 brief",
    "prototype-preview": "预览",
    "prototype-structure": "IA",
    roadmap: "路线图",
    "target-users": "用户",
    "user-flow": "User Flow",
    "user-stories": "故事",
  };

  return labels[artifactId] ?? artifactId;
}

const workflowPickerOptions: Array<{
  description: string;
  id: WorkflowId;
  outputs: string[];
  title: string;
}> = presetWorkflowDefinitions.map((definition) => ({
  description: definition.description,
  id: workflowOptionId(definition),
  outputs: definition.outputArtifactIds.slice(0, 4).map(getArtifactLabel),
  title: definition.name,
}));

function ChromePickerButton({
  active,
  children,
  icon,
  label,
  onClick,
  value,
}: {
  active?: boolean;
  children?: React.ReactNode;
  label: string;
  onClick: () => void;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      aria-expanded={active}
      aria-label={`${label}: ${value}`}
      className={cn(
        "group inline-flex h-10 min-w-0 items-center gap-2 rounded-xl border border-black/8 bg-white/70 px-3 text-left text-sm shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-black/14 hover:bg-white hover:shadow-md",
        active && "border-black/14 bg-white shadow-md",
      )}
      onClick={onClick}
      type="button"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition group-hover:bg-neutral-950 group-hover:text-white">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] leading-none text-neutral-400">{label}</span>
        <span className="mt-0.5 block max-w-[118px] truncate font-medium text-neutral-800 xl:max-w-[150px]">
          {value}
        </span>
      </span>
      {children}
      <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-neutral-400 transition", active && "rotate-180")} />
    </button>
  );
}

function DesignSystemPicker({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredOptions = designSystemOptions.filter((option) =>
    option.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const selected =
    designSystemOptions.find((option) => option.name === value) ?? designSystemOptions[0];

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <ChromePickerButton
        active={open}
        icon={<Sparkles className="h-3.5 w-3.5" />}
        label="设计系统"
        onClick={() => setOpen((current) => !current)}
        value={selected.name}
      />
      {open ? (
        <div className="absolute left-1/2 z-50 mt-2 grid w-[440px] -translate-x-1/2 grid-cols-[180px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
          <div className="border-r border-black/10 p-3">
            <div className="mb-2 flex h-8 items-center gap-2 rounded-lg border border-black/10 bg-neutral-50 px-2 text-xs text-neutral-500">
              <Search className="h-3.5 w-3.5" />
              <input
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-400"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索样式"
                value={query}
              />
            </div>
            <div className="space-y-1">
              {filteredOptions.map((option) => (
                <button
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs font-medium transition",
                    selected.name === option.name
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950",
                  )}
                  key={option.name}
                  onClick={() => {
                    onChange(option.name);
                    setOpen(false);
                  }}
                  type="button"
                >
                  <span className="truncate">{option.name}</span>
                  {selected.name === option.name ? <Check className="h-3.5 w-3.5" /> : null}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs font-semibold text-neutral-500">当前样式</p>
            <p className="mt-1 text-sm font-semibold text-neutral-950">{selected.name}</p>
            <p className="mt-2 text-xs leading-5 text-neutral-500">{selected.description}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {selected.swatches.map((swatch) => (
                <span
                  className="h-10 rounded-lg border border-black/10"
                  key={swatch}
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-black/10 bg-[#fbfaf7] p-3">
              <div className="h-2 w-20 rounded-full bg-neutral-950" />
              <div className="mt-3 h-2 w-full rounded-full bg-neutral-200" />
              <div className="mt-2 h-2 w-2/3 rounded-full bg-neutral-100" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function WorkflowPicker({
  onChange,
  value,
}: {
  onChange: (value: WorkflowId) => void;
  value: WorkflowId;
}) {
  const [open, setOpen] = useState(false);
  const selected =
    workflowPickerOptions.find((workflow) => workflow.id === value) ?? workflowPickerOptions[0];

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <ChromePickerButton
        active={open}
        icon={<GalleryVerticalEnd className="h-3.5 w-3.5" />}
        label="工作流"
        onClick={() => setOpen((current) => !current)}
        value={selected.title}
      />
      {open ? (
        <div className="absolute left-1/2 z-50 mt-2 w-[430px] -translate-x-1/2 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-2xl">
          {workflowPickerOptions.map((workflow) => (
            <button
              className={cn(
                "grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl p-3 text-left transition",
                selected.id === workflow.id ? "bg-neutral-950 text-white" : "hover:bg-neutral-50",
              )}
              key={workflow.id}
              onClick={() => {
                onChange(workflow.id);
                setOpen(false);
              }}
              type="button"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{workflow.title}</span>
                <span
                  className={cn(
                    "mt-1 block text-xs leading-5",
                    selected.id === workflow.id ? "text-white/68" : "text-neutral-500",
                  )}
                >
                  {workflow.description}
                </span>
                <span className="mt-3 flex flex-wrap gap-1">
                  {workflow.outputs.map((output) => (
                    <span
                      className={cn(
                        "rounded-md border px-2 py-1 text-[11px]",
                        selected.id === workflow.id
                          ? "border-white/16 bg-white/10 text-white/78"
                          : "border-black/10 bg-white text-neutral-500",
                      )}
                      key={output}
                    >
                      {output}
                    </span>
                  ))}
                </span>
              </span>
              {selected.id === workflow.id ? <Check className="mt-1 h-4 w-4" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getProviderStatusLabel(provider?: AgentProvider, loading?: boolean) {
  if (loading) return "检测中";
  if (!provider) return "未检测";
  if (provider.status === "available") return "可用";

  return "Dry-run";
}

function getPermissionLabel(provider?: AgentProvider) {
  if (!provider) return "无权限";
  if (provider.capabilities.permissionMode === "strict") return "严格权限";
  if (provider.capabilities.permissionMode === "permissive") return "宽松权限";

  return "本地模拟";
}

function AgentProviderPicker({
  loading,
  onChange,
  onRefresh,
  onSaveSettings,
  providerSettings,
  providers,
  settingsSaving,
  value,
}: {
  loading: boolean;
  onChange: (value: AgentProviderId) => void;
  onRefresh: () => void;
  onSaveSettings: (settings: ProviderPathSettings) => Promise<void>;
  providerSettings: ProviderPathSettings;
  providers: AgentProvider[];
  settingsSaving: boolean;
  value: AgentProviderId;
}) {
  const [open, setOpen] = useState(false);
  const [draftCodexPath, setDraftCodexPath] = useState(providerSettings.codexPath ?? "");
  const [draftClaudeCodePath, setDraftClaudeCodePath] = useState(
    providerSettings.claudeCodePath ?? "",
  );
  const currentProvider =
    providers.find((provider) => provider.id === value) ??
    fallbackProviders.find((provider) => provider.id === value);
  const statusLabel = getProviderStatusLabel(currentProvider, loading);
  const settingsDirty =
    draftCodexPath.trim() !== (providerSettings.codexPath ?? "") ||
    draftClaudeCodePath.trim() !== (providerSettings.claudeCodePath ?? "");

  async function handleSaveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSaveSettings({
      claudeCodePath: draftClaudeCodePath,
      codexPath: draftCodexPath,
    });
  }

  function handleToggleOpen() {
    if (!open) {
      setDraftCodexPath(providerSettings.codexPath ?? "");
      setDraftClaudeCodePath(providerSettings.claudeCodePath ?? "");
    }

    setOpen(!open);
  }

  return (
    <div
      className="relative inline-flex items-center gap-1"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <ChromePickerButton
        active={open}
        icon={<Bot className="h-3.5 w-3.5" />}
        label="智能体"
        onClick={handleToggleOpen}
        value={currentProvider?.displayName ?? value}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            currentProvider?.status === "available" ? "bg-emerald-500" : "bg-amber-400",
            loading && "bg-neutral-300",
          )}
        />
      </ChromePickerButton>
      <button
        aria-label="重新检测智能体"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/8 bg-white/70 text-neutral-500 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-neutral-950 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        onClick={onRefresh}
        type="button"
      >
        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
      </button>
      {open ? (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-[460px] -translate-x-1/2 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-2xl">
          <div className="px-2 pb-2 pt-1 text-xs font-semibold text-neutral-500">
            {statusLabel} · {getPermissionLabel(currentProvider)}
          </div>
          {providers.map((provider) => {
            const active = provider.id === value;

            return (
              <button
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl p-3 text-left transition",
                  active ? "bg-neutral-950 text-white" : "hover:bg-neutral-50",
                )}
                key={provider.id}
                onClick={() => {
                  onChange(provider.id);
                  setOpen(false);
                }}
                type="button"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        provider.status === "available" ? "bg-emerald-500" : "bg-amber-400",
                      )}
                    />
                    {provider.displayName}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-xs leading-5",
                      active ? "text-white/68" : "text-neutral-500",
                    )}
                  >
                    {getProviderStatusLabel(provider)} · {getPermissionLabel(provider)} ·{" "}
                    {provider.capabilities.streaming ? "Streaming" : "Batch"}
                  </span>
                  <span
                    className={cn(
                      "mt-2 block truncate text-[11px]",
                      active ? "text-white/45" : "text-neutral-400",
                    )}
                  >
                    {provider.command}
                  </span>
                </span>
                {active ? <Check className="mt-1 h-4 w-4" /> : null}
              </button>
            );
          })}
          <form
            className="mt-2 border-t border-black/10 px-2 pb-2 pt-3"
            onSubmit={handleSaveSettings}
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <Settings2 className="h-3.5 w-3.5" />
              本地 CLI 路径
            </div>
            <div className="grid gap-2">
              <label className="grid gap-1">
                <span className="text-[11px] font-medium text-neutral-500">Codex</span>
                <input
                  className="h-8 rounded-lg border border-black/10 bg-neutral-50 px-2.5 font-mono text-[11px] text-neutral-700 outline-none transition placeholder:text-neutral-400 focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                  onChange={(event) => setDraftCodexPath(event.target.value)}
                  placeholder="codex 或 /usr/local/bin/codex"
                  value={draftCodexPath}
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[11px] font-medium text-neutral-500">Claude Code</span>
                <input
                  className="h-8 rounded-lg border border-black/10 bg-neutral-50 px-2.5 font-mono text-[11px] text-neutral-700 outline-none transition placeholder:text-neutral-400 focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                  onChange={(event) => setDraftClaudeCodePath(event.target.value)}
                  placeholder="claude 或 /usr/local/bin/claude"
                  value={draftClaudeCodePath}
                />
              </label>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[11px] leading-4 text-neutral-400">
                留空则使用 PATH；环境变量会覆盖这里的值。
              </p>
              <button
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-neutral-950 px-2.5 text-xs font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                disabled={settingsSaving || (!settingsDirty && !loading)}
                type="submit"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", settingsSaving && "animate-spin")} />
                {settingsSaving ? "检测中" : "保存并检测"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
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
  const [selectedDesignSystem, setSelectedDesignSystem] = useState(
    studioDesignSystems[0] ?? designSystemOptions[0].name,
  );
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<WorkflowId>(
    activeWorkflow?.id ?? "idea-to-product-pack",
  );
  const [selectedWorkflowDefinition, setSelectedWorkflowDefinition] = useState<WorkflowDefinition>(
    () =>
      getPresetWorkflowDefinition(activeWorkflow?.id ?? "idea-to-product-pack") ??
      presetWorkflowDefinitions[0]!,
  );
  const [workflowHarnessOpen, setWorkflowHarnessOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AgentProviderId>("mock");
  const [providers, setProviders] = useState<AgentProvider[]>(fallbackProviders);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providerSettings, setProviderSettings] = useState<ProviderPathSettings>({});
  const [providerSettingsSaving, setProviderSettingsSaving] = useState(false);

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

  const handleWorkflowChange = useCallback((workflowId: WorkflowId) => {
    setSelectedWorkflowId(workflowId);

    const nextDefinition = getPresetWorkflowDefinition(workflowId);

    if (nextDefinition) {
      setSelectedWorkflowDefinition(nextDefinition);
    }
  }, []);

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

      if (data.providerSettings) {
        setProviderSettings(data.providerSettings);
      }

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

        if (active && data.providerSettings) {
          setProviderSettings(data.providerSettings);
        }

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

  async function handleSaveProviderSettings(settings: ProviderPathSettings) {
    setProviderSettingsSaving(true);
    setProvidersLoading(true);

    try {
      const response = await fetch("/api/provider-settings", {
        body: JSON.stringify(settings),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Provider settings update failed");
      }

      const data = (await response.json()) as HarnessApiResponse;

      setProviderSettings(data.providerSettings ?? settings);

      if (data.providers?.length) {
        setProviders(data.providers);
      }
    } catch {
      setProviderSettings(settings);
      setProviders(fallbackProviders);
    } finally {
      setProviderSettingsSaving(false);
      setProvidersLoading(false);
    }
  }

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

  async function handleCreateProject(idea: string) {
    setCreatingProject(true);

    try {
      const response = await fetch("/api/generate", {
        body: JSON.stringify({
          input: idea,
          providerId: selectedProvider,
          workflowId: selectedWorkflowId,
          workflowDefinition: selectedWorkflowDefinition,
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
    <main className="flex h-screen min-h-0 flex-col overflow-hidden text-[#191919]">
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
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 px-4 xl:flex">
            <DesignSystemPicker
              onChange={setSelectedDesignSystem}
              value={selectedDesignSystem}
            />
            <WorkflowPicker
              onChange={handleWorkflowChange}
              value={selectedWorkflowId}
            />
            <button
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-black/8 bg-white/70 px-3 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-neutral-950 hover:shadow-md"
              onClick={() => setWorkflowHarnessOpen(true)}
              type="button"
            >
              <GitBranchPlus className="h-4 w-4 text-[#12a7ff]" />
              编排
              <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-500">
                {selectedWorkflowDefinition.steps.filter((step) => step.enabled).length}
              </span>
            </button>
            <AgentProviderPicker
              loading={providersLoading}
              onChange={setSelectedProvider}
              onRefresh={refreshProviders}
              onSaveSettings={handleSaveProviderSettings}
              providerSettings={providerSettings}
              providers={providers}
              settingsSaving={providerSettingsSaving}
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
          </div>
        </div>
      </header>

      <WorkflowHarnessDialog
        key={`${selectedWorkflowDefinition.id}:${selectedWorkflowDefinition.updatedAt}:${workflowHarnessOpen}`}
        onApply={(definition) => {
          const workflowId = definition.workflowId ?? selectedWorkflowId;
          setSelectedWorkflowDefinition(definition);
          setSelectedWorkflowId(workflowId);
        }}
        onClose={() => setWorkflowHarnessOpen(false)}
        open={workflowHarnessOpen}
        providerId={selectedProvider}
        selectedDefinition={selectedWorkflowDefinition}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden">
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
            workflowDefinition={selectedWorkflowDefinition}
          />
        </section>
      </div>
    </main>
  );
}
