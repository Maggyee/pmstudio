import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

import {
  agentProviders,
  generateMockPack,
  type AdapterRunMetadata,
  type AgentProviderId,
  type GeneratedPack,
  type HarnessEvent,
  type WorkflowId,
} from "@/lib/agent-harness";
import type { WorkflowDefinition } from "@/lib/workflow-harness";
import { summarizeWorkflowDefinition } from "@/lib/workflow-harness";

export type AgentWorkflowRunRequest = {
  providerId?: AgentProviderId;
  workflowId: WorkflowId;
  workflowDefinition?: WorkflowDefinition;
  input: string;
};

const serverAgentEnabled =
  process.env.PMSTUDIO_ENABLE_LOCAL_AGENT === "1" ||
  process.env.PMSTUDIO_ENABLE_CLOUD_AGENTS === "1";

function getProvider(providerId: AgentProviderId) {
  return agentProviders.find((provider) => provider.id === providerId) ?? agentProviders[0];
}

function buildPrompt(pack: GeneratedPack) {
  const outputArtifacts = pack.workflow.outputArtifacts
    .map((artifact) => `- ${artifact.title}: ${artifact.description}`)
    .join("\n");
  const actions = pack.workflow.userFacingActions.map((action) => `- ${action}`).join("\n");
  const workflowSteps = pack.workflowDefinition?.steps
    .filter((step) => step.enabled)
    .map((step, index) => {
      const skills = step.skillIds.length ? ` skills=${step.skillIds.join(", ")}` : "";
      const outputs = step.outputArtifactIds.length
        ? ` outputs=${step.outputArtifactIds.join(", ")}`
        : "";

      return `${index + 1}. ${step.title} (${step.kind}) - ${step.description}${skills}${outputs}`;
    })
    .join("\n");

  return [
    "You are the PM Studio agent runner.",
    "",
    "Mission:",
    "Turn a product idea into a review-ready product artifact pack for a product manager.",
    "",
    "Guardrails:",
    "- PM Studio is the competition product.",
    "- FinSight can remain the generated demo project when the input is wealth-management related.",
    "- Preserve the existing DESIGN.md visual direction; do not propose a redesign.",
    "- Use OpenDesign as the studio/artifact interaction reference.",
    "- Use PM Skills as the PM reasoning and workflow reference.",
    "- Return concise, structured output. Do not edit repository files for this MVP run.",
    "",
    `Workflow: ${pack.workflow.title}`,
    pack.workflow.description,
    "",
    "Workflow orchestration:",
    summarizeWorkflowDefinition(pack.workflowDefinition),
    workflowSteps ? workflowSteps : "No custom step definition supplied.",
    "",
    "User-facing PM actions:",
    actions,
    "",
    "Expected artifacts:",
    outputArtifacts,
    "",
    "Input idea:",
    pack.input,
    "",
    "Current deterministic Product Pack summary:",
    JSON.stringify(
      {
        project: pack.productPack.project,
        prdObjective: pack.productPack.prd.objective,
        userFlow: pack.productPack.prototype.userFlow,
        artifactIndex: pack.productPack.artifactIndex,
      },
      null,
      2,
    ),
  ].join("\n");
}

function withRunMetadata({
  events,
  metadata,
  pack,
  runId,
}: {
  events: HarnessEvent[];
  metadata: AdapterRunMetadata;
  pack: GeneratedPack;
  runId: string;
}): GeneratedPack {
  return {
    ...pack,
    adapter: metadata,
    events: [...events, ...pack.events],
    providerId: metadata.providerId,
    runId,
    runMode: metadata.mode,
  };
}

async function runCodexCli(prompt: string, runId: string) {
  const runDir = path.join(tmpdir(), "pmstudio-agent-runs", runId);
  await mkdir(runDir, { recursive: true });

  const args = [
    "exec",
    "--json",
    "--skip-git-repo-check",
    "--sandbox",
    "workspace-write",
    "-c",
    "sandbox_workspace_write.network_access=true",
    "-C",
    runDir,
  ];

  return new Promise<{ command: string; output: string }>((resolve, reject) => {
    const child = spawn("codex", args, {
      stdio: ["pipe", "pipe", "pipe"],
    });
    const chunks: string[] = [];
    const errors: string[] = [];
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Codex run timed out after 45 seconds"));
    }, 45_000);

    child.stdout.on("data", (chunk) => chunks.push(String(chunk)));
    child.stderr.on("data", (chunk) => errors.push(String(chunk)));
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);

      const output = [...chunks, ...errors].join("").trim();

      if (code === 0) {
        resolve({
          command: `codex ${args.join(" ")}`,
          output,
        });
        return;
      }

      reject(new Error(output || `Codex exited with code ${code}`));
    });

    child.stdin.end(prompt);
  });
}

