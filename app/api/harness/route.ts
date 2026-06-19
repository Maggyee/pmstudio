import {
  harnessReferenceSources,
  harnessWorkflows,
} from "@/lib/agent-harness";
import { getPublicPMWorkflows } from "@/lib/pm-workflows";
import { detectAgentProviders } from "@/lib/provider-detection";
import { readProviderPathSettings } from "@/lib/provider-settings";
import { presetWorkflowDefinitions, workflowNodeTypes } from "@/lib/workflow-harness";

export async function GET() {
  const providerSettings = await readProviderPathSettings();
  const providers = await detectAgentProviders();

  return Response.json({
    status: "ready",
    referenceArchitecture: harnessReferenceSources,
    providerSettings,
    providers,
    workflows: harnessWorkflows,
    workflowDefinitions: presetWorkflowDefinitions,
    workflowNodeTypes,
    workflowRegistry: getPublicPMWorkflows(),
  });
}
