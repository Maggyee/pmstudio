import { agentProviders, harnessWorkflows } from "@/lib/agent-harness";

export async function GET() {
  return Response.json({
    status: "ready",
    providers: agentProviders,
    workflows: harnessWorkflows,
  });
}
