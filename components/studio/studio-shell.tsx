import {
  ChevronDown,
  Download,
  FileText,
  Play,
  Share2,
  SquareStack,
  Sparkles,
  Workflow,
  GalleryVerticalEnd,
} from "lucide-react";
import Image from "next/image";

import { ArtifactCanvas } from "@/components/studio/artifact-canvas";
import { StudioSidebar } from "@/components/studio/sidebar";
import {
  studioDesignSystems,
  studioTemplates,
  studioWorkflows,
} from "@/lib/mock-data";

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
      className="group inline-flex h-9 min-w-0 items-center gap-2 rounded-full border border-black/10 bg-white/68 px-3 text-left text-sm shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white"
      type="button"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition group-hover:bg-neutral-950 group-hover:text-white">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] leading-none text-neutral-400">{label}</span>
        <span className="mt-0.5 block max-w-[118px] truncate font-medium text-neutral-800 xl:max-w-[150px]">
          {value}
        </span>
      </span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
    </button>
  );
}

export function StudioShell() {
  return (
    <main className="min-h-screen text-[#191919]">
      <header className="relative z-40 border-b border-black/10 bg-[rgba(255,255,255,0.56)] backdrop-blur-2xl">
        <div className="flex h-14 items-center justify-between px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              alt="PM Studio"
              className="h-9 w-9 object-contain"
              height={36}
              src="/pm-studio-logo.png"
              width={36}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">PM Studio 工作台</p>
              <p className="text-xs text-[#808080]">AI 产品方案工作台</p>
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 px-3 lg:flex">
            <TopbarPicker
              icon={<SquareStack className="h-3.5 w-3.5" />}
              label="项目"
              value="FinSight 智能投研工作台"
            />
            <TopbarPicker
              icon={<Workflow className="h-3.5 w-3.5" />}
              label="工作流"
              value={studioWorkflows[0]}
            />
            <TopbarPicker
              icon={<Sparkles className="h-3.5 w-3.5" />}
              label="设计系统"
              value={studioDesignSystems[0]}
            />
            <TopbarPicker
              icon={<GalleryVerticalEnd className="h-3.5 w-3.5" />}
              label="模板"
              value={studioTemplates[0]}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/78 px-3 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              type="button"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">分享</span>
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/78 px-3 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              type="button"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">导出</span>
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[#191919] px-3 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black"
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
            <StudioSidebar />
          </div>
        </aside>

        <section className="min-w-0">
          <div className="border-b border-[#eeeeee] bg-white/70 px-4 py-3 lg:hidden">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-[#12a7ff]" />
              FinSight 智能投研工作台
            </div>
          </div>
          <ArtifactCanvas />
        </section>
      </div>
    </main>
  );
}
