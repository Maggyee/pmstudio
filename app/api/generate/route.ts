import {
  agentProviders,
  harnessWorkflows,
  type AgentProviderId,
  type WorkflowId,
} from "@/lib/agent-harness";
import { runAgentWorkflow } from "@/lib/agent-runner";
import { defaultFinSightIdea } from "@/lib/product-pack";
import { isWorkflowDefinition, type WorkflowDefinition } from "@/lib/workflow-harness";

const workflowIds = new Set<WorkflowId>(harnessWorkflows.map((workflow) => workflow.id));

const providerIds = new Set<AgentProviderId>(agentProviders.map((provider) => provider.id));

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    providerId?: AgentProviderId;
    workflowId?: WorkflowId;
    workflowDefinition?: WorkflowDefinition;
    input?: string;
  } | null;

  const workflowId = body?.workflowId ?? "idea-to-product-pack";
  const providerId = body?.providerId ?? "mock";
  const workflowDefinition = isWorkflowDefinition(body?.workflowDefinition)
    ? body.workflowDefinition
    : undefined;

  if (!workflowIds.has(workflowId)) {
    return Response.json(
      { error: `Unsupported workflowId: ${workflowId}` },
      { status: 400 },
    );
  }

  if (!providerIds.has(providerId)) {
    return Response.json(
      { error: `Unsupported providerId: ${providerId}` },
      { status: 400 },
    );
  }

  const generated = await runAgentWorkflow({
    providerId,
    workflowDefinition,
    workflowId,
    input: body?.input?.trim() || defaultFinSightIdea,
  });

  return Response.json(generated);
}
