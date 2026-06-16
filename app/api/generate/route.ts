import { generateMockPack, type WorkflowId } from "@/lib/agent-harness";
import { defaultFinSightIdea } from "@/lib/product-pack";

const workflowIds = new Set<WorkflowId>([
  "idea-to-product-pack",
  "prd-to-prototype-linker",
  "project-summarizer",
]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    workflowId?: WorkflowId;
    input?: string;
  } | null;

  const workflowId = body?.workflowId ?? "idea-to-product-pack";

  if (!workflowIds.has(workflowId)) {
    return Response.json(
      { error: `Unsupported workflowId: ${workflowId}` },
      { status: 400 },
    );
  }

  return Response.json(
    generateMockPack({
      workflowId,
      input: body?.input?.trim() || defaultFinSightIdea,
    }),
  );
}
