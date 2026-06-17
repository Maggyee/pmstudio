import type { ProductPack, ProductPackArtifactIndexItem } from "@/lib/product-pack";

export type ExportFormat = ProductPackArtifactIndexItem["exportFormats"][number];

export type ProductPackExportRequest = {
  artifactId: string;
  format: ExportFormat;
  productPack: ProductPack;
};

export type ProductPackExport = {
  body: string;
  contentType: string;
  filename: string;
};

const markdownableArtifacts = new Set([
  "competitors",
  "executive-summary",
  "personas",
  "prd",
  "product-pack",
  "research",
  "roadmap",
]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product-pack";
}

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function renderPrdMarkdown(pack: ProductPack) {
  return [
    `# ${pack.project.title} PRD`,
    "",
    `## Product One-Liner`,
    "",
    pack.project.oneLiner,
    "",
    "## Objective",
    "",
    pack.prd.objective,
    "",
    "## Sections",
    "",
    pack.prd.sections.map((section) => `### ${section.label}\n\n${section.value}`).join("\n\n"),
    "",
    "## Core Features",
    "",
    list(pack.prd.coreFeatures),
    "",
    "## User Stories",
    "",
    list(pack.prd.userStories),
    "",
    "## Assumptions",
    "",
    list(pack.prd.assumptions),
    "",
    "## Success Metrics",
    "",
    list(pack.prd.successMetrics),
    "",
    "## MVP Scope",
    "",
    list(pack.prd.mvpScope),
  ].join("\n");
}

function renderResearchMarkdown(pack: ProductPack) {
  return [
    `# ${pack.project.title} Market Research`,
    "",
    "## Market Opportunity",
    "",
    pack.research.marketOpportunity
      .map((item) => `### ${item.label}: ${item.value}\n\n${item.detail}`)
      .join("\n\n"),
    "",
    "## Insights",
    "",
    list(pack.research.insights),
  ].join("\n");
}

function renderCompetitorsMarkdown(pack: ProductPack) {
  return [
    `# ${pack.project.title} Competitor Analysis`,
    "",
    "| Competitor | Positioning | Strength | Weakness | Opportunity |",
    "| --- | --- | --- | --- | --- |",
    ...pack.competitors.map(
      (item) =>
        `| ${item.competitor} | ${item.positioning} | ${item.strength} | ${item.weakness} | ${item.opportunity} |`,
    ),
  ].join("\n");
}

function renderPersonasMarkdown(pack: ProductPack) {
  return [
    `# ${pack.project.title} Personas`,
    "",
    ...pack.personas.map((persona) =>
      [
        `## ${persona.name}`,
        "",
        `- Role: ${persona.role}`,
        `- Goal: ${persona.goal}`,
        `- Pain: ${persona.pain}`,
      ].join("\n"),
    ),
  ].join("\n\n");
}

function renderRoadmapMarkdown(pack: ProductPack) {
  return [
    `# ${pack.project.title} Roadmap`,
    "",
    ...pack.roadmap.map((column) => [`## ${column.horizon}`, "", list(column.items)].join("\n")),
  ].join("\n\n");
}

function renderSummaryMarkdown(pack: ProductPack) {
  return [
    `# ${pack.project.title} Executive Summary`,
    "",
    pack.summary.headline,
    "",
    "## Key Points",
    "",
    list(pack.summary.bullets),
    "",
    "## Next Actions",
    "",
    list(pack.summary.nextActions),
  ].join("\n");
}

function renderProductPackMarkdown(pack: ProductPack) {
  return [
    `# ${pack.project.title} Product Pack`,
    "",
    pack.project.positioning,
    "",
    "## Target Users",
    "",
    list(pack.project.targetUsers),
    "",
    "## Pain Points",
    "",
    list(pack.project.painPoints),
    "",
    "## Value Proposition",
    "",
    pack.project.valueProposition,
    "",
    renderPrdMarkdown(pack),
    "",
    renderResearchMarkdown(pack),
    "",
    renderCompetitorsMarkdown(pack),
    "",
    renderRoadmapMarkdown(pack),
    "",
    renderSummaryMarkdown(pack),
  ].join("\n");
}

