import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { AgentProviderId } from "@/lib/agent-harness";

const execFileAsync = promisify(execFile);

const settingsPath = path.join(process.cwd(), ".pmstudio", "provider-settings.json");

export type ProviderPathSettings = {
  codexPath?: string;
  claudeCodePath?: string;
  updatedAt?: string;
};

const defaultProviderCommands: Partial<Record<AgentProviderId, string>> = {
  "claude-code": "claude",
  codex: "codex",
};

function cleanPath(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeSettings(value: unknown): ProviderPathSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const record = value as Record<string, unknown>;

  return {
    claudeCodePath: cleanPath(record.claudeCodePath),
    codexPath: cleanPath(record.codexPath),
    updatedAt: cleanPath(record.updatedAt),
  };
}

export async function readProviderPathSettings(): Promise<ProviderPathSettings> {
  try {
    return normalizeSettings(JSON.parse(await readFile(settingsPath, "utf8")));
  } catch {
    return {};
  }
}

export async function writeProviderPathSettings(
  settings: ProviderPathSettings,
): Promise<ProviderPathSettings> {
  const nextSettings = normalizeSettings({
    ...settings,
    updatedAt: new Date().toISOString(),
  });

  await mkdir(path.dirname(settingsPath), { recursive: true });
  await writeFile(settingsPath, JSON.stringify(nextSettings, null, 2), "utf8");

  return nextSettings;
}

export async function getProviderCommand(providerId: AgentProviderId) {
  const settings = await readProviderPathSettings();

  if (providerId === "codex") {
    return process.env.PMSTUDIO_CODEX_PATH?.trim() || settings.codexPath || defaultProviderCommands.codex;
  }

  if (providerId === "claude-code") {
    return (
      process.env.PMSTUDIO_CLAUDE_CODE_PATH?.trim() ||
      settings.claudeCodePath ||
      defaultProviderCommands["claude-code"]
    );
  }

  return undefined;
}

export async function commandIsAvailable(command: string) {
  try {
    await execFileAsync(command, ["--version"], {
      timeout: 3000,
    });

    return true;
  } catch {
    if (command.includes("/") || command.includes("\\")) {
      return false;
    }
  }

  try {
    await execFileAsync("bash", ["-lc", "command -v -- \"$1\"", "bash", command], {
      timeout: 1500,
    });

    return true;
  } catch {
    return false;
  }
}

export async function detectProviderCommand(providerId: AgentProviderId) {
  const command = await getProviderCommand(providerId);

  if (!command) {
    return {
      available: false,
      command,
    };
  }

  return {
    available: await commandIsAvailable(command),
    command,
  };
}
