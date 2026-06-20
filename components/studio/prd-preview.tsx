import { DocumentPreview } from "@/components/studio/document-preview";
import {
  buildArtifactDocument,
  type PMDocumentSourceItem,
} from "@/lib/pm-documents";
import type { ProductPack } from "@/lib/product-pack";

type PrdPrototypeSource = {
  index: number;
  requirement: string;
  source: PMDocumentSourceItem["source"];
};

export function PrdPreview({
  onOpenPrototypeLink,
  productPack,
}: {
  onOpenPrototypeLink?: (source: PrdPrototypeSource) => void;
  productPack: ProductPack;
}) {
  return (
    <DocumentPreview
      document={buildArtifactDocument("prd", productPack)}
      onOpenPrototypeLink={onOpenPrototypeLink}
    />
  );
}
