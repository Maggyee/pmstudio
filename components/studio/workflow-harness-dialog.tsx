"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Check,
  CheckCircle2,
  GitBranchPlus,
  GripVertical,
  Plus,
  Settings2,
  Trash2,
  X,
} from "lucide-react";

import type { AgentProviderId, WorkflowId } from "@/lib/agent-harness";
import {
  cloneWorkflowDefinition,
  createCustomWorkflowDefinition,
  presetWorkflowDefinitions,
  workflowNodeTypes,
  type WorkflowDefinition,
  type WorkflowNodeType,
  type WorkflowStep,
} from "@/lib/workflow-harness";
import { cn } from "@/lib/utils";

function workflowIdOf(definition: WorkflowDefinition): WorkflowId {
  return definition.workflowId ?? "idea-to-product-pack";
}

function enabledStepCount(definition: WorkflowDefinition) {
  return definition.steps.filter((step) => step.enabled).length;
}

function getStepSummary(step: WorkflowStep) {
  const skills = step.skillIds.length ? step.skillIds.join(", ") : "无额外 skill";
  const outputs = step.outputArtifactIds.length ? step.outputArtifactIds.join(", ") : "不直接产出 artifact";

  return `${skills} -> ${outputs}`;
}

function makeNodeStep(node: WorkflowNodeType, providerId: AgentProviderId): WorkflowStep {
  const id = `${node.kind}-${Date.now()}`;

  return {
    description: node.description,
    enabled: true,
    id,
    kind: node.kind,
    outputArtifactIds: [...node.defaultOutputArtifactIds],
    providerId: node.kind === "agent-run" ? providerId : undefined,
    skillIds: [...node.defaultSkillIds],
    title: node.title,
  };
}

