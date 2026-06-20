import { DocumentPreview } from "@/components/studio/document-preview";
import { buildArtifactDocument } from "@/lib/pm-documents";
import type { ProductPack } from "@/lib/product-pack";

export function SummaryPreview({ productPack }: { productPack: ProductPack }) {
  return <DocumentPreview document={buildArtifactDocument("executive-summary", productPack)} />;
}
