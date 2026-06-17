import {
  createProductPackExport,
  type ExportFormat,
} from "@/lib/product-pack-export";
import { buildFinSightProductPack, defaultFinSightIdea } from "@/lib/product-pack";

const exportFormats = new Set<ExportFormat>(["html", "json", "markdown", "pdf", "pptx"]);

function isExportFormat(value: string): value is ExportFormat {
  return exportFormats.has(value as ExportFormat);
}

function buildExportResponse({
  artifactId,
  format,
  input,
}: {
  artifactId: string;
  format: ExportFormat;
  input?: string;
}) {
  const productPack = buildFinSightProductPack(input || defaultFinSightIdea);
  const exported = createProductPackExport({
    artifactId,
    format,
    productPack,
  });

  return new Response(exported.body, {
    headers: {
      "Content-Disposition": `attachment; filename="${exported.filename}"`,
      "Content-Type": exported.contentType,
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const artifactId = url.searchParams.get("artifact") || "product-pack";
  const format = url.searchParams.get("format") || "markdown";
  const input = url.searchParams.get("input") || undefined;

  if (!isExportFormat(format)) {
    return Response.json({ error: `Unsupported export format: ${format}` }, { status: 400 });
  }

  try {
    return buildExportResponse({ artifactId, format, input });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    artifact?: string;
    format?: string;
    input?: string;
  } | null;

  const artifactId = body?.artifact || "product-pack";
  const format = body?.format || "markdown";

  if (!isExportFormat(format)) {
    return Response.json({ error: `Unsupported export format: ${format}` }, { status: 400 });
  }

  try {
    return buildExportResponse({
      artifactId,
      format,
      input: body?.input?.trim() || undefined,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 400 },
    );
  }
}
