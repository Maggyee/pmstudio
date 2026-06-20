"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  Braces,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileCode2,
  FileJson,
  FileText,
  FolderOpen,
  GitBranchPlus,
  Link2,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  Presentation,
  RefreshCw,
  Send,
  Share2,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { AgentPanel } from "@/components/studio/agent-panel";
import { DocumentPreview } from "@/components/studio/document-preview";
import { PrdPreview } from "@/components/studio/prd-preview";
import { ResearchPreview } from "@/components/studio/research-preview";
import {
  StudioPrototypePreview,
} from "@/components/studio/prototype-preview";
import { SummaryPreview } from "@/components/studio/summary-preview";
import {
  studioTabs,
} from "@/lib/mock-data";
import {
  buildPrototypeArtifactBundle,
  getPrototypeScreenPath,
  prototypeKindOptions,
  prototypeTemplateOptions,
  renderPrototypeFile,
  type PrototypeGenerationOptions,
  type PrototypeKind,
  type PrototypeTemplateId,
} from "@/lib/prototype-artifacts";
import type {
  AgentProviderId,
  AgentRunMode,
  AgentRunHistoryItem,
  GeneratedPack,
  HarnessEvent,
  WorkflowId,
} from "@/lib/agent-harness";
import type { ProductPack } from "@/lib/product-pack";
import {
  buildArtifactDocument,
  renderArtifactMarkdown,
} from "@/lib/pm-documents";
import {
  getPresetWorkflowDefinition,
  type WorkflowDefinition,
} from "@/lib/workflow-harness";
import { cn } from "@/lib/utils";

const localProductPackStorageKey = "pmstudio:last-product-pack:v4";
const localEventsStorageKey = "pmstudio:last-agent-events:v4";
const localRunHistoryStorageKey = "pmstudio:run-history:v4";
const designFilesTabId = "design-files";

type ExportFormat = ProductPack["artifactIndex"][number]["exportFormats"][number];

type WorkspaceTabId = typeof designFilesTabId | string;

type PrdPrototypeSource = {
  index: number;
  requirement: string;
  source: "core-feature" | "mvp-scope" | "user-story";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProductPack(value: unknown): value is ProductPack {
  return (
    isRecord(value) &&
    value.schemaVersion === "pm-product-pack.v1" &&
    typeof value.sourceIdea === "string" &&
    isRecord(value.project) &&
    isRecord(value.prd) &&
    isRecord(value.prototype)
  );
}

function isHarnessEventList(value: unknown): value is HarnessEvent[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.type === "string" &&
        typeof item.agent === "string" &&
        typeof item.message === "string",
    )
  );
}

function isRunHistoryList(value: unknown): value is AgentRunHistoryItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.runId === "string" &&
        typeof item.providerId === "string" &&
        typeof item.runMode === "string" &&
        typeof item.workflowId === "string" &&
        typeof item.projectTitle === "string" &&
        typeof item.sourceIdea === "string" &&
        typeof item.createdAt === "string",
    )
  );
}

type ArtifactAction = {
  artifactId?: string;
  format?: ExportFormat;
  handoffTarget?: "codex" | "open-design";
  href?: string;
  label: string;
};

function ActionIcon({ action }: { action: ArtifactAction }) {
  if (action.label.includes("Markdown")) return <FileText className="h-4 w-4" />;
  if (action.label.includes("PDF")) return <Download className="h-4 w-4" />;
  if (action.label.includes("HTML")) return <FileCode2 className="h-4 w-4" />;
  if (action.label.includes("Artifact")) return <FileCode2 className="h-4 w-4" />;
  if (action.label.includes("JSON")) return <FileCode2 className="h-4 w-4" />;
  if (action.label.includes("PPTX")) return <Presentation className="h-4 w-4" />;
  if (action.label.includes("Codex")) return <Send className="h-4 w-4" />;
  return <Share2 className="h-4 w-4" />;
}

function ArtifactView({
  activeTab,
  activeViewport,
  prototypeExportingFormat,
  isEditing,
  onEditPrototypePrompt,
  onExportPrototypeHtml,
  onExportPrototypeLiveArtifact,
  onOpenPrototypeLink,
  onOpenPrototypeSource,
  productPack,
  prototypeOptions,
  onChange,
}: {
  activeTab: (typeof studioTabs)[number];
  activeViewport?: string;
  prototypeExportingFormat?: "html" | "json" | null;
  isEditing?: boolean;
  onEditPrototypePrompt?: () => void;
  onExportPrototypeHtml?: () => void;
  onExportPrototypeLiveArtifact?: () => void;
  onOpenPrototypeLink?: (source: PrdPrototypeSource) => void;
  onOpenPrototypeSource?: () => void;
  productPack: ProductPack;
  prototypeOptions?: PrototypeGenerationOptions;
  onChange?: (pack: ProductPack) => void;
}) {
  if (activeTab === "PRD") {
    return <PrdPreview productPack={productPack} onOpenPrototypeLink={onOpenPrototypeLink} />;
  }

  if (activeTab === "原型") {
    return (
      <div className="space-y-5">
        <StudioPrototypePreview
          activeViewport={activeViewport}
          activeMode={isEditing ? "修改" : "预览"}
          exportingFormat={prototypeExportingFormat}
          isEditing={isEditing}
          onExportHtml={onExportPrototypeHtml}
          onExportLiveArtifact={onExportPrototypeLiveArtifact}
          onSwitchMode={(mode) => {
            if (mode === "修改") onEditPrototypePrompt?.();
            if (mode === "源码") onOpenPrototypeSource?.();
          }}
          productPack={productPack}
          prototypeOptions={prototypeOptions}
          onChange={onChange}
        />
      </div>
    );
  }

  if (activeTab === "调研") {
    return <ResearchPreview productPack={productPack} />;
  }

  if (activeTab === "竞品") {
    return <DocumentPreview document={buildArtifactDocument("competitors", productPack)} />;
  }

  if (activeTab === "画像") {
    return <DocumentPreview document={buildArtifactDocument("personas", productPack)} />;
  }

  if (activeTab === "路线图") {
    return <DocumentPreview document={buildArtifactDocument("roadmap", productPack)} />;
  }

  return <SummaryPreview productPack={productPack} />;
}

const artifactParamByTab: Record<(typeof studioTabs)[number], string> = {
  PRD: "prd",
  原型: "prototype",
  调研: "research",
  竞品: "competitors",
  画像: "personas",
  路线图: "roadmap",
  总结: "summary",
};

const artifactIndexIdByTab: Record<(typeof studioTabs)[number], string> = {
  PRD: "prd",
  原型: "prototype",
  调研: "research",
  竞品: "competitors",
  画像: "personas",
  路线图: "roadmap",
  总结: "executive-summary",
};

const tabByArtifactParam: Record<string, (typeof studioTabs)[number]> = {
  prd: "PRD",
  prototype: "原型",
  research: "调研",
  competitors: "竞品",
  personas: "画像",
  roadmap: "路线图",
  summary: "总结",
  "executive-summary": "总结",
};

function getTabFromArtifactParam(artifact?: string) {
  if (!artifact) return "原型";

  return tabByArtifactParam[artifact] ?? "原型";
}

function getArtifactHref(tab: (typeof studioTabs)[number], activeViewport?: string) {
  const artifact = artifactParamByTab[tab];

  if (tab === "原型" && activeViewport) {
    return `/app?artifact=${artifact}&viewport=${activeViewport}`;
  }

  return `/app?artifact=${artifact}`;
}

function getExportActionLabel(format: ExportFormat, artifactId?: string) {
  if (artifactId === "prototype" && format === "json") return "导出 Live Artifact";

  const labels: Record<ExportFormat, string> = {
    html: "导出 HTML",
    json: "导出 JSON",
    markdown: "导出 Markdown",
    pdf: "导出 PDF",
    pptx: "导出 PPTX",
  };

  return labels[format];
}

function getArtifactActions(tab: (typeof studioTabs)[number], productPack: ProductPack): ArtifactAction[] {
  const artifactId = artifactIndexIdByTab[tab];
  const artifact = productPack.artifactIndex.find((item) => item.id === artifactId);
  return (
    artifact?.exportFormats.map((format) => ({
      artifactId,
      format,
      label: getExportActionLabel(format, artifactId),
    })) ?? [
      {
        artifactId,
        format: "markdown" as const,
        label: "导出 Markdown",
      },
    ]
  );
}

function getWorkflowIdForTab(tab: (typeof studioTabs)[number]): WorkflowId {
  if (tab === "原型") return "prd-to-prototype-linker";
  if (tab === "总结") return "project-summarizer";

  return "idea-to-product-pack";
}

function getWorkflowLabelForTab(tab: (typeof studioTabs)[number]) {
  if (tab === "原型") return "PRD 到原型联动";
  if (tab === "总结") return "项目汇报摘要";

  return "完整产品方案包";
}

const demoPromptPresets: Array<{ label: string; prompt: string }> = [];

type StudioFileKind = "deck" | "html" | "json" | "markdown";

