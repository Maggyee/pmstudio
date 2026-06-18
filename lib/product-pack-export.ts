import { existsSync, readFileSync } from "node:fs";

import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import pptxgen from "pptxgenjs";

import type { ProductPack, ProductPackArtifactIndexItem } from "@/lib/product-pack";

export type ExportFormat = ProductPackArtifactIndexItem["exportFormats"][number];

export type ProductPackExportRequest = {
  artifactId: string;
  format: ExportFormat;
  productPack: ProductPack;
};

export type ProductPackExport = {
  body: string | ArrayBuffer;
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

const pdfFontCandidates = [
  "/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf",
  "/usr/share/fonts/opentype/unifont/unifont_jp.otf",
  "/usr/share/fonts/opentype/unifont/unifont.otf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
];

const deck = {
  bg: "FBFAF7",
  blue: "12A7FF",
  border: "DDDDDD",
  green: "34C759",
  greenWash: "E1F2E6",
  muted: "808080",
  surface: "FFFFFF",
  text: "111111",
  textSecondary: "6A6B6C",
  warning: "FFB005",
};

const deckFont = "Aptos";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product-pack";
}

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  const overrides = pack.prototype.stylesOverride || {};

  const getStyleString = (id: string, defaultStyles = "") => {
    const custom = overrides[id];
    if (!custom) return defaultStyles ? `style="${defaultStyles}"` : "";
    const customStr = Object.entries(custom)
      .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`)
      .join(";");
    return `style="${defaultStyles}${defaultStyles && !defaultStyles.endsWith(";") ? ";" : ""}${customStr}"`;
  };

  const screens = pack.prototype.screens
    .map((screen, sIdx) => {
      const screenId = `screen-${sIdx}`;
      const nameId = `screen-${sIdx}-name`;
      const goalId = `screen-${sIdx}-goal`;
      const actionId = `screen-${sIdx}-primaryAction`;

      const componentItems = screen.components
        .map((item, cIdx) => {
          const compId = `screen-${sIdx}-comp-${cIdx}`;
          return `<li data-od-id="${compId}" ${getStyleString(
            compId,
            "margin-bottom: 6px; color: #4b5563;",
          )}>${escapeHtml(item)}</li>`;
        })
        .join("");

      return `
        <article class="screen-card" data-od-id="${screenId}" ${getStyleString(
          screenId,
          "border: 1px solid rgba(17,24,39,.10); border-radius: 18px; background: #fff; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);",
        )}>
          <h2 data-od-id="${nameId}" ${getStyleString(
            nameId,
            "margin: 0; font-size: 18px; font-weight: 600;",
          )}>${escapeHtml(screen.name)}</h2>
          <p data-od-id="${goalId}" ${getStyleString(
            goalId,
            "color: #4b5563; line-height: 1.6; margin-top: 8px; margin-bottom: 12px; font-size: 14px;",
          )}>${escapeHtml(screen.goal)}</p>
          <strong data-od-id="${actionId}" ${getStyleString(
            actionId,
            "color: #047857; font-size: 13px; font-weight: 700; text-transform: uppercase;",
          )}>${escapeHtml(screen.primaryAction)}</strong>
          <ul style="margin-top: 12px; padding-left: 20px; font-size: 13px; color: #4b5563;">${componentItems}</ul>
        </article>`;
    })
    .join("");

  const userFlowId = "prototype-userFlow";
  const projectTitleId = "project-title";

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pack.project.title)}</title>
  <style>
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; color: #111827; }
    main { max-width: 1120px; margin: 0 auto; padding: 32px 16px; }
    .hero { border: 1px solid rgba(17,24,39,.12); border-radius: 24px; background: #fff; padding: 24px; box-shadow: 0 10px 30px rgba(15,23,42,.03); margin-bottom: 24px; }
    .eyebrow { color: #047857; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    h1 { margin: 8px 0 0; font-size: 30px; line-height: 1.15; font-weight: 800; }
    .flow { margin-top: 12px; color: #4b5563; font-size: 14px; line-height: 1.6; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
  </style>
</head>
<body>
  <main>
    <section class="hero" data-od-id="hero-container" ${getStyleString("hero-container", "")}>
      <div class="eyebrow" data-od-id="eyebrow" ${getStyleString("eyebrow", "")}>OpenDesign-style Live Artifact</div>
      <h1 data-od-id="${projectTitleId}" ${getStyleString(projectTitleId, "")}>${escapeHtml(pack.project.title)}</h1>
      <p class="flow" data-od-id="${userFlowId}" ${getStyleString(userFlowId, "")}>${escapeHtml(pack.prototype.userFlow)}</p>
    </section>
    <section class="grid">${screens}</section>
  </main>
</body>
</html>`;
}

