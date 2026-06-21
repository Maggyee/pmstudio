import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

import {
  agentProviders,
  generateMockPack,
  getArtifactPayloads,
  type AdapterRunMetadata,
  type AgentProviderId,
  type GeneratedPack,
  type HarnessEvent,
  type WorkflowId,
} from "@/lib/agent-harness";
import {
  buildAgentCliOutputInstructions,
  buildAgentCliOutputJsonSchema,
  extractAgentCliResult,
  mergeProductPackDelta,
  type AgentCliResult,
} from "@/lib/agent-cli-contract";
import { getProviderCommand } from "@/lib/provider-settings";
import { buildPrototypeBrief } from "@/lib/prototype-artifacts";
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
const agentCliTimeoutMs = Number(process.env.PMSTUDIO_AGENT_CLI_TIMEOUT_MS ?? 300_000);
const codexBypassApprovals = process.env.PMSTUDIO_CODEX_BYPASS_APPROVALS === "1";
const codexIsolatedConfig = process.env.PMSTUDIO_CODEX_ISOLATED !== "0";

function getAgentRunDir(runId: string) {
  const configuredRoot = process.env.PMSTUDIO_AGENT_RUNS_DIR?.trim();
  const root =
    configuredRoot ||
    (process.platform === "linux"
      ? "/tmp/pmstudio-agent-runs"
      : path.join(tmpdir(), "pmstudio-agent-runs"));

  return path.join(/* turbopackIgnore: true */ root, runId);
}

function getProvider(providerId: AgentProviderId) {
  return agentProviders.find((provider) => provider.id === providerId) ?? agentProviders[0];
}

function packShouldGeneratePrototype(pack: GeneratedPack) {
  const outputArtifactIds = new Set([
    ...pack.workflow.outputArtifacts.map((artifact) => artifact.id),
    ...(pack.workflowDefinition?.outputArtifactIds ?? []),
  ]);
  const hasPrototypeStep = pack.workflowDefinition?.steps.some(
    (step) => step.enabled && step.kind === "prototype",
  );

  return (
    pack.workflowId === "idea-to-product-pack" ||
    pack.workflowId === "prd-to-prototype-linker" ||
    Boolean(hasPrototypeStep) ||
    ["user-flow", "prototype-structure", "prototype-brief", "prototype-preview"].some((artifactId) =>
      outputArtifactIds.has(artifactId),
    )
  );
}

