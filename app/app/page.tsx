import { StudioShell } from "@/components/studio/studio-shell";

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams?: Promise<{ artifact?: string; viewport?: string }>;
}) {
  const params = await searchParams;
  return (
    <StudioShell
      activeArtifact={params?.artifact}
      activeViewport={params?.viewport}
    />
  );
}
