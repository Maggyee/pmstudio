import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { FeatureCard } from "@/components/feature-card";
import { OutputPreview } from "@/components/output-preview";
import { PrdPrototypeMap } from "@/components/prd-prototype-map";
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkflowStrip } from "@/components/workflow-strip";
import { faqs, featureCards, workflowSteps } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-clip">
      <SiteHeader />

      <section className="mx-auto flex max-w-7xl flex-col px-5 pb-20 pt-12 sm:px-6 md:pt-16 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-5xl font-semibold leading-[1.08] tracking-normal text-black md:text-7xl md:leading-[1.04]">
            从一个产品想法，到完整产品方案
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#808080]">
            自动生成 PRD、原型、竞品分析、市场调研、用户画像和上市建议，让产品方案直接进入评审。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link className={buttonVariants({ size: "lg" })} href="/app">
              开始生成产品方案
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className={buttonVariants({ variant: "secondary", size: "lg" })} href="/app/projects/demo">
              查看示例项目
            </Link>
          </div>
        </div>

        <div className="scroll-reveal mt-14 grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <FeatureCard feature={feature} key={feature.title} />
          ))}
        </div>

        <div className="scroll-reveal mt-12" id="alignment">
          <PrdPrototypeMap />
        </div>
      </section>

      <section className="scroll-reveal py-16" id="workflow">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            description="围绕产品经理最常用的交付链路，把生成结果组织成可讨论的模块。"
            eyebrow="工作流"
            title="从灵感到上线计划，一次跑完"
          />
          <div className="mt-10">
            <WorkflowStrip steps={workflowSteps} />
          </div>
        </div>
      </section>

      <section className="scroll-reveal mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8" id="preview">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              className="mx-0 text-left"
              description="每次生成都会把 PRD、原型、调研、画像和上市建议放进同一个项目视图，适合截图展示、团队评审和导出分享。"
              eyebrow="方案输出"
              title="清晰、完整、可演示"
            />
            <div className="mt-8 grid gap-3">
              {["结构化 PRD", "可视化原型", "竞品和市场信号", "用户画像与上市建议"].map((item) => (
                <div className="flex items-center gap-3 text-sm font-medium text-neutral-700" key={item}>
                  <CheckCircle2 className="h-5 w-5 text-[#34c759]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <OutputPreview />
        </div>
      </section>

      <section className="scroll-reveal py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="常见问题" title="你可能已经在想这些问题" />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {faqs.map((faq) => (
              <Card className="liquid-card-interactive" key={faq.question}>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-neutral-950">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-5 pb-12 pt-4 text-black">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-black/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">PM Studio</p>
            <p className="mt-2 text-sm text-[#808080]">一站式 AI 产品方案生成平台。</p>
          </div>
          <Link className="text-sm font-medium text-[#808080] transition hover:text-[#12a7ff]" href="/app">
            进入工作台
          </Link>
        </div>
      </footer>
    </main>
  );
}