type StudioFile = {
  artifactId: string;
  description: string;
  editable: boolean;
  id: string;
  kind: StudioFileKind;
  name: string;
  section: "Artifacts" | "Prototype" | "Research" | "Workspace";
  tab: (typeof studioTabs)[number];
  updatedAt: string;
};

const fileIdByTab: Record<(typeof studioTabs)[number], string> = {
  PRD: "artifacts/PRD.md",
  原型: "prototype/index.html",
  调研: "research/market.md",
  竞品: "research/competitors.md",
  画像: "research/personas.md",
  路线图: "planning/roadmap.md",
  总结: "README.md",
};

function getFileIdForArtifact(artifact?: string, pack?: ProductPack) {
  if (!pack) return undefined;

  const tab = getTabFromArtifactParam(artifact);

  if (tab === "原型") {
    return `prototype/${getPrototypeScreenPath(pack, 0)}`;
  }

  return fileIdByTab[tab];
}

function getPrototypeStudioFileKind(path: string, mimeType: string): StudioFileKind {
  if (mimeType.includes("html") || path.endsWith(".html")) return "html";
  if (mimeType.includes("json") || path.endsWith(".json")) return "json";
  if (mimeType.includes("markdown") || path.endsWith(".md")) return "markdown";

  return "markdown";
}

function getStudioFiles(
  pack: ProductPack,
  prototypeOptions: PrototypeGenerationOptions = {},
): StudioFile[] {
  const prototypeBundle = buildPrototypeArtifactBundle(pack, prototypeOptions);
  const prototypeFiles: StudioFile[] = prototypeBundle.files.map((file) => ({
    artifactId: "prototype",
    description: file.purpose,
    editable: file.editable,
    id: `prototype/${file.path}`,
    kind: getPrototypeStudioFileKind(file.path, file.mimeType),
    name: file.name,
    section: "Prototype",
    tab: "原型",
    updatedAt: pack.generatedAt,
  }));

  return [
    {
      artifactId: "product-pack",
      description: pack.project.oneLiner,
      editable: true,
      id: "README.md",
      kind: "markdown",
      name: "README.md",
      section: "Workspace",
      tab: "总结",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "prd",
      description: pack.prd.objective,
      editable: true,
      id: "artifacts/PRD.md",
      kind: "markdown",
      name: "PRD.md",
      section: "Artifacts",
      tab: "PRD",
      updatedAt: pack.generatedAt,
    },
    ...prototypeFiles,
    {
      artifactId: "research",
      description: pack.research.marketOpportunity[0]?.detail ?? "Market opportunity notes.",
      editable: true,
      id: "research/market.md",
      kind: "markdown",
      name: "market.md",
      section: "Research",
      tab: "调研",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "competitors",
      description: "Competitor matrix and opportunity gaps.",
      editable: true,
      id: "research/competitors.md",
      kind: "markdown",
      name: "competitors.md",
      section: "Research",
      tab: "竞品",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "personas",
      description: "Primary personas, goals, and pains.",
      editable: true,
      id: "research/personas.md",
      kind: "markdown",
      name: "personas.md",
      section: "Research",
      tab: "画像",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "roadmap",
      description: "MVP, next, and later delivery plan.",
      editable: true,
      id: "planning/roadmap.md",
      kind: "markdown",
      name: "roadmap.md",
      section: "Artifacts",
      tab: "路线图",
      updatedAt: pack.generatedAt,
    },
    {
      artifactId: "executive-summary",
      description: pack.summary.headline,
      editable: true,
      id: "planning/executive-summary.md",
      kind: "markdown",
      name: "executive-summary.md",
      section: "Artifacts",
      tab: "总结",
      updatedAt: pack.generatedAt,
    },
  ];
}

function formatFileTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "just now";

  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fileKindLabel(kind: StudioFileKind) {
  const labels: Record<StudioFileKind, string> = {
    deck: "Deck",
    html: "HTML",
    json: "JSON",
    markdown: "Markdown",
  };

  return labels[kind];
}

function StudioFileIcon({ file }: { file: StudioFile }) {
  if (file.kind === "html") return <FileCode2 className="h-4 w-4" />;
  if (file.kind === "json") return <FileJson className="h-4 w-4" />;
  if (file.kind === "deck") return <Presentation className="h-4 w-4" />;

  return <FileText className="h-4 w-4" />;
}

function renderStudioFileSource(
  file: StudioFile,
  pack: ProductPack,
  prototypeOptions: PrototypeGenerationOptions = {},
) {
  if (file.artifactId === "prototype") {
    return renderPrototypeFile(file.id, pack, prototypeOptions, false);
  }

  return renderArtifactMarkdown(file.artifactId, pack);
}

function getRunModeLabel(mode?: AgentRunMode) {
  const labels: Record<AgentRunMode, string> = {
    "api-fallback-dry-run": "API dry-run",
    "claude-cli": "Claude CLI",
    "claude-dry-run": "Claude dry-run",
    "codex-cli": "Codex CLI",
    "codex-dry-run": "Codex dry-run",
    mock: "Mock provider",
  };

  return mode ? labels[mode] : "Mock provider";
}

function getProviderLabel(providerId: AgentProviderId) {
  const labels: Record<AgentProviderId, string> = {
    "api-fallback": "API fallback",
    "claude-code": "Claude Code",
    codex: "Codex",
    mock: "Mock",
  };

  return labels[providerId];
}