function renderPrototypeManifest(pack: ProductPack) {
  return {
    ...pack.prototype.liveArtifact,
    source: {
      productPackId: pack.id,
      productPackSchemaVersion: pack.schemaVersion,
      generatedAt: pack.generatedAt,
    },
  };
}

function renderPrototypeData(pack: ProductPack) {
  return {
    project: pack.project,
    prd: {
      objective: pack.prd.objective,
      coreFeatures: pack.prd.coreFeatures,
      mvpScope: pack.prd.mvpScope,
      successMetrics: pack.prd.successMetrics,
    },
    prototype: {
      userFlow: pack.prototype.userFlow,
      screens: pack.prototype.screens,
      prdLinks: pack.prototype.prdLinks,
      openDesignPrompt: pack.prototype.openDesignPrompt,
    },
    summary: pack.summary,
  };
}

function renderPrototypeLiveArtifactBundle(pack: ProductPack) {
  const manifest = renderPrototypeManifest(pack);
  const data = renderPrototypeData(pack);
  const html = renderPrototypeHtml(pack);

  return JSON.stringify(
    {
      schemaVersion: "pmstudio-live-artifact-bundle.v1",
      artifactId: "prototype",
      projectId: pack.id,
      liveArtifact: pack.prototype.liveArtifact,
      preview: pack.prototype.liveArtifact.preview,
      instructions:
        "Write each files[].body value to files[].path to recreate the OpenDesign-style live artifact.",
      files: [
        {
          path: "artifact.json",
          mimeType: "application/json",
          purpose: "artifact manifest",
          body: JSON.stringify(manifest, null, 2),
        },
        {
          path: "data.json",
          mimeType: "application/json",
          purpose: "structured product pack data",
          body: JSON.stringify(data, null, 2),
        },
        {
          path: "index.html",
          mimeType: "text/html",
          purpose: "previewable prototype shell",
          body: html,
        },
      ],
    },
    null,
    2,
  );
}

function getPdfFontBytes() {
  const fontPath = pdfFontCandidates.find((candidate) => existsSync(candidate));

  return fontPath ? readFileSync(fontPath) : undefined;
}

function stripMarkdownTableSeparator(line: string) {
  return /^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function renderMarkdownLine(doc: PDFKit.PDFDocument, line: string) {
  const trimmed = line.trim();

  if (!trimmed) {
    doc.moveDown(0.35);
    return;
  }

  if (stripMarkdownTableSeparator(trimmed)) {
    return;
  }

  if (trimmed.startsWith("### ")) {
    doc.moveDown(0.45);
    doc.fontSize(12).fillColor("#111111").text(trimmed.slice(4), { lineGap: 3 });
    return;
  }

  if (trimmed.startsWith("## ")) {
    doc.moveDown(0.65);
    doc.fontSize(15).fillColor("#111111").text(trimmed.slice(3), { lineGap: 4 });
    return;
  }

  if (trimmed.startsWith("# ")) {
    doc.moveDown(0.7);
    doc.fontSize(20).fillColor("#111111").text(trimmed.slice(2), { lineGap: 5 });
    return;
  }

  if (trimmed.startsWith("- ")) {
    doc.fontSize(10).fillColor("#333333").text(`• ${trimmed.slice(2)}`, {
      indent: 14,
      lineGap: 3,
    });
    return;
  }

  if (trimmed.startsWith("|")) {
    doc.fontSize(8).fillColor("#444444").text(trimmed.replaceAll("|", "  |  "), {
      lineGap: 2,
    });
    return;
  }

  doc.fontSize(10).fillColor("#333333").text(trimmed, { lineGap: 4 });
}

function renderPdf({
  artifactTitle,
  markdown,
  pack,
}: {
  artifactTitle: string;
  markdown: string;
  pack: ProductPack;
}) {
  const doc = new PDFDocument({
    bufferPages: false,
    info: {
      Author: "PM Studio",
      Subject: artifactTitle,
      Title: `${pack.project.title} ${artifactTitle}`,
    },
    margin: 48,
    size: "A4",
  });
  const chunks: Buffer[] = [];
  const fontBytes = getPdfFontBytes();

  return new Promise<ArrayBuffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const arrayBuffer = new ArrayBuffer(buffer.byteLength);

      new Uint8Array(arrayBuffer).set(buffer);
      resolve(arrayBuffer);
    });

    if (fontBytes) {
      doc.registerFont("PMStudio", fontBytes);
      doc.font("PMStudio");
    }

    doc
      .fontSize(9)
      .fillColor("#6A6B6C")
      .text("PM Studio Export", { continued: true })
      .fillColor("#808080")
      .text(`  ·  ${new Date(pack.generatedAt).toLocaleDateString("zh-CN")}`);

    doc.moveDown(0.75);
    doc.fontSize(22).fillColor("#111111").text(pack.project.title, {
      lineGap: 5,
    });
    doc.moveDown(0.25);
    doc.fontSize(12).fillColor("#34C759").text(artifactTitle);
    doc.moveDown(0.75);
    doc
      .fontSize(10)
      .fillColor("#6A6B6C")
      .text(pack.project.oneLiner || pack.project.positioning, { lineGap: 4 });
    doc.moveDown(0.75);

    for (const line of markdown.split("\n")) {
      renderMarkdownLine(doc, line);
    }

    doc.end();
  });
}

