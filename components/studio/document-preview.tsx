import {
  CheckCircle2,
  FileText,
  GitBranchPlus,
  Rows3,
  ScrollText,
} from "lucide-react";

import type {
  PMDocument,
  PMDocumentBlock,
  PMDocumentSourceItem,
  PMDocumentTone,
} from "@/lib/pm-documents";
import { cn } from "@/lib/utils";

type PrototypeLinkSource = {
  index: number;
  requirement: string;
  source: PMDocumentSourceItem["source"];
};

const toneClasses: Record<PMDocumentTone, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-900",
  green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  neutral: "border-black/10 bg-neutral-50 text-neutral-800",
  orange: "border-orange-200 bg-orange-50 text-orange-900",
  red: "border-red-200 bg-red-50 text-red-900",
};

function DocumentBlock({
  block,
  onOpenPrototypeLink,
}: {
  block: PMDocumentBlock;
  onOpenPrototypeLink?: (source: PrototypeLinkSource) => void;
}) {
  if (block.type === "paragraph") {
    return <p className="text-sm leading-7 text-neutral-700">{block.text}</p>;
  }

  if (block.type === "list") {
    return (
      <ul className="space-y-2">
        {block.items.map((item) => (
          <li className="grid grid-cols-[18px_1fr] gap-2 text-sm leading-6 text-neutral-700" key={item}>
            <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "table") {
    return (
      <div className="max-w-full overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full min-w-0 table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 bg-neutral-50 text-left text-xs font-semibold text-neutral-500">
              {block.columns.map((column) => (
                <th className="break-words px-3 py-2" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr className="border-b border-black/5 last:border-0" key={`${row.join("-")}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    className={cn(
                      "break-words align-top px-3 py-3 leading-6 text-neutral-700",
                      cellIndex === 0 ? "font-medium text-neutral-950" : "",
                    )}
                    key={`${cell}-${cellIndex}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === "callout") {
    return (
      <div className={cn("rounded-xl border p-4", toneClasses[block.tone ?? "neutral"])}>
        <p className="text-sm font-semibold">{block.title}</p>
        <p className="mt-2 text-sm leading-6 opacity-85">{block.body}</p>
      </div>
    );
  }

  if (block.type === "source-list") {
    return (
      <div className="rounded-xl border border-black/10 bg-neutral-50 p-4">
        <div className="mb-3">
          <p className="text-sm font-semibold text-neutral-950">{block.title}</p>
          {block.description ? (
            <p className="mt-1 text-xs leading-5 text-neutral-500">{block.description}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          {block.items.map((item) => (
            <button
              className="group grid w-full grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-black/10 bg-white p-3 text-left transition hover:border-[#12a7ff]/45 hover:bg-[#f8fcff]"
              key={`${item.source}-${item.index}-${item.text}`}
              onClick={() =>
                onOpenPrototypeLink?.({
                  index: item.index,
                  requirement: item.text,
                  source: item.source,
                })
              }
              type="button"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-950 text-xs font-semibold text-white">
                {item.index + 1}
              </span>
              <span className="text-sm leading-6 text-neutral-700">{item.text}</span>
              <span className="mt-0.5 inline-flex h-7 items-center gap-1 rounded-md border border-black/10 bg-white px-2 text-[11px] font-medium text-neutral-500 transition group-hover:border-[#12a7ff]/45 group-hover:text-neutral-950">
                <GitBranchPlus className="h-3.5 w-3.5" />
                生成原型
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {block.phases.map((phase, index) => (
        <section className="rounded-xl border border-black/10 bg-neutral-50 p-4" key={phase.horizon}>
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-neutral-950">{phase.horizon}</h4>
            <span className="rounded-md bg-white px-2 py-1 text-[11px] text-neutral-500">
              Phase {index + 1}
            </span>
          </div>
          <p className="mt-3 text-xs font-semibold text-neutral-500">Outcome</p>
          <p className="mt-1 text-sm leading-6 text-neutral-700">{phase.outcome}</p>
          <p className="mt-3 text-xs font-semibold text-neutral-500">Metric</p>
          <p className="mt-1 text-sm leading-6 text-neutral-700">{phase.metric}</p>
          <ul className="mt-4 space-y-2">
            {phase.items.map((item) => (
              <li className="text-sm leading-6 text-neutral-700" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function DocumentPreview({
  document,
  onOpenPrototypeLink,
}: {
  document: PMDocument;
  onOpenPrototypeLink?: (source: PrototypeLinkSource) => void;
}) {
  return (
    <article className="mx-auto w-full min-w-0 max-w-[1120px] overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <header className="border-b border-black/10 bg-white px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-500">
              <FileText className="h-3.5 w-3.5" />
              {document.eyebrow}
            </div>
            <h1 className="mt-4 text-2xl font-semibold leading-tight text-neutral-950">
              {document.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">{document.subtitle}</p>
          </div>
          <div className="shrink-0 rounded-xl border border-black/10 bg-neutral-50 p-3 text-xs leading-5 text-neutral-500 lg:w-56">
            <div className="flex items-center gap-2 font-semibold text-neutral-700">
              <ScrollText className="h-3.5 w-3.5" />
              文档来源
            </div>
            <p className="mt-2">{document.sourceSkill}</p>
            <p className="mt-1">{new Date(document.generatedAt).toLocaleString("zh-CN")}</p>
          </div>
        </div>
      </header>

      <div className="grid min-w-0 lg:grid-cols-[190px_minmax(0,1fr)]">
        <aside className="border-b border-black/10 bg-neutral-50 p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <Rows3 className="h-3.5 w-3.5" />
            Outline
          </div>
          <nav className="space-y-1">
            {document.sections.map((section) => (
              <a
                className="block rounded-md px-2 py-1.5 text-xs leading-5 text-neutral-600 transition hover:bg-white hover:text-neutral-950"
                href={`#${section.id}`}
                key={section.id}
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-8 p-5 sm:p-6">
          {document.sections.map((section) => (
            <section className="min-w-0 scroll-mt-20" id={section.id} key={section.id}>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-neutral-950">{section.title}</h2>
                {section.description ? (
                  <p className="mt-1 text-sm leading-6 text-neutral-500">{section.description}</p>
                ) : null}
              </div>
              <div className="space-y-4">
                {section.blocks.map((block, index) => (
                  <DocumentBlock
                    block={block}
                    key={`${section.id}-${block.type}-${index}`}
                    onOpenPrototypeLink={onOpenPrototypeLink}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