async function runClaudeCodeCli(prompt: string, runId: string) {
  const runDir = path.join(tmpdir(), "pmstudio-agent-runs", runId);
  await mkdir(runDir, { recursive: true });

  const args = [
    "--print",
    "--output-format",
    "stream-json",
    "--cwd",
    runDir,
  ];

  return new Promise<{ command: string; output: string }>((resolve, reject) => {
    const child = spawn("claude", args, {
      stdio: ["pipe", "pipe", "pipe"],
    });
    const chunks: string[] = [];
    const errors: string[] = [];
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Claude Code run timed out after 45 seconds"));
    }, 45_000);

    child.stdout.on("data", (chunk) => chunks.push(String(chunk)));
    child.stderr.on("data", (chunk) => errors.push(String(chunk)));
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);

      const output = [...chunks, ...errors].join("").trim();

      if (code === 0) {
        resolve({
          command: `claude ${args.join(" ")}`,
          output,
        });
        return;
      }

      reject(new Error(output || `Claude Code exited with code ${code}`));
    });

    child.stdin.end(prompt);
  });
}

export async function runAgentWorkflow({
  providerId = "mock",
  workflowDefinition,
  workflowId,
  input,
}: AgentWorkflowRunRequest): Promise<GeneratedPack> {
  const provider = getProvider(providerId);
  const normalizedInput = input.trim();
  const runId = `run-${randomUUID()}`;
  const pack = generateMockPack({
    workflowId,
    input: normalizedInput,
    workflowDefinition,
  });
  const prompt = buildPrompt(pack);

  if (provider.id === "mock") {
    return withRunMetadata({
      runId,
      pack,
      metadata: {
        providerId: provider.id,
        mode: "mock",
        command: provider.command,
        promptPreview: prompt.slice(0, 700),
      },
      events: [
        {
          type: "queued",
          agent: "Adapter",
          message: "使用内置 mock provider，保持演示可重复和可离线运行。",
        },
      ],
    });
  }

  if (provider.id === "codex") {
    if (serverAgentEnabled) {
      try {
        const result = await runCodexCli(prompt, runId);

        return withRunMetadata({
          runId,
          pack,
          metadata: {
            providerId: provider.id,
            mode: "codex-cli",
            command: result.command,
            outputPreview: result.output.slice(0, 1200),
            promptPreview: prompt.slice(0, 700),
          },
          events: [
            {
              type: "running",
              agent: "Codex Adapter",
              message: "已通过本地 Codex CLI 执行 PM Studio workflow，当前 Product Pack 仍使用稳定结构渲染。",
            },
          ],
        });
      } catch (error) {
        return withRunMetadata({
          runId,
          pack,
          metadata: {
            providerId: provider.id,
            mode: "codex-dry-run",
            command: provider.command,
            outputPreview: error instanceof Error ? error.message : "Codex CLI run failed",
            promptPreview: prompt.slice(0, 700),
          },
          events: [
            {
              type: "running",
              agent: "Codex Adapter",
              message: "本地 Codex CLI 未完成，已回退到稳定 mock Product Pack。",
            },
          ],
        });
      }
    }

    return withRunMetadata({
      runId,
      pack,
      metadata: {
        providerId: provider.id,
        mode: "codex-dry-run",
        command: provider.command,
        promptPreview: prompt.slice(0, 700),
      },
      events: [
        {
          type: "queued",
          agent: "Codex Adapter",
          message: "Codex adapter dry-run 已组装 prompt 和命令；设置 PMSTUDIO_ENABLE_LOCAL_AGENT=1 后可尝试本地 CLI。",
        },
      ],
    });
  }

  if (provider.id === "claude-code") {
    if (serverAgentEnabled) {
      try {
        const result = await runClaudeCodeCli(prompt, runId);

        return withRunMetadata({
          runId,
          pack,
          metadata: {
            providerId: provider.id,
            mode: "claude-cli",
            command: result.command,
            outputPreview: result.output.slice(0, 1200),
            promptPreview: prompt.slice(0, 700),
          },
          events: [
            {
              type: "running",
              agent: "Claude Code Adapter",
              message: "已通过服务器 Claude Code CLI 执行 PM Studio workflow，当前 Product Pack 仍使用稳定结构渲染。",
            },
          ],
        });
      } catch (error) {
        return withRunMetadata({
          runId,
          pack,
          metadata: {
            providerId: provider.id,
            mode: "claude-dry-run",
            command: provider.command,
            outputPreview: error instanceof Error ? error.message : "Claude Code CLI run failed",
            promptPreview: prompt.slice(0, 700),
          },
          events: [
            {
              type: "running",
              agent: "Claude Code Adapter",
              message: "服务器 Claude Code CLI 未完成，已回退到稳定 mock Product Pack。",
            },
          ],
        });
      }
    }

    return withRunMetadata({
      runId,
      pack,
      metadata: {
        providerId: provider.id,
        mode: "claude-dry-run",
        command: provider.command,
        promptPreview: prompt.slice(0, 700),
      },
      events: [
        {
          type: "queued",
          agent: "Claude Code Adapter",
          message: "Claude Code adapter dry-run 已组装 prompt 和命令；设置 PMSTUDIO_ENABLE_CLOUD_AGENTS=1 后可在服务器尝试 CLI。",
        },
      ],
    });
  }

  return withRunMetadata({
    runId,
    pack,
    metadata: {
      providerId: provider.id,
      mode: "api-fallback-dry-run",
      command: provider.command,
      promptPreview: prompt.slice(0, 700),
    },
    events: [
      {
        type: "queued",
        agent: "API Adapter",
        message: "API fallback 仍处于接口占位阶段，当前返回稳定 Product Pack。",
      },
    ],
  });
}