function addSlideFooter(slide: pptxgen.Slide, pack: ProductPack, label: string) {
  slide.addShape("line", {
    x: 0.55,
    y: 6.96,
    w: 12.2,
    h: 0,
    line: { color: deck.border, transparency: 35, width: 1 },
  });
  slide.addText("PM Studio", {
    x: 0.55,
    y: 7.08,
    w: 1.4,
    h: 0.2,
    fontFace: deckFont,
    fontSize: 8,
    bold: true,
    color: deck.text,
    margin: 0,
  });
  slide.addText(`${label} · ${pack.project.title}`, {
    x: 2.0,
    y: 7.08,
    w: 10.75,
    h: 0.2,
    fontFace: deckFont,
    fontSize: 8,
    color: deck.muted,
    margin: 0,
    breakLine: false,
  });
}

function addSlideTitle(slide: pptxgen.Slide, eyebrow: string, title: string) {
  slide.addText(eyebrow, {
    x: 0.72,
    y: 0.48,
    w: 3.4,
    h: 0.22,
    fontFace: deckFont,
    fontSize: 8,
    bold: true,
    color: deck.blue,
    margin: 0,
    breakLine: false,
  });
  slide.addText(title, {
    x: 0.72,
    y: 0.82,
    w: 10.8,
    h: 0.45,
    fontFace: deckFont,
    fontSize: 22,
    bold: true,
    color: deck.text,
    margin: 0,
    breakLine: false,
  });
}

function addBulletList({
  color = deck.textSecondary,
  fontSize = 13,
  items,
  slide,
  x,
  y,
  w,
}: {
  color?: string;
  fontSize?: number;
  items: string[];
  slide: pptxgen.Slide;
  x: number;
  y: number;
  w: number;
}) {
  items.slice(0, 5).forEach((item, index) => {
    const itemY = y + index * 0.42;

    slide.addShape("ellipse", {
      x,
      y: itemY + 0.1,
      w: 0.08,
      h: 0.08,
      fill: { color: deck.green },
      line: { color: deck.green },
    });
    slide.addText(item, {
      x: x + 0.18,
      y: itemY,
      w,
      h: 0.34,
      fontFace: deckFont,
      fontSize,
      color,
      fit: "shrink",
      margin: 0,
      breakLine: false,
    });
  });
}

