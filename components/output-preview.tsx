import { CheckCircle2, CircleDashed, FileText, LineChart, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { competitors, prdSummary } from "@/lib/mock-data";

export function OutputPreview() {
  return (
    <Card className="overflow-hidden rounded-[2rem] text-black liquid-card-interactive">
      <div className="flex items-center justify-between border-b border-white/50 bg-white/42 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#fa3d1d]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffb005]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#34c759]" />
        </div>
        <Badge className="border-[#dddddd] bg-white text-[#6a6b6c]">方案输出</Badge>
      </div>
      <div className="grid gap-0 md:grid-cols-[1fr_0.85fr]">
        <div className="border-b border-white/50 p-5 md:border-b-0 md:border-r">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-[#808080]">已生成 PRD</p>
              <h3 className="font-semibold">{prdSummary.productName}</h3>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#6a6b6c]">
            {prdSummary.oneLiner}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {prdSummary.metrics.map((metric) => (
              <div className="rounded-2xl border border-white/55 bg-white/45 p-3 text-xs leading-5 text-[#4d4d4d] shadow-sm backdrop-blur" key={metric}>
                <CheckCircle2 className="mb-2 h-4 w-4 text-[#34c759]" />
                {metric}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <LineChart className="h-4 w-4 text-[#12a7ff]" />
            竞品扫描
          </div>
          <div className="space-y-2">
            {competitors.map((competitor) => (
              <div
                className="flex items-center justify-between rounded-2xl border border-white/55 bg-white/45 px-3 py-2 text-sm shadow-sm transition hover:-translate-y-0.5 hover:bg-white/70"
                key={competitor.name}
              >
                <span>{competitor.name}</span>
                <span className="text-xs text-[#808080]">{competitor.position}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.52)_58%,rgba(225,242,230,0.72)_100%)] p-4 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-[#166c13]" />
              用户画像
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#6a6b6c]">
              <CircleDashed className="h-4 w-4 animate-spin text-[#34c759]" />
              正在细化上市建议
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
