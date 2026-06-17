import {
  ChevronDown,
  Download,
  FileText,
  GalleryVerticalEnd,
  Play,
  Share2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

import { ArtifactCanvas } from "@/components/studio/artifact-canvas";
import { StudioSidebar } from "@/components/studio/sidebar";
import { studioDesignSystems } from "@/lib/mock-data";
import type { HarnessEvent, HarnessWorkflow } from "@/lib/agent-harness";
import type { ProductPack } from "@/lib/product-pack";

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
  const projectTitle = productPack?.project.title ?? "FinSight 智能投研工作台";
  const workflowTitle = activeWorkflow?.title ?? "Idea-to-Product Pack";

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
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-black/8 bg-white/70 px-3 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              type="button"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">分享</span>
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-black/8 bg-white/70 px-3 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              type="button"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">导出</span>
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 text-sm font-medium text-white shadow-lg shadow-neutral-900/20 transition hover:-translate-y-0.5 hover:bg-black hover:shadow-xl hover:shadow-neutral-900/25"
              type="button"
            >
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">运行生成</span>
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#eeeeee] bg-white/72 lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <StudioSidebar activeWorkflow={activeWorkflow} productPack={productPack} />
          </div>
        </aside>

        <section className="min-w-0">
          <div className="border-b border-[#eeeeee] bg-white/70 px-4 py-3 lg:hidden">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-[#12a7ff]" />
              {projectTitle}
            </div>
          </div>
          <ArtifactCanvas
            activeArtifact={activeArtifact}
            activeViewport={activeViewport}
            agentEvents={agentEvents}
            productPack={productPack}
          />
        </section>
      </div>
    </main>
  );
}