function addCoverSlide(pptx: pptxgen, pack: ProductPack, artifactTitle: string) {
  const slide = pptx.addSlide();

  slide.background = { color: deck.bg };
  slide.addShape("rect", {
    x: 0.0,
    y: 0.0,
    w: 3.2,
    h: 7.5,
    fill: { color: deck.text },
    line: { color: deck.text },
  });
  slide.addText("PM\nStudio", {
    x: 0.62,
    y: 0.62,
    w: 1.6,
    h: 0.82,
    fontFace: deckFont,
    fontSize: 19,
    bold: true,
    color: deck.surface,
    breakLine: false,
    margin: 0,
  });
  slide.addText("AI product planning workspace", {
    x: 0.64,
    y: 6.36,
    w: 1.8,
    h: 0.4,
    fontFace: deckFont,
    fontSize: 9,
    color: "CFCFCF",
    margin: 0,
    fit: "shrink",
  });
  slide.addText(artifactTitle, {
    x: 4.05,
    y: 1.0,
    w: 3.5,
    h: 0.32,
    fontFace: deckFont,
    fontSize: 11,
    bold: true,
    color: deck.green,
    margin: 0,
    breakLine: false,
  });
  slide.addText(pack.project.title, {
    x: 4.05,
    y: 1.48,
    w: 7.95,
    h: 1.2,
    fontFace: deckFont,
    fontSize: 34,
    bold: true,
    color: deck.text,
    margin: 0,
    fit: "shrink",
  });
  slide.addText(pack.project.oneLiner, {
    x: 4.08,
    y: 3.0,
    w: 7.1,
    h: 0.74,
    fontFace: deckFont,
    fontSize: 15,
    color: deck.textSecondary,
    margin: 0,
    fit: "shrink",
  });
  slide.addText(pack.summary.headline, {
    x: 4.08,
    y: 4.16,
    w: 7.4,
    h: 0.74,
    fontFace: deckFont,
    fontSize: 14,
    color: deck.text,
    bold: true,
    margin: 0,
    fit: "shrink",
  });
  slide.addText(`Generated ${new Date(pack.generatedAt).toLocaleDateString("zh-CN")}`, {
    x: 4.08,
    y: 6.42,
    w: 3.5,
    h: 0.24,
    fontFace: deckFont,
    fontSize: 9,
    color: deck.muted,
    margin: 0,
  });
  return slide;
}

function addSummarySlide(pptx: pptxgen, pack: ProductPack) {
  const slide = pptx.addSlide();

  slide.background = { color: deck.bg };
  addSlideTitle(slide, "EXECUTIVE SUMMARY", "为什么这个方案值得推进");
  slide.addText(pack.summary.headline, {
    x: 0.78,
    y: 1.55,
    w: 10.7,
    h: 0.6,
    fontFace: deckFont,
    fontSize: 18,
    bold: true,
    color: deck.text,
    margin: 0,
    fit: "shrink",
  });

  addBulletList({
    items: pack.summary.bullets,
    slide,
    x: 0.88,
    y: 2.48,
    w: 5.1,
  });

  slide.addShape("rect", {
    x: 7.15,
    y: 2.24,
    w: 4.75,
    h: 2.4,
    fill: { color: deck.surface, transparency: 8 },
    line: { color: deck.border, width: 1 },
  });
  slide.addText("Target users", {
    x: 7.48,
    y: 2.55,
    w: 2.0,
    h: 0.22,
    fontFace: deckFont,
    fontSize: 9,
    bold: true,
    color: deck.muted,
    margin: 0,
  });
  addBulletList({
    color: deck.text,
    fontSize: 11,
    items: pack.project.targetUsers.slice(0, 4),
    slide,
    x: 7.48,
    y: 2.98,
    w: 3.75,
  });

  addSlideFooter(slide, pack, "Executive Summary");
  return slide;
}

function addRoadmapSlide(pptx: pptxgen, pack: ProductPack) {
  const slide = pptx.addSlide();

  slide.background = { color: deck.bg };
  addSlideTitle(slide, "ROADMAP", "从 MVP 到可扩展工作台");

  pack.roadmap.slice(0, 3).forEach((column, index) => {
    const x = 0.72 + index * 4.12;
    const accent = [deck.green, deck.blue, deck.warning][index] ?? deck.green;

    slide.addShape("line", {
      x,
      y: 1.75,
      w: 3.35,
      h: 0,
      line: { color: accent, width: 2.2 },
    });
    slide.addText(column.horizon, {
      x,
      y: 1.98,
      w: 3.2,
      h: 0.36,
      fontFace: deckFont,
      fontSize: 16,
      bold: true,
      color: deck.text,
      margin: 0,
      fit: "shrink",
    });

    column.items.slice(0, 5).forEach((item, itemIndex) => {
      const y = 2.58 + itemIndex * 0.62;

      slide.addShape("rect", {
        x,
        y,
        w: 3.35,
        h: 0.42,
        fill: { color: itemIndex === 0 ? deck.greenWash : deck.surface, transparency: 4 },
        line: { color: deck.border, transparency: 20, width: 0.8 },
      });
      slide.addText(item, {
        x: x + 0.18,
        y: y + 0.1,
        w: 2.95,
        h: 0.2,
        fontFace: deckFont,
        fontSize: 9.5,
        color: deck.textSecondary,
        margin: 0,
        fit: "shrink",
        breakLine: false,
      });
    });
  });

  addSlideFooter(slide, pack, "Roadmap");
  return slide;
}

