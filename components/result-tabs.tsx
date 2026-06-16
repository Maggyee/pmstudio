import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PrototypePreview } from "@/components/prototype-preview";
import {
  competitors,
  marketResearch,
  personas,
  prdSections,
  prdSummary,
} from "@/lib/mock-data";

export function ResultTabs() {
  return (
    <Tabs
      defaultValue="prd"
      tabs={[
        {
          id: "prd",
          label: "PRD",
          content: (
            <Card>
              <CardContent className="space-y-4 p-5">
                <div>
                  <Badge>PRD 摘要</Badge>
                  <h3 className="mt-3 text-xl font-semibold text-neutral-950">
                    {prdSummary.productName}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {prdSummary.oneLiner}
                  </p>
                </div>
                <div className="space-y-3">
                  {prdSections.map((section) => (
                    <div
                      className="rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                      key={section.label}
                    >
                      <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                        {section.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-neutral-800">{section.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ),
        },
        {
          id: "prototype",
          label: "原型",
          content: <PrototypePreview compact />,
        },
        {
          id: "competitors",
          label: "竞品",
          content: (
            <Card>
              <CardContent className="space-y-3 p-5">
                {competitors.map((competitor) => (
                  <div className="rounded-lg border border-neutral-200 p-4" key={competitor.name}>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-neutral-950">{competitor.name}</h3>
                      <Badge>{competitor.position}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                      {competitor.strength}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-emerald-700">{competitor.gap}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ),
        },
        {
          id: "research",
          label: "市场调研",
          content: (
            <Card>
              <CardContent className="space-y-3 p-5">
                {marketResearch.map((item) => (
                  <div className="rounded-lg bg-neutral-50 p-4" key={item.label}>
                    <p className="text-sm font-semibold text-neutral-950">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ),
        },
        {
          id: "personas",
          label: "用户画像",
          content: (
            <Card>
              <CardContent className="grid gap-3 p-5">
                {personas.map((persona) => (
                  <div className="rounded-lg border border-neutral-200 p-4" key={persona.name}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-neutral-950">{persona.name}</h3>
                      <Badge>{persona.role}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">{persona.goal}</p>
                    <p className="mt-2 text-sm leading-6 text-rose-700">{persona.pain}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ),
        },
      ]}
    />
  );
}
