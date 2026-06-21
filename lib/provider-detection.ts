import { agentProviders, type AgentProvider, type AgentProviderId } from "@/lib/agent-harness";
import { detectProviderCommand } from "@/lib/provider-settings";

const providerCommandTemplates: Partial<Record<AgentProviderId, (command: string) => string>> = {
  "claude-code": (command) => `${command} --print --output-format stream-json --cwd <artifact-dir>`,
  codex: (command) => `${command} exec --cwd <artifact-dir> <prompt>`,
};

const serverAgentEnabled =
  process.env.PMSTUDIO_ENABLE_LOCAL_AGENT === "1" ||
  process.env.PMSTUDIO_ENABLE_CLOUD_AGENTS === "1";

export async function detectAgentProviders(): Promise<AgentProvider[]> {
  const detected = await Promise.all(
    agentProviders.map(async (provider): Promise<AgentProvider> => {
      const commandTemplate = providerCommandTemplates[provider.id];

      if (!commandTemplate) return provider;

      const detected = await detectProviderCommand(provider.id);
      const available = detected.available && serverAgentEnabled;

      return {
        ...provider,
        command: detected.command && commandTemplate ? commandTemplate(detected.command) : provider.command,
        status: available ? "available" : "planned",
      };
    }),
  );

  return detected;
}