function buildPrompt(pack: GeneratedPack) {
  const includePrototype = packShouldGeneratePrototype(pack);
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
    "Generate the selected product-planning artifacts live from the user's current idea.",
    "Act like OpenDesign's artifact generator: understand the brief, choose the right product surface, generate concrete artifacts, and return structured JSON that PM Studio can render immediately.",
    "",
    "Guardrails:",
    "- PM Studio is the competition product.",
    "- Use the user's product idea as the source of truth. Do not keep the deterministic fallback's domain, title, screens, features, users, or competitors unless they actually match the user's brief.",
    "- Use OpenDesign as the artifact-generation reference: produce inspectable product screens, real HTML files, manifest-ready structure, and concise generation events.",
    "- Use PM Skills as the PM reasoning reference: PRD sections, user stories, assumptions, metrics, roadmap, personas, market and competitor thinking should be product-specific.",
    "- Return concise, structured output. Do not edit repository files for this MVP run.",
    "- Use the temporary run directory files as reference context; do not run shell commands unless absolutely necessary.",
    "- Return a JSON delta that fully replaces every artifact field needed by the selected workflow.",
    "- For PRD-only workflows, focus on PRD and summary. Do not fabricate prototype files.",
    includePrototype
      ? "- For prototype workflows, generate domain-specific prototype screens and include delta.prototype.generatedArtifact.files containing real HTML. This is the actual prototype source PM Studio will preview."
      : "- This workflow does not require prototype output. Do not generate prototype HTML files for this run.",
    includePrototype
      ? "- Use stable prototype paths only: index.html and screens/01-<screen-slug>.html, screens/02-<screen-slug>.html, etc. Do not return random names such as 01-screen-x7a.html."
      : "",
    includePrototype
      ? "- Add data-od-id attributes to important headings, text, buttons, navigation items, cards, and sections so PM Studio can visually edit the generated HTML."
      : "",
    includePrototype
      ? "- Keep each HTML body under 7,000 characters. If needed, generate index.html plus the most important 1-3 screen HTML files and list the rest in delta.prototype.screens."
      : "",
    "- Avoid generic placeholders such as 工作台首页, 数据录入页, AI 分析页 unless the user explicitly asked for that kind of business console.",
    "- Generated prototype HTML must look like the requested product's interface. A reading app should look like a reading app; a CRM should look like a CRM; a game launcher should look like a game launcher.",
    "",
    "Temporary run directory files:",
    "- current-product-pack.json: current typed Product Pack.",
    "- workflow.json: workflow metadata and optional user-defined orchestration.",
    includePrototype
      ? "- prototype-artifact-bundle.json: compact prototype brief/context. It intentionally omits fallback HTML bodies."
      : "- prototype-artifact-bundle.json: intentionally minimal because this workflow does not output a prototype.",
    "- output-contract.md: exact JSON result schema you must return.",
    "- output-schema.json: machine-readable schema passed to Codex when supported.",
    "- DESIGN.md: PM Studio visual constraints for generated artifacts.",
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
    "Fallback Product Pack summary for schema shape only. Replace its content when it does not match the user's idea:",
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
    "",
    "Output contract:",
    "- Return exactly one JSON object matching output-contract.md and output-schema.json.",
    "- Include events that explain what was generated and which artifact each step produced.",
    "- Set notes to short adapter-safe notes only; do not put raw chain-of-thought there.",
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
  const command = (await getProviderCommand("codex")) ?? "codex";
  const runDir = getAgentRunDir(runId);
  const schemaPath = path.join(runDir, "output-schema.json");
  const lastMessagePath = path.join(runDir, "last-message.json");

  const permissionArgs = codexBypassApprovals
    ? ["--dangerously-bypass-approvals-and-sandbox"]
    : [
        "--sandbox",
        "workspace-write",
        "-c",
        "sandbox_workspace_write.network_access=true",
      ];
  const configArgs = codexIsolatedConfig ? ["--ignore-rules", "--ignore-user-config"] : [];
  const args = [
    "exec",
    "--json",
    "--skip-git-repo-check",
    ...permissionArgs,
    ...configArgs,
    "--ephemeral",
    "--output-schema",
    schemaPath,
    "--output-last-message",
    lastMessagePath,
    "-C",
    runDir,
  ];

  return new Promise<{ command: string; output: string }>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });
    const chunks: string[] = [];
    const errors: string[] = [];
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Codex run timed out after ${Math.round(agentCliTimeoutMs / 1000)} seconds`));
    }, agentCliTimeoutMs);

    child.stdout.on("data", (chunk) => chunks.push(String(chunk)));
    child.stderr.on("data", (chunk) => errors.push(String(chunk)));
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);

      void readFile(lastMessagePath, "utf8")
        .catch(() => "")
        .then((lastMessage) => {
          const output = [...chunks, ...errors, lastMessage].join("").trim();

          if (code === 0) {
            resolve({
              command: `${command} ${args.join(" ")}`,
              output,
            });
            return;
          }

          reject(new Error(output || `Codex exited with code ${code}`));
        });
    });

    child.stdin.end(prompt);
  });
}

async function runClaudeCodeCli(prompt: string, runId: string) {
  const command = (await getProviderCommand("claude-code")) ?? "claude";
  const runDir = getAgentRunDir(runId);

  const args = [
    "--print",
    "--output-format",
    "stream-json",
    "--cwd",
    runDir,
  ];

  return new Promise<{ command: string; output: string }>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });
    const chunks: string[] = [];
    const errors: string[] = [];
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Claude Code run timed out after ${Math.round(agentCliTimeoutMs / 1000)} seconds`));
    }, agentCliTimeoutMs);

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
          command: `${command} ${args.join(" ")}`,
          output,
        });
        return;
      }

      reject(new Error(output || `Claude Code exited with code ${code}`));
    });

    child.stdin.end(prompt);
  });
}

