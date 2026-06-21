import { StudioShell } from "@/components/studio/studio-shell";

export default async function ProjectWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ artifact?: string; viewport?: string }>;
}) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  return (
    <StudioShell
      activeArtifact={resolvedSearchParams?.artifact}
      activeViewport={resolvedSearchParams?.viewport}
      projectId={resolvedParams.projectId}
    />
  );
}
