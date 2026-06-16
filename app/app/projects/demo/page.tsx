import Link from "next/link";
import { ArrowLeft, Download, RefreshCcw, Wand2 } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { PrdPrototypeMap } from "@/components/prd-prototype-map";
import { PrototypePreview } from "@/components/prototype-preview";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  competitors,
  launchPlan,
  marketResearch,
  personas,
  prdSections,
  prdSummary,
  projectStats,
  prototypeHighlights,
  scopeItems,
} from "@/lib/mock-data";

export default function DemoProjectPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="relative z-40 px-3 py-3 sm:px-5">
        <div className="liquid-glass mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full px-4 sm:px-5 lg:px-7">
          <BrandMark />
          <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/app">
            <ArrowLeft className="h-4 w-4" />
            返回工作台
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              完整项目方案
            </Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-neutral-950 md:text-5xl">
              {prdSummary.productName}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              {prdSummary.oneLiner}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" type="button">
              <Download className="h-4 w-4" />
              导出 PRD
            </Button>
            <Button variant="secondary" type="button">
              <RefreshCcw className="h-4 w-4" />
              重新生成
            </Button>
            <Button type="button">
              <Wand2 className="h-4 w-4" />
              生成原型
            </Button>
          </div>
        </div>

        <div className="scroll-reveal liquid-card mt-8 grid gap-0 overflow-hidden rounded-[28px] md:grid-cols-4">
          {projectStats.map((stat) => (
            <div className="border-b border-black/10 p-5 md:border-b-0 md:border-r last:border-r-0" key={stat.label}>
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-950">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="scroll-reveal mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
              <div className="grid lg:grid-cols-[260px_1fr]">
                <div className="bg-neutral-950 p-6 text-white">
                  <p className="text-sm font-semibold">PRD Brief</p>
                  <p className="mt-4 text-sm leading-7 text-white/65">
                    围绕产品想法输入、Agent 执行过程、PRD 原型联动和项目材料导出建立 MVP 范围。
                  </p>
                </div>
                <div className="grid gap-4 p-5 md:grid-cols-3">
                {prdSections.map((section) => (
                  <div className="rounded-[20px] border border-black/10 bg-neutral-50 p-4" key={section.label}>
                    <p className="text-xs font-semibold uppercase tracking-normal text-neutral-500">
                      {section.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">{section.value}</p>
                  </div>
                ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold">功能范围</h2>
                <Badge>PM 工作流</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {scopeItems.map((item) => (
                  <div
                    className="flex items-center gap-3 rounded-full border border-black/10 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                    key={item}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold">市场机会</h2>
                <span className="text-xs text-neutral-500">AI 产品工作台切入点</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {marketResearch.map((item) => (
                  <div className="border-l-2 border-neutral-950 pl-4" key={item.label}>
                    <p className="font-semibold text-neutral-950">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <Card className="liquid-card-interactive">
              <CardHeader>
                <CardTitle>竞品表格</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="text-left text-neutral-500">
                      <th className="border-b border-black/10 pb-3 font-medium">竞品</th>
                      <th className="border-b border-black/10 pb-3 font-medium">定位</th>
                      <th className="border-b border-black/10 pb-3 font-medium">优势</th>
                      <th className="border-b border-black/10 pb-3 font-medium">机会缺口</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitors.map((competitor) => (
                      <tr key={competitor.name}>
                        <td className="border-b border-neutral-100 py-4 font-semibold text-neutral-950">
                          {competitor.name}
                        </td>
                        <td className="border-b border-neutral-100 py-4 text-neutral-600">
                          {competitor.position}
                        </td>
                        <td className="border-b border-neutral-100 py-4 text-neutral-600">
                          {competitor.strength}
                        </td>
                        <td className="border-b border-neutral-100 py-4 text-emerald-700">
                          {competitor.gap}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
            <Card className="liquid-card-interactive">
              <CardHeader>
                <CardTitle>用户画像</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {personas.map((persona) => (
                  <div className="rounded-[20px] border border-white/55 bg-white/42 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/72" key={persona.name}>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-neutral-950">{persona.name}</h3>
                      <Badge>{persona.role}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{persona.goal}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="liquid-card-interactive">
              <CardHeader>
                <CardTitle>上市策略建议</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {launchPlan.map((item) => (
                  <div className="rounded-[18px] border border-white/50 bg-white/45 p-3 text-sm leading-6 text-neutral-700 shadow-sm" key={item}>
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>

        <section className="scroll-reveal mt-6">
          <PrdPrototypeMap />
        </section>

        <section className="scroll-reveal mt-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-950">原型预览</h2>
              <p className="mt-2 text-sm text-neutral-600">
                根据 PRD 功能、用户路径和页面结构生成的 AI 产品经理工作台预览。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {prototypeHighlights.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </div>
          <PrototypePreview />
        </section>
      </section>
    </main>
  );
}
