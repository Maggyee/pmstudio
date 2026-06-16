import { StudioShell } from "@/components/studio/studio-shell";
import { buildFinSightProductPack, defaultFinSightIdea } from "@/lib/product-pack";

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams?: Promise<{ artifact?: string; viewport?: string }>;
}) {
  const params = await searchParams;
  const productPack = buildFinSightProductPack(defaultFinSightIdea);

  return (
    <StudioShell
      activeArtifact={params?.artifact}
      activeViewport={params?.viewport}
      productPack={productPack}
    />
  );
}
