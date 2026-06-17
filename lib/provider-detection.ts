import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { agentProviders, type AgentProvider, type AgentProviderId } from "@/lib/agent-harness";

const execFileAsync = promisify(execFile);

const providerCommands: Partial<Record<AgentProviderId, string>> = {
  "claude-code": "claude",
  codex: "codex",
};

async function commandExists(command: string) {
  try {
    await execFileAsync("command", ["-v", command], {
      shell: true,
      timeout: 1500,
    });

    return true;
  } catch {
    return false;
  }
}

export async function detectAgentProviders(): Promise<AgentProvider[]> {
  const detected = await Promise.all(
    agentProviders.map(async (provider): Promise<AgentProvider> => {
      const binary = providerCommands[provider.id];

      if (!binary) return provider;

      const available = await commandExists(binary);

      return {
        ...provider,
        status: available ? "available" : "planned",
      };
    }),
  );

  return detected;
}