function addNextActionsSlide(pptx: pptxgen, pack: ProductPack) {
  const slide = pptx.addSlide();

  slide.background = { color: deck.text };
  slide.addText("NEXT ACTIONS", {
    x: 0.72,
    y: 0.68,
    w: 2.2,
    h: 0.22,
    fontFace: deckFont,
    fontSize: 8,
    bold: true,
    color: deck.green,
    margin: 0,
  });
  slide.addText("让方案进入可验证状态", {
    x: 0.72,
    y: 1.1,
    w: 7.0,
    h: 0.58,
    fontFace: deckFont,
    fontSize: 28,
    bold: true,
    color: deck.surface,
    margin: 0,
    breakLine: false,
  });

  pack.summary.nextActions.slice(0, 3).forEach((action, index) => {
    const y = 2.15 + index * 1.18;

    slide.addText(`0${index + 1}`, {
      x: 0.78,
      y,
      w: 0.54,
      h: 0.28,
      fontFace: deckFont,
      fontSize: 12,
      bold: true,
      color: deck.green,
      margin: 0,
    });
    slide.addShape("line", {
      x: 1.52,
      y: y + 0.12,
      w: 9.9,
      h: 0,
      line: { color: "333333", width: 1 },
    });
    slide.addText(action, {
      x: 1.52,
      y: y + 0.35,
      w: 8.6,
      h: 0.42,
      fontFace: deckFont,
      fontSize: 14,
      color: "E8E8E8",
      margin: 0,
      fit: "shrink",
    });
  });

  slide.addText(pack.project.positioning, {
    x: 0.74,
    y: 6.35,
    w: 10.4,
    h: 0.34,
    fontFace: deckFont,
    fontSize: 9,
    color: "B8B8B8",
    margin: 0,
    fit: "shrink",
  });
  return slide;
}

async function renderPptx(pack: ProductPack, artifactTitle: string) {
  const pptx = new pptxgen();

  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "PM Studio";
  pptx.company = "PM Studio";
  pptx.subject = artifactTitle;
  pptx.title = `${pack.project.title} ${artifactTitle}`;
  pptx.theme = {
    headFontFace: deckFont,
    bodyFontFace: deckFont,
  };

  addCoverSlide(pptx, pack, artifactTitle);
  addSummarySlide(pptx, pack);
  addRoadmapSlide(pptx, pack);
  addNextActionsSlide(pptx, pack);

  return pptx.write({ outputType: "arraybuffer" }) as Promise<ArrayBuffer>;
}

export async function createProductPackExport({
  artifactId,
  format,
  productPack,
}: ProductPackExportRequest): Promise<ProductPackExport> {
  const artifact = productPack.artifactIndex.find((item) => item.id === artifactId);

  if (!artifact) {
    throw new Error(`Unknown artifact: ${artifactId}`);
  }

  if (!artifact.exportFormats.includes(format)) {
    throw new Error(`Artifact ${artifactId} does not support ${format} export`);
  }

  const filenameBase = `${slugify(productPack.id)}-${artifactId}`;

  if (format === "json") {
    if (artifactId === "prototype") {
      return {
        body: renderPrototypeLiveArtifactBundle(productPack),
        contentType: "application/json; charset=utf-8",
        filename: `${filenameBase}.live-artifact.json`,
      };
    }

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

  if (format === "pdf") {
    if (!markdownableArtifacts.has(artifactId)) {
      throw new Error(`Artifact ${artifactId} does not have a PDF renderer`);
    }

    return {
      body: await renderPdf({
        artifactTitle: artifact.title,
        markdown: renderMarkdown(artifactId, productPack),
        pack: productPack,
      }),
      contentType: "application/pdf",
      filename: `${filenameBase}.pdf`,
    };
  }

  if (format === "pptx") {
    return {
      body: await renderPptx(productPack, artifact.title),
      contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      filename: `${filenameBase}.pptx`,
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
