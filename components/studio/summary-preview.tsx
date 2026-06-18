import { DocumentPreview } from "@/components/studio/document-preview";
import { buildArtifactDocument } from "@/lib/pm-documents";
import {
  buildFinSightProductPack,
  defaultFinSightIdea,
  type ProductPack,
} from "@/lib/product-pack";

export function SummaryPreview({ productPack }: { productPack?: ProductPack }) {
  const pack = productPack ?? buildFinSightProductPack(defaultFinSightIdea);

  return <DocumentPreview document={buildArtifactDocument("executive-summary", pack)} />;
}
