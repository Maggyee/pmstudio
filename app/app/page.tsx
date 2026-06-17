import { StudioShell } from "@/components/studio/studio-shell";
import { generateMockPack } from "@/lib/agent-harness";
import { defaultFinSightIdea } from "@/lib/product-pack";

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams?: Promise<{ artifact?: string; viewport?: string }>;
}) {
  const params = await searchParams;
  const harnessRun = generateMockPack({
    workflowId: "idea-to-product-pack",
    input: defaultFinSightIdea,
  });

  return (
    <StudioShell
      activeArtifact={params?.artifact}
      activeViewport={params?.viewport}
      activeWorkflow={harnessRun.workflow}
      agentEvents={harnessRun.events}
      productPack={harnessRun.productPack}
    />
  );
}