async function prepareAgentRunDirectory(pack: GeneratedPack, prompt: string, runId: string) {
  const runDir = getAgentRunDir(runId);
  const includePrototype = packShouldGeneratePrototype(pack);
  const prototypeArtifactBundle = includePrototype
    ? {
        schemaVersion: "pmstudio.prototype-generation-context.v1",
        artifactId: "prototype",
        projectId: pack.productPack.id,
        brief: buildPrototypeBrief(pack.productPack),
        currentScreens: pack.productPack.prototype.screens,
        prdLinks: pack.productPack.prototype.prdLinks,
        expectedGeneratedArtifact: {
          entryFile: "index.html",
          files: [
            {
              path: "index.html",
              purpose: "compact launcher or first product screen",
            },
            {
              path: "screens/01-primary.html",
              purpose: "primary user-facing product screen",
            },
          ],
        },
      }
    : {
        skipped: true,
        reason: "Current workflow does not output prototype artifacts.",
        workflowId: pack.workflowId,
      };
  const designMd = await readFile(path.join(process.cwd(), "DESIGN.md"), "utf8").catch(() => "");

  await mkdir(runDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(runDir, "prompt.md"), prompt, "utf8"),
    writeFile(
      path.join(runDir, "DESIGN.md"),
      designMd || "Use PM Studio's neutral workspace style, clear hierarchy, and responsive artifact previews.",
      "utf8",
    ),
    writeFile(
      path.join(runDir, "current-product-pack.json"),
      JSON.stringify(pack.productPack, null, 2),
      "utf8",
    ),
    writeFile(
      path.join(runDir, "workflow.json"),
      JSON.stringify(
        {
          workflowId: pack.workflowId,
          input: pack.input,
          workflow: pack.workflow,
          workflowDefinition: pack.workflowDefinition ?? null,
        },
        null,
        2,
      ),
      "utf8",
    ),
    writeFile(
      path.join(runDir, "prototype-artifact-bundle.json"),
      JSON.stringify(prototypeArtifactBundle, null, 2),
      "utf8",
    ),
    writeFile(
      path.join(runDir, "output-contract.md"),
      buildAgentCliOutputInstructions({ includePrototype }),
      "utf8",
    ),
    writeFile(
      path.join(runDir, "output-schema.json"),
      JSON.stringify(buildAgentCliOutputJsonSchema({ includePrototype }), null, 2),
      "utf8",
    ),
  ]);

  return runDir;
}

function applyCliResultToPack(pack: GeneratedPack, cliResult?: AgentCliResult): GeneratedPack {
  if (!cliResult?.delta) return pack;

  const productPack = mergeProductPackDelta(pack.productPack, cliResult.delta);

  return {
    ...pack,
    productPack,
    artifacts: getArtifactPayloads(productPack, pack.workflow.description),
    openDesignPromptPlaceholder: productPack.prototype.openDesignPrompt,
  };
}

function buildCliEvents({
  adapterAgent,
  cliResult,
  parsed,
}: {
  adapterAgent: string;
  cliResult?: AgentCliResult;
  parsed: boolean;
}): HarnessEvent[] {
  if (!parsed) {
    return [
      {
        type: "running",
        agent: adapterAgent,
        message: "CLI 已执行但未返回有效 JSON delta，已保留稳定 Product Pack fallback。",
      },
    ];
  }

  const cliEvents = (cliResult?.events ?? []).map((event) =>
    event.type === "queued" || event.type === "running"
      ? { ...event, type: "artifact" as const }
      : event,
  );
  const hasDoneEvent = cliEvents.some((event) => event.type === "done");

  return [
    {
      type: cliResult?.delta ? "artifact" : "done",
      agent: adapterAgent,
      artifactId: cliResult?.delta ? "product-pack" : undefined,
      message: cliResult?.delta
        ? "CLI 已返回结构化 Product Pack delta，并已合并到当前 workspace。"
        : "CLI 已返回结构化结果，但没有需要合并的 Product Pack delta。",
    },
    ...cliEvents,
    ...(hasDoneEvent
      ? []
      : [
          {
            type: "done" as const,
            agent: adapterAgent,
            message: "本地 CLI 运行完成。",
          },
        ]),
  ];
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
        await prepareAgentRunDirectory(pack, prompt, runId);
        const result = await runCodexCli(prompt, runId);
        const cliResult = extractAgentCliResult(result.output);
        const parsedPack = applyCliResultToPack(pack, cliResult);

        return withRunMetadata({
          runId,
          pack: parsedPack,
          metadata: {
            providerId: provider.id,
            mode: "codex-cli",
            command: result.command,
            outputPreview: result.output.slice(0, 1200),
            promptPreview: prompt.slice(0, 700),
          },
          events: buildCliEvents({
            adapterAgent: "Codex Adapter",
            cliResult,
            parsed: Boolean(cliResult),
          }),
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
        await prepareAgentRunDirectory(pack, prompt, runId);
        const result = await runClaudeCodeCli(prompt, runId);
        const cliResult = extractAgentCliResult(result.output);
        const parsedPack = applyCliResultToPack(pack, cliResult);

        return withRunMetadata({
          runId,
          pack: parsedPack,
          metadata: {
            providerId: provider.id,
            mode: "claude-cli",
            command: result.command,
            outputPreview: result.output.slice(0, 1200),
            promptPreview: prompt.slice(0, 700),
          },
          events: buildCliEvents({
            adapterAgent: "Claude Code Adapter",
            cliResult,
            parsed: Boolean(cliResult),
          }),
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