function downloadBrowserFile({
  body,
  filename,
  type,
}: {
  body: BlobPart;
  filename: string;
  type: string;
}) {
  const blob = new Blob([body], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function buildCodexHandoffMarkdown(
  pack: ProductPack,
  activeTab: (typeof studioTabs)[number],
) {
  return [
    `# ${pack.project.title} Codex Handoff`,
    "",
    "## Goal",
    "",
    "Continue this PM Studio product pack without changing the provider-neutral artifact contract.",
    "",
    "## Source Idea",
    "",
    pack.sourceIdea,
    "",
    "## Product Context",
    "",
    `- One-liner: ${pack.project.oneLiner}`,
    `- Positioning: ${pack.project.positioning}`,
    `- Value proposition: ${pack.project.valueProposition}`,
    "",
    "## Active Artifact",
    "",
    `- Tab: ${activeTab}`,
    `- Artifact id: ${artifactIndexIdByTab[activeTab]}`,
    "",
    "## PRD Objective",
    "",
    pack.prd.objective,
    "",
    "## Prototype Prompt",
    "",
    pack.prototype.openDesignPrompt,
    "",
    "## Next Actions",
    "",
    ...pack.summary.nextActions.map((item) => `- ${item}`),
    "",
    "## Product Pack JSON",
    "",
    "```json",
    JSON.stringify(pack, null, 2),
    "```",
  ].join("\n");
}

function buildOpenDesignHandoffJson(pack: ProductPack) {
  const prototypeArtifactBundle = buildPrototypeArtifactBundle(pack);

  return JSON.stringify(
    {
      schemaVersion: "pmstudio-opendesign-handoff.v1",
      source: {
        product: "PM Studio",
        productPackId: pack.id,
        generatedAt: pack.generatedAt,
      },
      intent:
        "Use OpenDesign-style Studio Shell, Artifact Canvas, and iframe preview patterns to continue this prototype artifact.",
      liveArtifact: {
        ...pack.prototype.liveArtifact,
        files: prototypeArtifactBundle.files.map((file) => ({
          path: file.path,
          mimeType: file.mimeType,
          purpose: file.purpose,
        })),
      },
      prototypeArtifactBundle,
      prompt: pack.prototype.openDesignPrompt,
      product: pack.project,
      prd: {
        objective: pack.prd.objective,
        coreFeatures: pack.prd.coreFeatures,
        mvpScope: pack.prd.mvpScope,
        successMetrics: pack.prd.successMetrics,
      },
      prototype: {
        userFlow: pack.prototype.userFlow,
        screens: pack.prototype.screens,
        prdLinks: pack.prototype.prdLinks,
      },
      exportHint:
        "Call /api/export with artifact=prototype&format=json to download index.html, screens/*.html, data.json, design-manifest.json, and DESIGN-HANDOFF.md bodies.",
    },
    null,
    2,
  );
}

function DesignFilesWorkspace({
  activeFileId,
  files,
  openFileIds,
  onOpenFile,
}: {
  activeFileId: string;
  files: StudioFile[];
  openFileIds: string[];
  onOpenFile: (fileId: string) => void;
}) {
  const sections: StudioFile["section"][] = ["Workspace", "Artifacts", "Prototype", "Research"];

  return (
    <div className="flex min-h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <div className="border-b border-black/10 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
              <FolderOpen className="h-4 w-4 text-[#12a7ff]" />
              设计文件
            </div>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              打开文件后在 tabs 中编辑、预览和导出，Product Pack 会保持同步。
            </p>
          </div>
          <span className="rounded-lg border border-black/10 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-500">
            {files.length} files
          </span>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {sections.map((section) => {
          const sectionFiles = files.filter((file) => file.section === section);

          if (!sectionFiles.length) return null;

          return (
            <section className="mb-5" key={section}>
              <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-semibold uppercase text-neutral-400">
                <span>{section}</span>
                <span>{sectionFiles.length}</span>
              </div>
              <div className="space-y-1">
                {sectionFiles.map((file) => {
                  const active = file.id === activeFileId;
                  const open = openFileIds.includes(file.id);

                  return (
                    <button
                      className={cn(
                        "group grid w-full grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                        active
                          ? "bg-neutral-950 text-white shadow-sm"
                          : "text-neutral-700 hover:bg-neutral-100",
                      )}
                      key={file.id}
                      onClick={() => onOpenFile(file.id)}
                      type="button"
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-md",
                            active ? "bg-white/12 text-white" : "bg-neutral-100 text-neutral-500",
                          )}
                        >
                        <StudioFileIcon file={file} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{file.name}</span>
                        <span
                          className={cn(
                            "mt-0.5 block truncate text-[11px]",
                            active ? "text-white/58" : "text-neutral-400",
                          )}
                        >
                          {fileKindLabel(file.kind)} · {formatFileTime(file.updatedAt)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          open ? "bg-emerald-400" : "bg-transparent group-hover:bg-neutral-300",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function OpenFileTabs({
  activeTabId,
  files,
  onCloseFile,
  onOpenDesignFiles,
  onOpenFile,
}: {
  activeTabId: WorkspaceTabId;
  files: StudioFile[];
  onCloseFile: (fileId: string) => void;
  onOpenDesignFiles: () => void;
  onOpenFile: (fileId: string) => void;
}) {
  return (
    <div className="flex min-w-0 items-end gap-1 overflow-x-auto border-b border-black/10 bg-[#f5f5f1]/78 px-2 pt-2">
      <div
        className={cn(
          "group flex h-9 min-w-[150px] max-w-[230px] items-center gap-2 rounded-t-lg border border-b-0 px-3 text-sm transition",
          activeTabId === designFilesTabId
            ? "border-black/10 bg-white text-neutral-950 shadow-sm"
            : "border-transparent bg-transparent text-neutral-500 hover:bg-white/70 hover:text-neutral-950",
        )}
      >
        <button
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={onOpenDesignFiles}
          type="button"
        >
          <FolderOpen className="h-4 w-4" />
          <span className="truncate">设计文件</span>
        </button>
      </div>
      {files.map((file) => {
        const active = file.id === activeTabId;

        return (
          <div
            className={cn(
              "group flex h-9 min-w-[148px] max-w-[230px] items-center gap-2 rounded-t-lg border border-b-0 px-3 text-sm transition",
              active
                ? "border-black/10 bg-white text-neutral-950 shadow-sm"
                : "border-transparent bg-transparent text-neutral-500 hover:bg-white/70 hover:text-neutral-950",
            )}
            key={file.id}
          >
            <button
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              onClick={() => onOpenFile(file.id)}
              type="button"
            >
              <StudioFileIcon file={file} />
              <span className="truncate">{file.name}</span>
            </button>
            {files.length > 1 ? (
              <button
                aria-label={`Close ${file.name}`}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-neutral-400 opacity-0 transition hover:bg-neutral-100 hover:text-neutral-950 group-hover:opacity-100"
                onClick={() => onCloseFile(file.id)}
                type="button"
              >
                ×
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function escapePreviewHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInlineMarkdown(value: string) {
  return escapePreviewHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function isMarkdownTableSeparator(line: string) {
  return /^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function renderMarkdownPreview(markdown: string) {
  const html: string[] = [];
  let listOpen = false;
  let tableOpen = false;

  const closeList = () => {
    if (!listOpen) return;
    html.push("</ul>");
    listOpen = false;
  };

  const closeTable = () => {
    if (!tableOpen) return;
    html.push("</tbody></table>");
    tableOpen = false;
  };

  markdown.split("\n").forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      closeTable();
      return;
    }

    if (isMarkdownTableSeparator(trimmed)) return;

    if (trimmed.startsWith("|")) {
      closeList();
      if (!tableOpen) {
        html.push("<table><tbody>");
        tableOpen = true;
      }
      const cells = trimmed
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => `<td>${renderInlineMarkdown(cell.trim())}</td>`)
        .join("");
      html.push(`<tr>${cells}</tr>`);
      return;
    }

    closeTable();

    if (trimmed.startsWith("- ")) {
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${renderInlineMarkdown(trimmed.slice(2))}</li>`);
      return;
    }

    closeList();

    if (trimmed.startsWith("### ")) {
      html.push(`<h3>${renderInlineMarkdown(trimmed.slice(4))}</h3>`);
      return;
    }

    if (trimmed.startsWith("## ")) {
      html.push(`<h2>${renderInlineMarkdown(trimmed.slice(3))}</h2>`);
      return;
    }

    if (trimmed.startsWith("# ")) {
      html.push(`<h1>${renderInlineMarkdown(trimmed.slice(2))}</h1>`);
      return;
    }

    if (trimmed.startsWith("> ")) {
      html.push(`<blockquote>${renderInlineMarkdown(trimmed.slice(2))}</blockquote>`);
      return;
    }

    html.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  });

  closeList();
  closeTable();

  return html.join("");
}

function SourceViewer({
  file,
  generatedValue,
  onChange,
  onReset,
  value,
}: {
  file: StudioFile;
  generatedValue: string;
  onChange: (value: string) => void;
  onReset: () => void;
  value: string;
}) {
  const isDirty = value !== generatedValue;

  if (file.kind === "markdown") {
    return (
      <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-950">{file.id}</p>
            <p className="mt-0.5 text-xs text-neutral-500">左侧编辑 Markdown，右侧实时预览；导出会优先使用当前编辑内容。</p>
          </div>
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="rounded-md bg-[#e8f6ff] px-2 py-1 text-[11px] font-medium text-[#0a70a8]">
                已编辑
              </span>
            ) : null}
            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isDirty}
              onClick={onReset}
              type="button"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              恢复生成版本
            </button>
          </div>
        </div>
        <div className="grid min-h-[640px] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="min-h-0 border-b border-black/10 bg-[#111111] lg:border-b-0 lg:border-r">
            <textarea
              className="h-full min-h-[640px] w-full resize-none bg-[#111111] p-4 font-mono text-xs leading-5 text-white/82 outline-none selection:bg-[#12a7ff]/35"
              onChange={(event) => onChange(event.target.value)}
              spellCheck={false}
              value={value}
            />
          </div>
          <article
            className="prose-preview min-h-[640px] overflow-auto bg-[#fbfaf7] p-6"
            dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(value) }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-[#111111] shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white/78">{file.id}</p>
          <p className="mt-0.5 text-[11px] text-white/38">可编辑源码，Markdown 导出会优先使用当前内容。</p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty ? (
            <span className="rounded-md border border-[#12a7ff]/30 bg-[#12a7ff]/10 px-2 py-1 text-[11px] text-[#94D8FF]">
              edited
            </span>
          ) : null}
          <button
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-white/10 px-2 text-[11px] text-white/55 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!isDirty}
            onClick={onReset}
            type="button"
          >
            <RefreshCw className="h-3 w-3" />
            Reset
          </button>
          <span className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-white/45">
            {fileKindLabel(file.kind)}
          </span>
        </div>
      </div>
      <textarea
        className="min-h-[560px] w-full resize-y bg-[#111111] p-4 font-mono text-xs leading-5 text-white/82 outline-none selection:bg-[#12a7ff]/35"
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        value={value}
      />
    </div>
  );
}

function FilePreviewSurface({
  activeMode,
  activeViewport,
  file,
  generatedSourceValue,
  prototypeExportingFormat,
  prototypeOptions,
  onOpenPrototypeFile,
  onOpenPrototypeLink,
  onChange,
  onExportAction,
  onResetSource,
  onSourceChange,
  onSwitchMode,
  productPack,
  sourceValue,
}: {
  activeMode: "生成" | "修改" | "源码" | "预览";
  activeViewport?: string;
  file: StudioFile;
  generatedSourceValue: string;
  prototypeExportingFormat?: "html" | "json" | null;
  prototypeOptions: PrototypeGenerationOptions;
  onOpenPrototypeFile: (path: string) => void;
  onOpenPrototypeLink: (source: PrdPrototypeSource) => void;
  onChange: (productPack: ProductPack) => void;
  onExportAction: (action: ArtifactAction) => void;
  onResetSource: () => void;
  onSourceChange: (value: string) => void;
  onSwitchMode: (mode: "生成" | "修改" | "源码" | "预览") => void;
  productPack: ProductPack;
  sourceValue: string;
}) {
  if (file.artifactId === "prototype" && file.kind === "html") {
    const prototypeMode = activeMode === "生成" ? "预览" : activeMode;
    const previewHtml = sourceValue;

    return (
      <StudioPrototypePreview
        activeMode={prototypeMode}
        activeViewport={activeViewport}
        exportingFormat={prototypeExportingFormat}
        onChange={onChange}
        onExportHtml={() =>
          onExportAction({
            artifactId: "prototype",
            format: "html",
            label: "导出 HTML",
          })
        }
        onExportLiveArtifact={() =>
          onExportAction({
            artifactId: "prototype",
            format: "json",
            label: "导出 Live Artifact",
          })
        }
        onOpenPrototypeFile={onOpenPrototypeFile}
        onSourceChange={onSourceChange}
        onSwitchMode={onSwitchMode}
        previewHtml={previewHtml}
        productPack={productPack}
        prototypeOptions={prototypeOptions}
        sourceCode={sourceValue}
        viewerSubtitle={file.description}
        viewerTitle={file.id}
      />
    );
  }

  if (activeMode === "源码" || file.artifactId === "prototype") {
    return (
      <SourceViewer
        file={file}
        generatedValue={generatedSourceValue}
        onChange={onSourceChange}
        onReset={onResetSource}
        value={sourceValue}
      />
    );
  }

  return (
    <ArtifactView
      activeTab={file.tab}
      activeViewport={activeViewport}
      prototypeExportingFormat={prototypeExportingFormat}
      isEditing={activeMode === "修改"}
      onEditPrototypePrompt={() => onSwitchMode("修改")}
      onExportPrototypeHtml={() =>
        onExportAction({
          artifactId: "prototype",
          format: "html",
          label: "导出 HTML",
        })
      }
      onExportPrototypeLiveArtifact={() =>
        onExportAction({
          artifactId: "prototype",
          format: "json",
          label: "导出 Live Artifact",
        })
      }
      onOpenPrototypeSource={() => onSwitchMode("源码")}
      onOpenPrototypeLink={onOpenPrototypeLink}
      productPack={productPack}
      prototypeOptions={prototypeOptions}
      onChange={onChange}
    />
  );
}

function AgentConversationPane({
  activeTab,
  agentEvents,
  currentPack,
  demoPrompts,
  intakeAudience,
  intakeConstraints,
  intakeOutcome,
  isGenerating,
  lastRunMode,
  onGenerate,
  onPromptChange,
  onPrototypeKindChange,
  onPrototypeTemplateChange,
  onSelectPreset,
  prompt,
  prototypeKind,
  prototypeTemplateId,
  providerId,
  runError,
  runHistory,
  runInputRef,
  setIntakeAudience,
  setIntakeConstraints,
  setIntakeOutcome,
  workflowDefinition,
}: {
  activeTab: (typeof studioTabs)[number];
  agentEvents?: HarnessEvent[];
  currentPack?: ProductPack;
  demoPrompts: typeof demoPromptPresets;
  intakeAudience: string;
  intakeConstraints: string;
  intakeOutcome: string;
  isGenerating: boolean;
  lastRunMode: AgentRunMode;
  onGenerate: (event: React.FormEvent<HTMLFormElement>) => void;
  onPromptChange: (value: string) => void;
  onPrototypeKindChange: (value: PrototypeKind | "auto") => void;
  onPrototypeTemplateChange: (value: PrototypeTemplateId) => void;
  onSelectPreset: (prompt: string) => void;
  prompt: string;
  prototypeKind: PrototypeKind | "auto";
  prototypeTemplateId: PrototypeTemplateId;
  providerId: AgentProviderId;
  runError: string | null;
  runHistory: AgentRunHistoryItem[];
  runInputRef: React.RefObject<HTMLTextAreaElement | null>;
  setIntakeAudience: (value: string) => void;
  setIntakeConstraints: (value: string) => void;
  setIntakeOutcome: (value: string) => void;
  workflowDefinition?: WorkflowDefinition;
}) {
  const [briefOpen, setBriefOpen] = useState(false);
  const workflowName = workflowDefinition?.name ?? getWorkflowLabelForTab(activeTab);
  const workflowDescription =
    workflowDefinition?.description ?? "输出会落到中间的文档文件和原型文件。";
  const enabledSteps = workflowDefinition?.steps.filter((step) => step.enabled) ?? [];

  return (
    <aside className="flex min-h-0 min-w-0 flex-col border-r border-black/10 bg-white">
      <div className="border-b border-black/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-emerald-600" />
          <p className="truncate text-sm font-semibold text-neutral-950">
            {currentPack?.project.title ?? "Agent 工作区"}
          </p>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          {getProviderLabel(providerId)} · {getRunModeLabel(lastRunMode)}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="mb-3 rounded-xl border border-black/10 bg-neutral-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-neutral-500">当前工作流</p>
            {enabledSteps.length ? (
              <span className="rounded-md bg-white px-2 py-0.5 text-[11px] text-neutral-500">
                {enabledSteps.length} steps
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-medium text-neutral-950">{workflowName}</p>
          <p className="mt-1 text-[11px] leading-5 text-neutral-500">
            {workflowDescription}
          </p>
          {enabledSteps.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {enabledSteps.slice(0, 5).map((step) => (
                <span
                  className="rounded-md border border-black/10 bg-white px-1.5 py-0.5 text-[10px] text-neutral-500"
                  key={step.id}
                >
                  {step.title}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <section className="mb-3 rounded-xl border border-black/10 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-neutral-500">原型生成流程</p>
            <span className="rounded-md bg-[#e8f6ff] px-2 py-0.5 text-[11px] text-[#0a70a8]">
              {"Brief -> Template -> Files"}
            </span>
          </div>
          <div className="grid gap-2">
            <label className="grid gap-1">
              <span className="text-[11px] font-medium text-neutral-500">原型类型</span>
              <select
                className="h-8 rounded-lg border border-black/10 bg-neutral-50 px-2 text-xs font-medium text-neutral-700 outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                onChange={(event) => onPrototypeKindChange(event.target.value as PrototypeKind | "auto")}
                value={prototypeKind}
              >
                {prototypeKindOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] font-medium text-neutral-500">设计模板</span>
              <select
                className="h-8 rounded-lg border border-black/10 bg-neutral-50 px-2 text-xs font-medium text-neutral-700 outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                onChange={(event) => onPrototypeTemplateChange(event.target.value as PrototypeTemplateId)}
                value={prototypeTemplateId}
              >
                {prototypeTemplateOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-neutral-500">
            生成会产出 index launcher、独立 screen HTML、data、manifest 和 handoff，而不是复用同一张业务工作台页面。
          </p>
        </section>

        {currentPack ? (
          <AgentPanel
            events={agentEvents}
            productPack={currentPack}
            runHistory={runHistory}
            variant="floating"
          />
        ) : (
          <section className="rounded-xl border border-dashed border-black/10 bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <Sparkles className="h-3.5 w-3.5 text-[#12a7ff]" />
              等待 agent 生成
            </div>
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              当前没有 Product Pack、文件、原型或 mock artifact。输入产品想法后，agent 会生成真实可打开的文件。
            </p>
          </section>
        )}

        {currentPack ? (
          <section className="mt-3 rounded-xl border border-black/10 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-neutral-500">本轮产出文件</p>
            <span className="text-[11px] text-neutral-400">{currentPack.artifactIndex.length} 个</span>
          </div>
          <div className="space-y-1.5">
            {currentPack.artifactIndex.slice(0, 5).map((artifact) => (
              <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-2 py-1.5" key={artifact.id}>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="min-w-0 flex-1 truncate text-xs text-neutral-700">{artifact.title}</span>
                <span className="text-[10px] uppercase text-neutral-400">{artifact.status}</span>
              </div>
            ))}
          </div>
        </section>
        ) : null}
      </div>

      <form className="border-t border-black/10 bg-white p-3" onSubmit={onGenerate}>
        <div className="rounded-2xl border border-black/10 bg-[#fbfaf7] p-2 shadow-sm">
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto pb-2">
            {demoPrompts.map((preset) => (
              <button
                className="h-7 shrink-0 rounded-md border border-black/10 bg-white px-2 text-[11px] font-medium text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isGenerating}
                key={preset.label}
                onClick={() => onSelectPreset(preset.prompt)}
                type="button"
              >
                {preset.label}
              </button>
            ))}
            <button
              aria-expanded={briefOpen}
              className={cn(
                "ml-auto inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border px-2 text-[11px] font-medium transition",
                briefOpen
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-black/10 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950",
              )}
              onClick={() => setBriefOpen((value) => !value)}
              type="button"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Brief
            </button>
          </div>

          {briefOpen ? (
            <div className="mb-2 grid gap-2 rounded-xl border border-black/10 bg-white p-2">
              <input
                className="h-8 rounded-lg border border-black/10 bg-neutral-50 px-2 text-xs outline-none placeholder:text-neutral-400 focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                disabled={isGenerating}
                onChange={(event) => setIntakeAudience(event.target.value)}
                placeholder="目标用户"
                value={intakeAudience}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="h-8 min-w-0 rounded-lg border border-black/10 bg-neutral-50 px-2 text-xs outline-none placeholder:text-neutral-400 focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                  disabled={isGenerating}
                  onChange={(event) => setIntakeOutcome(event.target.value)}
                  placeholder="成功结果"
                  value={intakeOutcome}
                />
                <input
                  className="h-8 min-w-0 rounded-lg border border-black/10 bg-neutral-50 px-2 text-xs outline-none placeholder:text-neutral-400 focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                  disabled={isGenerating}
                  onChange={(event) => setIntakeConstraints(event.target.value)}
                  placeholder="约束条件"
                  value={intakeConstraints}
                />
              </div>
            </div>
          ) : null}

          <textarea
            className="max-h-36 min-h-20 w-full resize-none bg-transparent px-1 py-1 text-sm leading-6 outline-none placeholder:text-neutral-400"
            disabled={isGenerating}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder="描述你想生成的产品方案..."
            ref={runInputRef}
            rows={3}
            value={prompt}
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate rounded-md bg-white px-2 py-1 text-[11px] font-medium text-neutral-500">
              <Sparkles className="h-3.5 w-3.5 text-[#12a7ff]" />
              <span className="truncate">{workflowName}</span>
            </span>
            <button
              aria-label="运行当前 PM 工作流"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-950 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-400"
              disabled={isGenerating}
              type="submit"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {runError ? <p className="mt-2 text-xs font-medium text-red-600">{runError}</p> : null}
      </form>
    </aside>
  );
}

function EmptyArtifactWorkspace({
  isGenerating,
  onFocusRunInput,
}: {
  isGenerating: boolean;
  onFocusRunInput: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-[#fbfaf7] p-6">
      <div className="w-full max-w-md rounded-xl border border-dashed border-black/12 bg-white/70 p-5 text-center shadow-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-950 text-white">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCode2 className="h-4 w-4" />}
        </div>
        <p className="mt-3 text-sm font-semibold text-neutral-950">
          {isGenerating ? "Agent 正在生成文件" : "还没有生成任何 artifact"}
        </p>
        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Product Pack、PRD、prototype screen、manifest 和 handoff 会在运行 agent 后出现在这里。
        </p>
        <button
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-950 px-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-400"
          disabled={isGenerating}
          onClick={onFocusRunInput}
          type="button"
        >
          <Sparkles className="h-4 w-4" />
          聚焦输入
        </button>
      </div>
    </div>
  );
}

function FileInspector({
  activeMode,
  agentEvents,
  collapsed,
  file,
  onToggleCollapsed,
  productPack,
  runHistory,
}: {
  activeMode: "生成" | "修改" | "源码" | "预览";
  agentEvents?: HarnessEvent[];
  collapsed: boolean;
  file: StudioFile;
  onToggleCollapsed: () => void;
  productPack: ProductPack;
  runHistory: AgentRunHistoryItem[];
}) {
  const artifact = productPack.artifactIndex.find((item) => item.id === file.artifactId);
  const document = buildArtifactDocument(file.artifactId, productPack);

  if (collapsed) {
    return (
      <aside className="hidden h-full min-h-0 flex-col items-center border-l border-black/10 bg-white/82 py-3 xl:flex">
        <button
          aria-label="展开上下文面板"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
          onClick={onToggleCollapsed}
          type="button"
        >
          <PanelRightOpen className="h-4 w-4" />
        </button>
        <div className="mt-4 flex flex-col gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
            <Bot className="h-4 w-4" />
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
            <FileText className="h-4 w-4" />
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
            <Clock3 className="h-4 w-4" />
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden h-full min-h-0 flex-col border-l border-black/10 bg-white/76 xl:flex">
      <div className="border-b border-black/10 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-950">上下文抽屉</p>
            <p className="mt-1 truncate text-xs text-neutral-500">{file.name} · {activeMode}</p>
          </div>
          <button
            aria-label="收起上下文面板"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/10 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
            onClick={onToggleCollapsed}
            type="button"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <section className="mb-4 rounded-xl border border-black/10 bg-white p-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-950">
            <StudioFileIcon file={file} />
            当前文件
          </div>
          <dl className="space-y-2 text-xs leading-5">
            <div>
              <dt className="font-semibold text-neutral-500">路径</dt>
              <dd className="mt-0.5 break-all text-neutral-700">{file.id}</dd>
            </div>
            <div>
              <dt className="font-semibold text-neutral-500">文档来源</dt>
              <dd className="mt-0.5 text-neutral-700">{document.sourceSkill}</dd>
            </div>
            <div>
              <dt className="font-semibold text-neutral-500">导出格式</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {(artifact?.exportFormats ?? []).map((format) => (
                  <span className="rounded-md border border-black/10 bg-neutral-50 px-2 py-1 text-neutral-600" key={format}>
                    {format.toUpperCase()}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mb-4 rounded-xl border border-black/10 bg-neutral-50 p-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-950">
            <GitBranchPlus className="h-4 w-4 text-[#12a7ff]" />
            PRD 到原型映射
          </div>
          <div className="space-y-2">
            {productPack.prototype.prdLinks.map((link) => (
              <div className="rounded-lg border border-black/10 bg-white p-3" key={link.requirement}>
                <p className="text-xs font-semibold text-neutral-500">PRD 要点</p>
                <p className="mt-1 text-xs leading-5 text-neutral-700">{link.requirement}</p>
                <p className="mt-2 text-xs font-semibold text-neutral-500">Prototype screen / IA</p>
                <p className="mt-1 text-xs leading-5 text-neutral-950">{link.screen}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-black/10 pt-4">
          <AgentPanel
            events={agentEvents}
            productPack={productPack}
            runHistory={runHistory}
            variant="floating"
          />
        </div>
      </div>
    </aside>
  );
}

function getSourceLabel(source: PrdPrototypeSource["source"]) {
  if (source === "core-feature") return "核心功能";
  if (source === "mvp-scope") return "MVP 范围";
  return "用户故事";
}

function makePrototypeScreenFromRequirement(requirement: string, index: number) {
  const compact = requirement
    .replace(/^作为.+?，我想/, "")
    .replace(/[。.!！?？]/g, "")
    .trim();
  const name = compact.length > 10 ? `${compact.slice(0, 10)}页` : `${compact || `需求 ${index + 1}`}页`;

  return {
    name,
    goal: `围绕“${requirement}”提供可执行的页面路径、输入状态和结果反馈。`,
    primaryAction: "确认并生成下一步",
    components: ["需求摘要", "关键输入", "AI 建议", "结果预览", "确认操作"],
  };
}

function mergeFlowStep(flow: string, screenName: string) {
  const steps = flow
    .split(" -> ")
    .map((step) => step.trim())
    .filter(Boolean);

  if (steps.includes(screenName)) return flow;

  return [...steps, screenName].join(" -> ");
}

function modeDescription(
  mode: "create" | "update" | "link",
  targetScreenName?: string,
  suggestedScreenName?: string,
) {
  if (mode === "create") return `新增 IA 节点：${suggestedScreenName ?? "新页面"}`;
  if (mode === "update") return `更新现有 IA 节点：${targetScreenName ?? "现有页面"}`;

  return `仅记录关联：${targetScreenName ?? suggestedScreenName ?? "待定页面"}`;
}

function PrdPrototypeLinkDialog({
  onApply,
  onClose,
  productPack,
  source,
}: {
  onApply: (mode: "create" | "update" | "link") => void;
  onClose: () => void;
  productPack: ProductPack;
  source: PrdPrototypeSource;
}) {
  const suggestedScreen = makePrototypeScreenFromRequirement(source.requirement, source.index);
  const existingLink = productPack.prototype.prdLinks.find((link) => link.requirement === source.requirement);
  const targetScreen =
    productPack.prototype.screens.find((screen) => screen.name === existingLink?.screen) ??
    productPack.prototype.screens[0];
  const nextFlowForNewScreen = mergeFlowStep(productPack.prototype.userFlow, suggestedScreen.name);
  const nextFlowForTargetScreen = mergeFlowStep(
    productPack.prototype.userFlow,
    targetScreen?.name ?? suggestedScreen.name,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/30 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-black/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-neutral-400">PRD-to-Prototype</p>
            <h2 className="mt-1 text-lg font-semibold text-neutral-950">用 PRD 要点生成原型变更</h2>
          </div>
          <button
            aria-label="关闭"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/10 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[0.95fr_1.05fr_1fr]">
          <section className="border-b border-black/10 p-5 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold text-neutral-500">{getSourceLabel(source.source)}</p>
            <div className="mt-3 rounded-xl border border-black/10 bg-neutral-50 p-4">
              <p className="text-sm leading-7 text-neutral-800">{source.requirement}</p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-neutral-500">PRD 目标</p>
                <p className="mt-1 leading-6 text-neutral-700">{productPack.prd.objective}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500">成功指标</p>
                <ul className="mt-2 space-y-1.5">
                  {productPack.prd.successMetrics.slice(0, 3).map((metric) => (
                    <li className="flex gap-2 text-xs leading-5 text-neutral-600" key={metric}>
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="border-b border-black/10 p-5 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold text-neutral-500">生成方案</p>
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <p className="text-sm font-semibold text-neutral-950">{suggestedScreen.name}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{suggestedScreen.goal}</p>
              </div>
              <div className="rounded-xl border border-black/10 bg-neutral-50 p-4">
                <p className="text-xs font-semibold text-neutral-500">新增页面后的 User Flow</p>
                <p className="mt-2 text-sm leading-6 text-neutral-700">
                  {nextFlowForNewScreen}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <p className="text-xs font-semibold text-neutral-500">建议组件</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedScreen.components.map((component) => (
                    <span
                      className="rounded-md border border-black/10 bg-neutral-50 px-2 py-1 text-xs text-neutral-600"
                      key={component}
                    >
                      {component}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <p className="text-xs font-semibold text-neutral-500">IA 更新</p>
                <dl className="mt-3 space-y-2 text-xs leading-5">
                  <div className="grid grid-cols-[76px_1fr] gap-2">
                    <dt className="text-neutral-400">当前页面</dt>
                    <dd className="text-neutral-700">{productPack.prototype.screens.length} screens</dd>
                  </div>
                  <div className="grid grid-cols-[76px_1fr] gap-2">
                    <dt className="text-neutral-400">新增节点</dt>
                    <dd className="text-neutral-950">{suggestedScreen.name}</dd>
                  </div>
                  <div className="grid grid-cols-[76px_1fr] gap-2">
                    <dt className="text-neutral-400">更新节点</dt>
                    <dd className="text-neutral-950">{targetScreen?.name ?? "现有首屏"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <section className="p-5">
            <p className="text-xs font-semibold text-neutral-500">对照与影响预览</p>
            <div className="mt-3 space-y-3">
              <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-black/10">
                    <tr>
                      <th className="w-24 bg-neutral-50 px-3 py-2 font-semibold text-neutral-500">PRD</th>
                      <td className="px-3 py-2 leading-5 text-neutral-700">{source.requirement}</td>
                    </tr>
                    <tr>
                      <th className="bg-neutral-50 px-3 py-2 font-semibold text-neutral-500">Screen</th>
                      <td className="px-3 py-2 leading-5 text-neutral-700">{suggestedScreen.name}</td>
                    </tr>
                    <tr>
                      <th className="bg-neutral-50 px-3 py-2 font-semibold text-neutral-500">IA</th>
                      <td className="px-3 py-2 leading-5 text-neutral-700">
                        {modeDescription(existingLink ? "update" : "create", targetScreen?.name, suggestedScreen.name)}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-neutral-50 px-3 py-2 font-semibold text-neutral-500">Flow</th>
                      <td className="px-3 py-2 leading-5 text-neutral-700">{nextFlowForTargetScreen}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <GitBranchPlus className="h-4 w-4" />
                  新增页面
                </div>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  添加 `{suggestedScreen.name}`，并把它加入 prototype user flow。
                </p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                  <Pencil className="h-4 w-4" />
                  更新现有页面
                </div>
                <p className="mt-2 text-sm leading-6 text-blue-800">
                  将 `{targetScreen?.name ?? productPack.prototype.screens[0]?.name}` 的目标和组件补充为当前需求。
                </p>
              </div>
              <div className="rounded-xl border border-black/10 bg-neutral-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                  <Link2 className="h-4 w-4" />
                  仅建立关联
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  不改页面，只新增 PRD link，用于后续评审和导出。
                </p>
              </div>
            </div>
          </section>
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-black/10 bg-neutral-50 px-5 py-4">
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
            onClick={() => onApply("link")}
            type="button"
          >
            <Link2 className="h-4 w-4" />
            仅建立关联
          </button>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-800 transition hover:bg-blue-100"
            onClick={() => onApply("update")}
            type="button"
          >
            <Pencil className="h-4 w-4" />
            更新现有页面
          </button>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-950 px-3 text-sm font-medium text-white transition hover:bg-black"
            onClick={() => onApply("create")}
            type="button"
          >
            <GitBranchPlus className="h-4 w-4" />
            生成新页面
          </button>
        </footer>
      </div>
    </div>
  );
}

export function ArtifactCanvas({
  activeArtifact,
  activeViewport,
  agentEvents,
  onAgentEventsChange,
  onProductPackChange,
  productPack,
  providerId = "mock",
  workflowDefinition,
}: {
  activeArtifact?: string;
  activeViewport?: string;
  agentEvents?: HarnessEvent[];
  onAgentEventsChange?: (events: HarnessEvent[]) => void;
  onProductPackChange?: (productPack: ProductPack) => void;
  productPack?: ProductPack;
  providerId?: AgentProviderId;
  workflowDefinition?: WorkflowDefinition;
}) {
  const initialPack = productPack;
  const requestedFileId = getFileIdForArtifact(activeArtifact, initialPack);
  const [activeMode, setActiveMode] = useState<"生成" | "修改" | "源码" | "预览">("预览");
  const [currentEvents, setCurrentEvents] = useState(agentEvents);
  const [currentPack, setCurrentPack] = useState<ProductPack | undefined>(initialPack);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportingAction, setExportingAction] = useState<string | null>(null);
  const [lastRunMode, setLastRunMode] = useState<AgentRunMode>("mock");
  const [runHistory, setRunHistory] = useState<AgentRunHistoryItem[]>([]);
  const [prompt, setPrompt] = useState(initialPack?.sourceIdea ?? "");
  const [intakeAudience, setIntakeAudience] = useState("");
  const [intakeOutcome, setIntakeOutcome] = useState("");
  const [intakeConstraints, setIntakeConstraints] = useState("");
  const [runError, setRunError] = useState<string | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | undefined>(requestedFileId);
  const [activeWorkspaceTabId, setActiveWorkspaceTabId] = useState<WorkspaceTabId>(
    requestedFileId ?? designFilesTabId,
  );
  const [openFileIds, setOpenFileIds] = useState<string[]>(requestedFileId ? [requestedFileId] : []);
  const [fileSourceDrafts, setFileSourceDrafts] = useState<Record<string, string>>({});
  const [contextCollapsed, setContextCollapsed] = useState(true);
  const [prototypeLinkSource, setPrototypeLinkSource] = useState<PrdPrototypeSource | null>(null);
  const [prototypeKind, setPrototypeKind] = useState<PrototypeKind | "auto">("auto");
  const [prototypeTemplateId, setPrototypeTemplateId] = useState<PrototypeTemplateId>("auto");
  const runInputRef = useRef<HTMLTextAreaElement>(null);
  const activeTabRef = useRef(getTabFromArtifactParam(activeArtifact));
  const currentPackRef = useRef<ProductPack | undefined>(currentPack);
  const prototypeOptions: PrototypeGenerationOptions = {
    designSystem: "PM Studio DESIGN.md",
    kind: prototypeKind,
    templateId: prototypeTemplateId,
  };
  const studioFiles = currentPack ? getStudioFiles(currentPack, prototypeOptions) : [];
  const activeFile = activeFileId
    ? studioFiles.find((file) => file.id === activeFileId) ?? studioFiles[0]
    : studioFiles[0];
  const openFiles = openFileIds
    .map((fileId) => studioFiles.find((file) => file.id === fileId))
    .filter((file): file is StudioFile => Boolean(file));
  const activeTab = activeFile?.tab ?? getTabFromArtifactParam(activeArtifact);
  const activeSourceDraftKey = currentPack && activeFile ? `${currentPack.id}:${activeFile.id}` : "";
  const generatedActiveSourceValue =
    currentPack && activeFile ? renderStudioFileSource(activeFile, currentPack, prototypeOptions) : "";
  const activeSourceValue =
    (activeSourceDraftKey ? fileSourceDrafts[activeSourceDraftKey] : undefined) ??
    generatedActiveSourceValue;
  const activeWorkflowDefinition =
    workflowDefinition ?? getPresetWorkflowDefinition(getWorkflowIdForTab(activeTab));
  const activeWorkflowId = activeWorkflowDefinition?.workflowId ?? getWorkflowIdForTab(activeTab);
  const projectTitle = currentPack?.project.title ?? "未生成项目";
  const artifactActions = currentPack ? getArtifactActions(activeTab, currentPack) : [];
  const availableModes =
    activeFile?.tab === "原型" ? (["预览", "修改", "源码"] as const) : (["预览", "源码"] as const);
  const useEmbeddedPrototypeToolbar = activeFile
    ? activeWorkspaceTabId !== designFilesTabId &&
      activeFile.artifactId === "prototype" &&
      activeFile.kind === "html"
    : false;
  const prototypeExportingFormat =
    exportingAction === "prototype:html" ? "html" : exportingAction === "prototype:json" ? "json" : null;

  const openStudioFile = useCallback((fileId: string) => {
    setOpenFileIds((currentFileIds) =>
      currentFileIds.includes(fileId) ? currentFileIds : [...currentFileIds, fileId],
    );
    if (!fileId.startsWith("prototype/")) {
      setActiveMode("预览");
      setContextCollapsed(true);
    }
    setActiveFileId(fileId);
    setActiveWorkspaceTabId(fileId);
  }, []);

  const openPrototypeFile = useCallback((path: string) => {
    const normalizedPath = path
      .trim()
      .replace(/^\.\/+/, "")
      .replace(/^\/+/, "")
      .replace(/^prototype\//, "");

    if (!normalizedPath) return;

    openStudioFile(`prototype/${normalizedPath}`);
  }, [openStudioFile]);

  const openDesignFiles = useCallback(() => {
    setActiveWorkspaceTabId(designFilesTabId);
  }, []);

  const clearPrototypeSourceDrafts = useCallback(() => {
    setFileSourceDrafts((drafts) =>
      Object.fromEntries(Object.entries(drafts).filter(([key]) => !key.includes(":prototype/"))),
    );
  }, []);

  function closeStudioFile(fileId: string) {
    setOpenFileIds((currentFileIds) => {
      if (currentFileIds.length <= 1) return currentFileIds;

      const nextFileIds = currentFileIds.filter((item) => item !== fileId);

      if (fileId === activeFileId) {
        const nextActiveFileId = nextFileIds[Math.max(0, currentFileIds.indexOf(fileId) - 1)] ?? nextFileIds[0];
        setActiveFileId(nextActiveFileId);
        setActiveWorkspaceTabId(nextActiveFileId ?? designFilesTabId);
      }

      return nextFileIds;
    });
  }

  useEffect(() => {
    activeTabRef.current = activeTab;
    currentPackRef.current = currentPack;
  }, [activeTab, currentPack]);

  useEffect(() => {
    if (!requestedFileId) return;

    const timeoutId = window.setTimeout(() => openStudioFile(requestedFileId), 0);

    return () => window.clearTimeout(timeoutId);
  }, [openStudioFile, requestedFileId]);

  useEffect(() => {
    if (productPack) return;

    let storedPack: ProductPack | null = null;
    let storedEvents: HarnessEvent[] | null = null;
    let storedRunHistory: AgentRunHistoryItem[] | null = null;

    try {
      const storedPackValue = window.localStorage.getItem(localProductPackStorageKey);
      const storedEventsValue = window.localStorage.getItem(localEventsStorageKey);
      const storedRunHistoryValue = window.localStorage.getItem(localRunHistoryStorageKey);

      if (storedPackValue) {
        const parsedPack: unknown = JSON.parse(storedPackValue);

        if (isProductPack(parsedPack)) {
          storedPack = parsedPack;
        }
      }

      if (storedEventsValue) {
        const parsedEvents: unknown = JSON.parse(storedEventsValue);

        if (isHarnessEventList(parsedEvents)) {
          storedEvents = parsedEvents;
        }
      }

      if (storedRunHistoryValue) {
        const parsedRunHistory: unknown = JSON.parse(storedRunHistoryValue);

        if (isRunHistoryList(parsedRunHistory)) {
          storedRunHistory = parsedRunHistory;
        }
      }
    } catch {
      window.localStorage.removeItem(localProductPackStorageKey);
      window.localStorage.removeItem(localEventsStorageKey);
      window.localStorage.removeItem(localRunHistoryStorageKey);
    }

    const timeoutId = window.setTimeout(() => {
      if (storedPack) {
        setCurrentPack(storedPack);
        setPrompt(storedPack.sourceIdea);
        const nextFileId = getFileIdForArtifact(activeArtifact, storedPack);

        if (nextFileId) {
          setActiveFileId(nextFileId);
          setActiveWorkspaceTabId(nextFileId);
          setOpenFileIds([nextFileId]);
        }
      }

      if (storedEvents) {
        setCurrentEvents(storedEvents);
      }

      if (storedRunHistory) {
        setRunHistory(storedRunHistory);
        setLastRunMode(storedRunHistory[0]?.runMode ?? "mock");
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeArtifact, productPack]);

  useEffect(() => {
    if (!productPack) return;

    const timeoutId = window.setTimeout(() => {
      setCurrentPack(productPack);
      setPrompt(productPack.sourceIdea);
      setCurrentEvents(agentEvents);
      const nextFileId = getFileIdForArtifact(activeArtifact, productPack);

      if (nextFileId) {
        setActiveFileId(nextFileId);
        setActiveWorkspaceTabId(nextFileId);
        setOpenFileIds([nextFileId]);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeArtifact, agentEvents, productPack]);

  useEffect(() => {
    if (!currentPack) return;

    window.localStorage.setItem(localProductPackStorageKey, JSON.stringify(currentPack));
    onProductPackChange?.(currentPack);
  }, [currentPack, onProductPackChange]);

  useEffect(() => {
    if (currentEvents?.length) {
      window.localStorage.setItem(localEventsStorageKey, JSON.stringify(currentEvents));
      onAgentEventsChange?.(currentEvents);
    }
  }, [currentEvents, onAgentEventsChange]);

  useEffect(() => {
    window.localStorage.setItem(localRunHistoryStorageKey, JSON.stringify(runHistory));
  }, [runHistory]);

  const handleHandoffAction = useCallback((action: ArtifactAction) => {
    const pack = currentPackRef.current;
    const tab = activeTabRef.current;

    if (!pack) {
      setRunError("当前没有可交接的 Product Pack。");
      return;
    }

    if (action.handoffTarget === "open-design") {
      downloadBrowserFile({
        body: buildOpenDesignHandoffJson(pack),
        filename: `${pack.id}-opendesign-handoff.json`,
        type: "application/json;charset=utf-8",
      });
      return;
    }

    if (action.handoffTarget === "codex") {
      downloadBrowserFile({
        body: buildCodexHandoffMarkdown(pack, tab),
        filename: `${pack.id}-codex-handoff.md`,
        type: "text/markdown;charset=utf-8",
      });
    }
  }, []);

  const handleExportAction = useCallback(async (action: ArtifactAction) => {
    if (action.handoffTarget) {
      handleHandoffAction(action);
      return;
    }

    if (!action.artifactId || !action.format) return;

    const pack = currentPackRef.current;
    const file = activeFile;

    if (!pack || !file) {
      setRunError("当前没有可导出的 artifact。");
      return;
    }

    const editedSource = fileSourceDrafts[`${pack.id}:${file.id}`];

    if (
      action.format === "markdown" &&
      action.artifactId === file.artifactId &&
      editedSource
    ) {
      downloadBrowserFile({
        body: editedSource,
        filename: `${pack.id}-${action.artifactId}.md`,
        type: "text/markdown;charset=utf-8",
      });
      return;
    }

    const actionKey = `${action.artifactId}:${action.format}`;
    setExportingAction(actionKey);
    setRunError(null);

    try {
      const response = await fetch("/api/export", {
        body: JSON.stringify({
          artifact: action.artifactId,
          format: action.format,
          productPack: pack,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? "Export failed");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filename =
        disposition?.match(/filename="([^"]+)"/)?.[1] ??
        `${pack.id}-${action.artifactId}.${action.format === "markdown" ? "md" : action.format}`;
      downloadBrowserFile({
        body: blob,
        filename,
        type: response.headers.get("Content-Type") ?? "application/octet-stream",
      });
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "导出失败");
    } finally {
      setExportingAction(null);
    }
  }, [activeFile, fileSourceDrafts, handleHandoffAction]);

  useEffect(() => {
    function focusRunInput() {
      setActiveMode("生成");
      window.setTimeout(() => {
        runInputRef.current?.focus();
        runInputRef.current?.select();
      }, 0);
    }

    function exportCurrentPack() {
      void handleExportAction({
        artifactId: "product-pack",
        format: "markdown",
        label: "导出 Markdown",
      });
    }

    window.addEventListener("pmstudio:focus-run-input", focusRunInput);
    window.addEventListener("pmstudio:export-current-pack", exportCurrentPack);

    return () => {
      window.removeEventListener("pmstudio:focus-run-input", focusRunInput);
      window.removeEventListener("pmstudio:export-current-pack", exportCurrentPack);
    };
  }, [handleExportAction]);

  function buildIntakeInput(baseInput: string) {
    const context = [
      intakeAudience.trim() ? `面向${intakeAudience.trim()}。` : "",
      intakeOutcome.trim() ? `帮助${intakeOutcome.trim()}。` : "",
      intakeConstraints.trim() ? `约束条件：${intakeConstraints.trim()}` : "",
    ].filter(Boolean);

    return [baseInput, ...context].join("\n");
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const baseInput = prompt.trim() || currentPack?.sourceIdea || "";

    if (!baseInput) {
      setRunError("请先描述你想生成的产品方案。");
      runInputRef.current?.focus();
      return;
    }

    const input = buildIntakeInput(baseInput);
    setIsGenerating(true);
    setRunError(null);

    try {
      const response = await fetch("/api/generate", {
        body: JSON.stringify({
          input,
          providerId,
          workflowDefinition: activeWorkflowDefinition,
          workflowId: activeWorkflowId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? "Generation failed");
      }

      const generated = (await response.json()) as GeneratedPack;
      setCurrentPack(generated.productPack);
      setCurrentEvents(generated.events);
      setLastRunMode(generated.runMode ?? "mock");
      setRunHistory((history) => [
        {
          createdAt: new Date().toISOString(),
          projectTitle: generated.productPack.project.title,
          providerId: generated.providerId ?? providerId,
          runId: generated.runId ?? `run-${Date.now()}`,
          runMode: generated.runMode ?? "mock",
          sourceIdea: generated.input,
          workflowId: generated.workflowId,
        },
        ...history,
      ].slice(0, 8));
      setPrompt(baseInput);
      setActiveMode("预览");
      const nextFileId = getFileIdForArtifact("prototype", generated.productPack);

      if (nextFileId) {
        setActiveFileId(nextFileId);
        setActiveWorkspaceTabId(nextFileId);
        setOpenFileIds([nextFileId]);
      }
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  }

  function applyPrototypeLink(mode: "create" | "update" | "link") {
    const packBeforeUpdate = currentPackRef.current;

    if (!prototypeLinkSource || !packBeforeUpdate) return;

    const source = prototypeLinkSource;
    setCurrentPack((pack) => {
      if (!pack) return pack;

      const suggestedScreen = makePrototypeScreenFromRequirement(source.requirement, source.index);
      const existingLink = pack.prototype.prdLinks.find((link) => link.requirement === source.requirement);
      const fallbackScreen = pack.prototype.screens[0];
      const targetScreenName = existingLink?.screen ?? fallbackScreen?.name ?? suggestedScreen.name;
      const linkScreenName = mode === "create" ? suggestedScreen.name : targetScreenName;
      const nextLink = {
        requirement: source.requirement,
        screen: linkScreenName,
        rationale:
          mode === "link"
            ? "该 PRD 要点已作为后续原型生成依据记录。"
            : `该 PRD 要点驱动 ${linkScreenName} 的页面目标、核心组件和用户路径。`,
      };
      const prdLinks = [
        ...pack.prototype.prdLinks.filter((link) => link.requirement !== source.requirement),
        nextLink,
      ];

      let screens = pack.prototype.screens;
      let userFlow = pack.prototype.userFlow;

      if (mode === "create") {
        screens = [...screens, suggestedScreen];
        userFlow = mergeFlowStep(userFlow, suggestedScreen.name);
      }

      if (mode === "update" && screens.length > 0) {
        screens = screens.map((screen) =>
          screen.name === targetScreenName
            ? {
                ...screen,
                goal: suggestedScreen.goal,
                components: Array.from(new Set([...screen.components, ...suggestedScreen.components])),
              }
            : screen,
        );
        userFlow = mergeFlowStep(userFlow, targetScreenName);
      }

      return {
        ...pack,
        prototype: {
          ...pack.prototype,
          prdLinks,
          screens,
          userFlow,
        },
      };
    });
    setPrototypeLinkSource(null);
    const nextFileId = getFileIdForArtifact("prototype", packBeforeUpdate);

    if (nextFileId) {
      openStudioFile(nextFileId);
    }
  }

  return (
    <section className="flex h-[calc(100vh-56px)] min-h-0 flex-col overflow-hidden bg-[#f5f5f1] text-[#111111]">
      <div
        className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[var(--workspace-grid)]"
        style={{
          ["--workspace-grid" as string]: currentPack && activeFile
            ? contextCollapsed
              ? "minmax(340px,400px) minmax(0,1fr) 52px"
              : "minmax(340px,400px) minmax(0,1fr) 320px"
            : "minmax(340px,400px) minmax(0,1fr)",
        }}
      >
        <AgentConversationPane
          activeTab={activeTab}
          agentEvents={currentEvents}
          currentPack={currentPack}
          demoPrompts={demoPromptPresets}
          intakeAudience={intakeAudience}
          intakeConstraints={intakeConstraints}
          intakeOutcome={intakeOutcome}
          isGenerating={isGenerating}
          lastRunMode={lastRunMode}
          onGenerate={handleGenerate}
          onPromptChange={setPrompt}
          onPrototypeKindChange={(value) => {
            setPrototypeKind(value);
            clearPrototypeSourceDrafts();
          }}
          onPrototypeTemplateChange={(value) => {
            setPrototypeTemplateId(value);
            clearPrototypeSourceDrafts();
          }}
          onSelectPreset={(presetPrompt) => {
            setPrompt(presetPrompt);
            setIntakeAudience("");
            setIntakeOutcome("");
            setIntakeConstraints("");
            setActiveMode("预览");
          }}
          prompt={prompt}
          prototypeKind={prototypeKind}
          prototypeTemplateId={prototypeTemplateId}
          providerId={providerId}
          runError={runError}
          runHistory={runHistory}
          runInputRef={runInputRef}
          setIntakeAudience={setIntakeAudience}
          setIntakeConstraints={setIntakeConstraints}
          setIntakeOutcome={setIntakeOutcome}
          workflowDefinition={activeWorkflowDefinition}
        />

        <main className="flex min-h-0 min-w-0 flex-col border-x border-black/10 bg-[#fbfaf7]">
          {currentPack && activeFile ? (
            <>
              <OpenFileTabs
                activeTabId={activeWorkspaceTabId}
                files={openFiles.length ? openFiles : [activeFile]}
                onCloseFile={closeStudioFile}
                onOpenDesignFiles={openDesignFiles}
                onOpenFile={openStudioFile}
              />

              <div className="flex min-h-0 flex-1 flex-col">
                {!useEmbeddedPrototypeToolbar ? (
                  <header className="flex flex-col gap-3 border-b border-black/10 bg-white px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                          {activeWorkspaceTabId === designFilesTabId ? (
                            <FolderOpen className="h-4 w-4" />
                          ) : (
                            <StudioFileIcon file={activeFile} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-950">
                            {activeWorkspaceTabId === designFilesTabId ? "设计文件" : activeFile.id}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-neutral-500">
                            {activeWorkspaceTabId === designFilesTabId
                              ? "浏览 Product Pack 产物，并打开为工作区文件。"
                              : activeFile.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label="选择文件"
                        className="h-9 min-w-[190px] rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-neutral-700 shadow-sm outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30 xl:hidden"
                        onChange={(event) => openStudioFile(event.target.value)}
                        value={activeFile.id}
                      >
                        {studioFiles.map((file) => (
                          <option key={file.id} value={file.id}>
                            {file.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex rounded-lg border border-black/10 bg-neutral-50 p-1">
                        {availableModes.map((mode) => (
                          <button
                            className={cn(
                              "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition",
                              activeMode === mode
                                ? "bg-white text-neutral-950 shadow-sm"
                                : "text-neutral-500 hover:text-neutral-950",
                            )}
                            key={mode}
                            onClick={() => setActiveMode(mode)}
                            type="button"
                          >
                            {mode === "预览" ? <Eye className="h-3.5 w-3.5" /> : null}
                            {mode === "修改" ? <Pencil className="h-3.5 w-3.5" /> : null}
                            {mode === "源码" ? <Braces className="h-3.5 w-3.5" /> : null}
                            {mode}
                          </button>
                        ))}
                      </div>

                      {activeWorkspaceTabId !== designFilesTabId ? (
                        <div className="flex flex-wrap gap-1">
                          {artifactActions.map((action, index) => (
                            <button
                              className={cn(
                                "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-medium shadow-sm transition",
                                index === artifactActions.length - 1
                                  ? "border-neutral-950 bg-neutral-950 text-white hover:bg-black"
                                  : "border-black/10 bg-white text-neutral-700 hover:bg-neutral-50",
                              )}
                              disabled={exportingAction === [action.artifactId, action.format].join(":")}
                              key={action.label}
                              onClick={() => handleExportAction(action)}
                              type="button"
                            >
                              <ActionIcon action={action} />
                              {exportingAction === [action.artifactId, action.format].join(":")
                                ? "导出中"
                                : action.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </header>
                ) : null}

                <div className="min-h-0 flex-1 overflow-auto p-4 xl:p-5">
                  {activeWorkspaceTabId === designFilesTabId ? (
                    <DesignFilesWorkspace
                      activeFileId={activeFile.id}
                      files={studioFiles}
                      openFileIds={openFileIds}
                      onOpenFile={openStudioFile}
                    />
                  ) : (
                    <FilePreviewSurface
                      activeMode={activeMode}
                      activeViewport={activeViewport}
                      file={activeFile}
                      generatedSourceValue={generatedActiveSourceValue}
                      prototypeExportingFormat={prototypeExportingFormat}
                      prototypeOptions={prototypeOptions}
                      onOpenPrototypeFile={openPrototypeFile}
                      onOpenPrototypeLink={setPrototypeLinkSource}
                      onChange={setCurrentPack}
                      onExportAction={handleExportAction}
                      onResetSource={() =>
                        setFileSourceDrafts((drafts) => {
                          const nextDrafts = { ...drafts };
                          delete nextDrafts[activeSourceDraftKey];
                          return nextDrafts;
                        })
                      }
                      onSourceChange={(value) => {
                        if (!activeSourceDraftKey) return;

                        setFileSourceDrafts((drafts) => ({
                          ...drafts,
                          [activeSourceDraftKey]: value,
                        }));
                      }}
                      onSwitchMode={setActiveMode}
                      productPack={currentPack}
                      sourceValue={activeSourceValue}
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <EmptyArtifactWorkspace
              isGenerating={isGenerating}
              onFocusRunInput={() => {
                setActiveMode("生成");
                window.setTimeout(() => runInputRef.current?.focus(), 0);
              }}
            />
          )}
        </main>

        {currentPack && activeFile ? (
          <FileInspector
            activeMode={activeMode}
            agentEvents={currentEvents}
            collapsed={contextCollapsed}
            file={activeFile}
            onToggleCollapsed={() => setContextCollapsed((value) => !value)}
            productPack={currentPack}
            runHistory={runHistory}
          />
        ) : null}
      </div>

      {prototypeLinkSource && currentPack ? (
        <PrdPrototypeLinkDialog
          onApply={applyPrototypeLink}
          onClose={() => setPrototypeLinkSource(null)}
          productPack={currentPack}
          source={prototypeLinkSource}
        />
      ) : null}
    </section>
  );
}