export function WorkflowHarnessDialog({
  onApply,
  onClose,
  open,
  providerId,
  selectedDefinition,
}: {
  onApply: (definition: WorkflowDefinition) => void;
  onClose: () => void;
  open: boolean;
  providerId: AgentProviderId;
  selectedDefinition: WorkflowDefinition;
}) {
  const [draft, setDraft] = useState(() => cloneWorkflowDefinition(selectedDefinition));
  const selectedPresetId = useMemo(
    () =>
      presetWorkflowDefinitions.find(
        (definition) =>
          definition.workflowId === draft.workflowId && definition.source === "preset",
      )?.id,
    [draft.workflowId],
  );

  if (!open) return null;

  const updateSteps = (steps: WorkflowStep[]) => {
    setDraft((current) => createCustomWorkflowDefinition(current, { steps }));
  };

  const toggleStep = (stepId: string) => {
    updateSteps(
      draft.steps.map((step) =>
        step.id === stepId ? { ...step, enabled: !step.enabled } : step,
      ),
    );
  };

  const moveStep = (stepId: string, direction: -1 | 1) => {
    const index = draft.steps.findIndex((step) => step.id === stepId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= draft.steps.length) return;

    const steps = [...draft.steps];
    const [step] = steps.splice(index, 1);
    steps.splice(nextIndex, 0, step);
    updateSteps(steps);
  };

  const removeStep = (stepId: string) => {
    updateSteps(draft.steps.filter((step) => step.id !== stepId));
  };

  const addNode = (node: WorkflowNodeType) => {
    updateSteps([...draft.steps, makeNodeStep(node, providerId)]);
  };

  const applyDraft = () => {
    onApply({
      ...draft,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-neutral-950/35 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-black/10 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-neutral-400">
              <GitBranchPlus className="h-3.5 w-3.5" />
              Workflow Harness
            </div>
            <h2 className="mt-1 text-lg font-semibold text-neutral-950">自定义 PM 工作流编排</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              选择整套流程，或组合 PRD、原型、调研、竞品、画像、路线图和 Agent 节点。
            </p>
          </div>
          <button
            aria-label="关闭工作流编排器"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/10 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[250px_minmax(0,1fr)_280px]">
          <aside className="min-h-0 overflow-y-auto border-b border-black/10 bg-neutral-50 p-3 lg:border-b-0 lg:border-r">
            <p className="px-2 text-xs font-semibold text-neutral-500">预设流程</p>
            <div className="mt-2 space-y-1">
              {presetWorkflowDefinitions.map((definition) => {
                const active = definition.id === selectedPresetId && draft.source !== "custom";

                return (
                  <button
                    className={cn(
                      "grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-xl p-3 text-left transition",
                      active
                        ? "bg-neutral-950 text-white"
                        : "text-neutral-700 hover:bg-white hover:text-neutral-950",
                    )}
                    key={definition.id}
                    onClick={() => setDraft(cloneWorkflowDefinition(definition))}
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{definition.name}</span>
                      <span
                        className={cn(
                          "mt-1 line-clamp-2 text-xs leading-5",
                          active ? "text-white/65" : "text-neutral-500",
                        )}
                      >
                        {definition.description}
                      </span>
                      <span
                        className={cn(
                          "mt-2 block text-[11px]",
                          active ? "text-white/45" : "text-neutral-400",
                        )}
                      >
                        {enabledStepCount(definition)} steps
                      </span>
                    </span>
                    {active ? <Check className="mt-0.5 h-4 w-4" /> : null}
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto p-4">
            <div className="mb-4 grid gap-3 rounded-xl border border-black/10 bg-[#fbfaf7] p-4 lg:grid-cols-[minmax(0,1fr)_150px]">
              <div className="min-w-0">
                <label className="text-xs font-semibold text-neutral-500" htmlFor="workflow-name">
                  流程名称
                </label>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-semibold text-neutral-950 outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                  id="workflow-name"
                  onChange={(event) =>
                    setDraft((current) =>
                      createCustomWorkflowDefinition(current, { name: event.target.value }),
                    )
                  }
                  value={draft.name}
                />
              </div>
              <div className="rounded-lg border border-black/10 bg-white p-3">
                <p className="text-xs font-semibold text-neutral-500">执行方式</p>
                <p className="mt-1 truncate text-sm font-medium text-neutral-950">{providerId}</p>
                <p className="mt-1 text-[11px] text-neutral-400">
                  {draft.source === "custom" ? "Custom" : "Preset"} · {workflowIdOf(draft)}
                </p>
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-neutral-500" htmlFor="workflow-desc">
                  生成目标
                </label>
                <textarea
                  className="mt-1 min-h-20 w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm leading-6 text-neutral-700 outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/25"
                  id="workflow-desc"
                  onChange={(event) =>
                    setDraft((current) =>
                      createCustomWorkflowDefinition(current, { description: event.target.value }),
                    )
                  }
                  value={draft.description}
                />
              </div>
            </div>

            <div className="space-y-2">
              {draft.steps.map((step, index) => (
                <section
                  className={cn(
                    "grid gap-3 rounded-xl border p-3 transition lg:grid-cols-[28px_minmax(0,1fr)_auto]",
                    step.enabled
                      ? "border-black/10 bg-white"
                      : "border-black/5 bg-neutral-50 opacity-65",
                  )}
                  key={step.id}
                >
                  <div className="hidden h-9 items-center justify-center text-neutral-300 lg:flex">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-semibold",
                          step.enabled ? "bg-neutral-950 text-white" : "bg-neutral-200 text-neutral-500",
                        )}
                      >
                        {index + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-neutral-950">{step.title}</h3>
                      <span className="rounded-md border border-black/10 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-500">
                        {step.kind}
                      </span>
                      {step.providerId ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                          <Bot className="h-3 w-3" />
                          {step.providerId}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{step.description}</p>
                    <p className="mt-2 truncate text-xs text-neutral-400">{getStepSummary(step)}</p>
                  </div>
                  <div className="flex items-center gap-1 lg:justify-end">
                    <button
                      aria-label={step.enabled ? "停用步骤" : "启用步骤"}
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition",
                        step.enabled
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-black/10 bg-white text-neutral-500 hover:bg-neutral-100",
                      )}
                      onClick={() => toggleStep(step.id)}
                      type="button"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {step.enabled ? "启用" : "停用"}
                    </button>
                    <button
                      aria-label="上移步骤"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:opacity-40"
                      disabled={index === 0}
                      onClick={() => moveStep(step.id, -1)}
                      type="button"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      aria-label="下移步骤"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:opacity-40"
                      disabled={index === draft.steps.length - 1}
                      onClick={() => moveStep(step.id, 1)}
                      type="button"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      aria-label="删除步骤"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-40"
                      disabled={draft.steps.length <= 1}
                      onClick={() => removeStep(step.id)}
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </section>
              ))}
            </div>
          </main>

          <aside className="min-h-0 overflow-y-auto border-t border-black/10 bg-neutral-50 p-4 lg:border-l lg:border-t-0">
            <div className="mb-4 rounded-xl border border-black/10 bg-white p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
                <Settings2 className="h-4 w-4 text-[#12a7ff]" />
                编排结果
              </div>
              <dl className="mt-3 space-y-2 text-xs leading-5">
                <div className="flex justify-between gap-3">
                  <dt className="text-neutral-500">启用步骤</dt>
                  <dd className="font-semibold text-neutral-950">{enabledStepCount(draft)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-neutral-500">产物</dt>
                  <dd className="font-semibold text-neutral-950">{draft.outputArtifactIds.length}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-neutral-500">类型</dt>
                  <dd className="font-semibold text-neutral-950">
                    {draft.source === "custom" ? "自定义" : "预设"}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="mb-2 text-xs font-semibold text-neutral-500">添加节点</p>
            <div className="space-y-2">
              {workflowNodeTypes.map((node) => (
                <button
                  className="grid w-full grid-cols-[24px_minmax(0,1fr)] gap-2 rounded-xl border border-black/10 bg-white p-3 text-left transition hover:border-[#12a7ff]/45 hover:bg-[#f8fcff]"
                  key={node.kind}
                  onClick={() => addNode(node)}
                  type="button"
                >
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-neutral-950 text-white">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-neutral-950">{node.title}</span>
                    <span className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
                      {node.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 bg-white px-5 py-4">
          <p className="text-xs leading-5 text-neutral-500">
            当前编排会随下一次生成请求传给 harness；暂不写入数据库。
          </p>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-9 items-center rounded-lg border border-black/10 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              onClick={onClose}
              type="button"
            >
              取消
            </button>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-950 px-3 text-sm font-medium text-white transition hover:bg-black"
              onClick={applyDraft}
              type="button"
            >
              <Check className="h-4 w-4" />
              应用编排
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
