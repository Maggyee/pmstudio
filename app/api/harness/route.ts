import {
  agentProviders,
  harnessReferenceSources,
  harnessWorkflows,
} from "@/lib/agent-harness";
import { getPublicPMWorkflows } from "@/lib/pm-workflows";

export async function GET() {
  return Response.json({
    status: "ready",
    referenceArchitecture: harnessReferenceSources,
    providers: agentProviders,
    workflows: harnessWorkflows,
    workflowRegistry: getPublicPMWorkflows(),
  });
}
