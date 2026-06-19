import { detectAgentProviders } from "@/lib/provider-detection";
import {
  readProviderPathSettings,
  writeProviderPathSettings,
  type ProviderPathSettings,
} from "@/lib/provider-settings";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanPath(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function parseSettingsPayload(value: unknown): ProviderPathSettings {
  if (!isRecord(value)) return {};

  return {
    claudeCodePath: cleanPath(value.claudeCodePath),
    codexPath: cleanPath(value.codexPath),
  };
}

export async function GET() {
  const providerSettings = await readProviderPathSettings();
  const providers = await detectAgentProviders();

  return Response.json({
    providerSettings,
    providers,
  });
}

export async function POST(request: Request) {
  let body: unknown = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const providerSettings = await writeProviderPathSettings(parseSettingsPayload(body));
  const providers = await detectAgentProviders();

  return Response.json({
    providerSettings,
    providers,
  });
}