function renderMarkdown(artifactId: string, pack: ProductPack) {
  const renderers: Record<string, (pack: ProductPack) => string> = {
    competitors: renderCompetitorsMarkdown,
    "executive-summary": renderSummaryMarkdown,
    personas: renderPersonasMarkdown,
    prd: renderPrdMarkdown,
    "product-pack": renderProductPackMarkdown,
    research: renderResearchMarkdown,
    roadmap: renderRoadmapMarkdown,
  };

  return renderers[artifactId]?.(pack) ?? renderProductPackMarkdown(pack);
}

function renderPrototypeHtml(pack: ProductPack) {
  const screens = pack.prototype.screens
    .map(
      (screen) => `
        <article class="screen-card">
          <h2>${screen.name}</h2>
          <p>${screen.goal}</p>
          <strong>${screen.primaryAction}</strong>
          <ul>${screen.components.map((item) => `<li>${item}</li>`).join("")}</ul>
        </article>`,
    )
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${pack.project.title}</title>
  <style>
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; color: #111827; }
    main { max-width: 1120px; margin: 0 auto; padding: 48px 24px; }
    .hero { border: 1px solid rgba(17,24,39,.12); border-radius: 24px; background: #fff; padding: 32px; box-shadow: 0 20px 60px rgba(15,23,42,.08); }
    .eyebrow { color: #047857; font-size: 13px; font-weight: 700; text-transform: uppercase; }
    h1 { margin: 12px 0 0; font-size: 40px; line-height: 1.08; letter-spacing: 0; }
    .flow { margin-top: 20px; color: #4b5563; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 24px; }
    .screen-card { border: 1px solid rgba(17,24,39,.10); border-radius: 18px; background: #fff; padding: 20px; }
    .screen-card h2 { margin: 0; font-size: 18px; }
    .screen-card p { color: #4b5563; line-height: 1.7; }
    .screen-card strong { color: #047857; }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="eyebrow">OpenDesign-style Live Artifact</div>
      <h1>${pack.project.title}</h1>
      <p class="flow">${pack.prototype.userFlow}</p>
    </section>
    <section class="grid">${screens}</section>
  </main>
</body>
</html>`;
}

function renderPlaceholder(format: "pdf" | "pptx", artifactId: string, pack: ProductPack) {
  return JSON.stringify(
    {
      status: "planned",
      message: `${format.toUpperCase()} export is represented as deterministic metadata in the MVP.`,
      artifactId,
      project: pack.project.title,
      source: pack.id,
      nextStep: "Replace this placeholder with a binary renderer after the artifact model is stable.",
    },
    null,
    2,
  );
}

export function createProductPackExport({
  artifactId,
  format,
  productPack,
}: ProductPackExportRequest): ProductPackExport {
  const artifact = productPack.artifactIndex.find((item) => item.id === artifactId);

  if (!artifact) {
    throw new Error(`Unknown artifact: ${artifactId}`);
  }

  if (!artifact.exportFormats.includes(format)) {
    throw new Error(`Artifact ${artifactId} does not support ${format} export`);
  }

  const filenameBase = `${slugify(productPack.id)}-${artifactId}`;

  if (format === "json") {
    return {
      body: JSON.stringify({ artifact, productPack }, null, 2),
      contentType: "application/json; charset=utf-8",
      filename: `${filenameBase}.json`,
    };
  }

  if (format === "html") {
    return {
      body: renderPrototypeHtml(productPack),
      contentType: "text/html; charset=utf-8",
      filename: `${filenameBase}.html`,
    };
  }

  if (format === "pdf" || format === "pptx") {
    return {
      body: renderPlaceholder(format, artifactId, productPack),
      contentType: "application/json; charset=utf-8",
      filename: `${filenameBase}.${format}.json`,
    };
  }

  if (!markdownableArtifacts.has(artifactId)) {
    throw new Error(`Artifact ${artifactId} does not have a markdown renderer`);
  }

  return {
    body: renderMarkdown(artifactId, productPack),
    contentType: "text/markdown; charset=utf-8",
    filename: `${filenameBase}.md`,
  };
}
