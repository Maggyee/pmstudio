import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function IdeaForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>输入产品想法</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          className="min-h-40 w-full resize-none rounded-lg border border-neutral-200 bg-white p-3 text-sm leading-6 text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
          defaultValue="一个帮助独立开发者把模糊产品想法快速变成 PRD、原型和发布计划的 AI 工作台。"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <label className="space-y-2 text-sm font-medium text-neutral-700">
            目标阶段
            <select className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400">
              <option>MVP 验证</option>
              <option>融资路演</option>
              <option>内部立项</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-neutral-700">
            输出重点
            <select className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400">
              <option>完整产品方案</option>
              <option>PRD 优先</option>
              <option>市场调研优先</option>
            </select>
          </label>
        </div>
        <Button className="w-full" size="lg" type="button">
          <Sparkles className="h-4 w-4" />
          生成产品方案
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-xs leading-5 text-neutral-500">
          生成结果会同步展示 PRD、原型、调研、画像和上市建议。
        </p>
      </CardContent>
    </Card>
  );
}
