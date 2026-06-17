import {
  harnessReferenceSources,
  harnessWorkflows,
} from "@/lib/agent-harness";
import { getPublicPMWorkflows } from "@/lib/pm-workflows";
import { detectAgentProviders } from "@/lib/provider-detection";

export async function GET() {
  const providers = await detectAgentProviders();

  return Response.json({
    status: "ready",
    referenceArchitecture: harnessReferenceSources,
    providers,
    workflows: harnessWorkflows,
    workflowRegistry: getPublicPMWorkflows(),
  });
}
