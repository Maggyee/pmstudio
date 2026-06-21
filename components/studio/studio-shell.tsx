"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
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
import { useRouter } from "next/navigation";

import { ArtifactCanvas } from "@/components/studio/artifact-canvas";
import { WorkflowHarnessDialog } from "@/components/studio/workflow-harness-dialog";
import { studioDesignSystems } from "@/lib/mock-data";
import type {
  AgentProvider,
  AgentProviderId,
  HarnessEvent,
  HarnessWorkflow,
  WorkflowId,
  AgentRunHistoryItem,
} from "@/lib/agent-harness";
import type { ProductPack } from "@/lib/product-pack";
import {
  buildDemoProject,
  getActiveProjectId,
  getProject,
  setActiveProject,
  type StudioProjectRecord,
  type StudioProjectStatus,
  updateProject,
} from "@/lib/studio-projects";
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
    displayName: "离线 Fallback",
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

const emptyHarnessEvents: HarnessEvent[] = [];

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

const shellStatusLabels: Record<StudioProjectStatus, string> = {
  archived: "已归档",
  awaiting_input: "待确认",
  empty: "空项目",
  error: "失败",
  ready: "已生成",
  running: "生成中",
};

const shellStatusStyles: Record<StudioProjectStatus, string> = {
  archived: "bg-neutral-100 text-neutral-500",
  awaiting_input: "bg-amber-50 text-amber-700",
  empty: "bg-neutral-100 text-neutral-600",
  error: "bg-red-50 text-red-700",
  ready: "bg-emerald-50 text-emerald-700",
  running: "bg-blue-50 text-blue-700",
};

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

  return "仅兜底";
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
  const hasAvailableRealProvider = providers.some(
    (provider) => provider.id !== "mock" && provider.status === "available",
  );
  const visibleProviders = hasAvailableRealProvider
    ? providers.filter((provider) => provider.id !== "mock")
    : providers;
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
          {visibleProviders.map((provider) => {
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
  projectId,
}: {
  activeArtifact?: string;
  activeViewport?: string;
  activeWorkflow?: HarnessWorkflow;
  agentEvents?: HarnessEvent[];
  productPack?: ProductPack;
  projectId?: string;
}) {
  const router = useRouter();
  const [project, setProject] = useState<StudioProjectRecord | null>(null);
  const [projectLoaded, setProjectLoaded] = useState(false);
  const shellProductPack = project?.productPack ?? productPack;
  const shellAgentEvents = project?.agentEvents ?? agentEvents ?? emptyHarnessEvents;
  const projectTitle = project?.name ?? shellProductPack?.project.title ?? "未生成项目";
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
  const [providerManuallySelected, setProviderManuallySelected] = useState(false);
  const [providers, setProviders] = useState<AgentProvider[]>(fallbackProviders);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providerSettings, setProviderSettings] = useState<ProviderPathSettings>({});
  const [providerSettingsSaving, setProviderSettingsSaving] = useState(false);
  const shellStatus: StudioProjectStatus = project?.status ?? (shellProductPack ? "ready" : "empty");
  const currentProviderLabel =
    providers.find((provider) => provider.id === selectedProvider)?.displayName ?? selectedProvider;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const resolvedProjectId = projectId ?? getActiveProjectId();
      const nextProject =
        resolvedProjectId === "demo"
          ? buildDemoProject()
          : resolvedProjectId
            ? getProject(resolvedProjectId)
            : null;

      if (nextProject) {
        setProject(nextProject);
        setActiveProject(nextProject.id);
        setSelectedDesignSystem(nextProject.designSystem);
        setSelectedProvider(nextProject.providerId);
        setProviderManuallySelected(true);
        setSelectedWorkflowId(nextProject.workflowId);

        const nextDefinition = getPresetWorkflowDefinition(nextProject.workflowId);

        if (nextDefinition) {
          setSelectedWorkflowDefinition(nextDefinition);
        }
      } else {
        setProject(null);
      }
      setProjectLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [projectId]);

  const patchProject = useCallback((patch: Partial<Omit<StudioProjectRecord, "id" | "createdAt">>) => {
    setProject((currentProject) => {
      if (!currentProject) return currentProject;

      const updated = updateProject(currentProject.id, patch);

      return updated ?? currentProject;
    });
  }, []);

  const handleProductPackChange = useCallback((nextProductPack: ProductPack) => {
    patchProject({
      description: nextProductPack.project.oneLiner,
      productPack: nextProductPack,
      status: "ready",
    });
  }, [patchProject]);

  const handleAgentEventsChange = useCallback((nextEvents: HarnessEvent[]) => {
    patchProject({
      agentEvents: nextEvents,
    });
  }, [patchProject]);

  const handleRunHistoryChange = useCallback((nextRunHistory: AgentRunHistoryItem[]) => {
    patchProject({
      runHistory: nextRunHistory,
    });
  }, [patchProject]);

  const handleProjectStatusChange = useCallback((status: StudioProjectStatus) => {
    patchProject({
      status,
    });
  }, [patchProject]);

  const handleWorkflowChange = useCallback((workflowId: WorkflowId) => {
    setSelectedWorkflowId(workflowId);
    patchProject({
      workflowId,
    });

    const nextDefinition = getPresetWorkflowDefinition(workflowId);

    if (nextDefinition) {
      setSelectedWorkflowDefinition(nextDefinition);
    }
  }, [patchProject]);

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

  useEffect(() => {
    if (providerManuallySelected || selectedProvider !== "mock") return;

    const availableRealProvider =
      providers.find((provider) => provider.id === "codex" && provider.status === "available") ??
      providers.find((provider) => provider.id === "claude-code" && provider.status === "available");

    if (!availableRealProvider) return;

    const timeoutId = window.setTimeout(() => {
      setSelectedProvider(availableRealProvider.id);
      patchProject({
        providerId: availableRealProvider.id,
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [patchProject, providerManuallySelected, providers, selectedProvider]);

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

  if (projectLoaded && !project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f1] px-5 text-center text-[#111111]">
        <div className="max-w-md rounded-lg border border-black/10 bg-white/80 p-8 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-950">
            <Image
              alt="PM Studio"
              className="h-8 w-8 object-contain brightness-0 invert"
              height={32}
              src="/pm-studio-logo.png"
              width={32}
            />
          </div>
          <h1 className="mt-5 text-lg font-semibold">项目不存在</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            这个项目可能已被删除，或者当前浏览器没有对应的本地项目记录。
          </p>
          <button
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white"
            onClick={() => router.push("/app")}
            type="button"
          >
            返回项目库
          </button>
        </div>
      </main>
    );
  }

  if (!projectLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f1] text-sm text-neutral-500">
        正在打开项目...
      </main>
    );
  }

  return (
    <main className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#f5f5f1] text-[#191919]">
      <header className="relative z-40 border-b border-black/10 bg-[#fbfaf7]/90 backdrop-blur-2xl">
        <div className="flex h-[52px] min-h-[52px] items-center justify-between gap-3 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-white hover:text-neutral-950"
              onClick={() => router.push("/app")}
              title="返回项目库"
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
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
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-sm font-semibold leading-tight">{projectTitle}</p>
                <span
                  className={cn(
                    "hidden h-5 shrink-0 items-center rounded-md px-1.5 text-[11px] font-medium sm:inline-flex",
                    shellStatusStyles[shellStatus],
                  )}
                >
                  {shellStatusLabels[shellStatus]}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
                <span>Project</span>
                <span className="text-neutral-300">/</span>
                <span className="truncate text-neutral-500">
                  {selectedWorkflowDefinition.name} · {currentProviderLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 px-4 xl:flex">
            <DesignSystemPicker
              onChange={(nextDesignSystem) => {
                setSelectedDesignSystem(nextDesignSystem);
                patchProject({
                  designSystem: nextDesignSystem,
                });
              }}
              value={selectedDesignSystem}
            />
            <WorkflowPicker
              onChange={handleWorkflowChange}
              value={selectedWorkflowId}
            />
            <button
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-black/8 bg-white/70 px-3 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-neutral-950 hover:shadow-md"
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
              onChange={(providerId) => {
                setProviderManuallySelected(true);
                setSelectedProvider(providerId);
                patchProject({
                  providerId,
                });
              }}
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
              className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-black/8 bg-white/70 px-2.5 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              onClick={handleShareWorkspace}
              type="button"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">分享</span>
            </button>
            <button
              className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-black/8 bg-white/70 px-2.5 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
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
          patchProject({
            workflowId,
          });
        }}
        onClose={() => setWorkflowHarnessOpen(false)}
        open={workflowHarnessOpen}
        providerId={selectedProvider}
        selectedDefinition={selectedWorkflowDefinition}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden">
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
            onAgentEventsChange={handleAgentEventsChange}
            onProjectStatusChange={handleProjectStatusChange}
            onProductPackChange={handleProductPackChange}
            onRunHistoryChange={handleRunHistoryChange}
            productPack={shellProductPack}
            project={project ?? undefined}
            providerId={selectedProvider}
            workflowDefinition={selectedWorkflowDefinition}
          />
        </section>
      </div>
    </main>
  );
}
