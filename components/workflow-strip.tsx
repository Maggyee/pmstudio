import { ArrowRight } from "lucide-react";

export function WorkflowStrip({ steps }: { steps: string[] }) {
  return (
    <div className="liquid-card grid gap-3 rounded-[2rem] p-3 md:grid-cols-5">
      {steps.map((step, index) => (
        <div
          className="flex items-center gap-3 rounded-[1.35rem] border border-white/45 bg-white/42 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/72"
          key={step}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 text-xs font-semibold text-neutral-900 ring-1 ring-black/10">
            {index + 1}
          </span>
          <span className="min-w-0 text-sm font-medium text-neutral-800">{step}</span>
          {index < steps.length - 1 ? (
            <ArrowRight className="ml-auto hidden h-4 w-4 text-neutral-400 md:block" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
