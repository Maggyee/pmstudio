"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Braces,
  Check,
  Code2,
  ChevronDown,
  Download,
  ExternalLink,
  Eye,
  Maximize2,
  Monitor,
  Minimize2,
  Pencil,
  RefreshCw,
  Smartphone,
  Tablet,
  MousePointer2,
  Type,
  Paintbrush,
  Plus,
  Trash2,
  Sparkles,
  X,
} from "lucide-react";

import type { ProductPack } from "@/lib/product-pack";
import { cn } from "@/lib/utils";

const viewports = [
  { label: "桌面端", param: "desktop", icon: Monitor, width: 1200, height: 860, size: "1200×860" },
  { label: "平板端", param: "tablet", icon: Tablet, width: 820, height: 1180, size: "820×1180" },
  { label: "移动端", param: "mobile", icon: Smartphone, width: 390, height: 844, size: "390×844" },
];

const zoomLevels = [50, 75, 100, 125, 150, 200];
const previewChromeHeight = 40;

function getViewportFromParam(viewport?: string) {
  return viewports.find((item) => item.param === viewport) ?? viewports[0];
}

function getResponsiveViewportParam(canvasWidth: number) {
  if (canvasWidth < 520) return "mobile";
  if (canvasWidth < 920) return "tablet";

  return "desktop";
}

function getPreviewDomain(productPack?: ProductPack) {
  return `${productPack?.id.replace(/-product-pack$/, "") ?? "finsight"}.pm`;
}

interface SelectedElement {
  id: string;
  tagName: string;
  textContent: string;
  rect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  styles: {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    backgroundColor?: string;
    borderRadius?: string;
    padding?: string;
    margin?: string;
    textAlign?: string;
    border?: string;
    boxShadow?: string;
  };
}

type PreviewCanvasSize = {
  width: number;
  height: number;
};

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generateSandboxHtml(pack: ProductPack, isEditing: boolean) {
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
          return `<span class="component-chip" data-od-id="${compId}" ${getStyleString(
            compId,
            "",
          )}>${escapeHtml(item)}</span>`;
        })
        .join("");

      return `
        <section class="screen-panel" data-od-id="${screenId}" ${getStyleString(
          screenId,
          "",
        )}>
          <div class="screen-index">${String(sIdx + 1).padStart(2, "0")}</div>
          <div class="screen-content">
            <h2 data-od-id="${nameId}" ${getStyleString(
            nameId,
            "",
          )}>${escapeHtml(screen.name)}</h2>
            <p data-od-id="${goalId}" ${getStyleString(
            goalId,
            "",
          )}>${escapeHtml(screen.goal)}</p>
            <div class="component-grid">${componentItems}</div>
          </div>
          <button type="button" class="prototype-action" data-action-button="true" data-label="${escapeHtml(
            screen.primaryAction,
          )}" data-od-id="${actionId}" ${getStyleString(
            actionId,
            "",
          )}>${escapeHtml(screen.primaryAction)}</button>
        </section>`;
    })
    .join("");

  const navItems = pack.prototype.screens
    .map(
      (screen, index) => `
        <button type="button" class="nav-item ${index === 0 ? "active" : ""}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          ${escapeHtml(screen.name)}
        </button>`,
    )
    .join("");
  const prdLinks = pack.prototype.prdLinks
    .map(
      (link) => `
        <article class="trace-row">
          <p>${escapeHtml(link.requirement)}</p>
          <strong>${escapeHtml(link.screen)}</strong>
          <span>${escapeHtml(link.rationale)}</span>
        </article>`,
    )
    .join("");
  const metrics = pack.prd.successMetrics
    .map(
      (metric, index) => `
        <div class="metric-card">
          <span>KR ${index + 1}</span>
          <strong>${escapeHtml(metric)}</strong>
        </div>`,
    )
    .join("");
  const opportunities = pack.research.marketOpportunity
    .map(
      (item) => `
        <div class="insight-row">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
          <p>${escapeHtml(item.detail)}</p>
        </div>`,
    )
    .join("");
  const competitors = pack.competitors
    .slice(0, 4)
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.competitor)}</td>
          <td>${escapeHtml(item.strength)}</td>
          <td>${escapeHtml(item.opportunity)}</td>
        </tr>`,
    )
    .join("");
  const personas = pack.personas
    .map(
      (persona) => `
        <div class="persona-card">
          <strong>${escapeHtml(persona.name)}</strong>
          <span>${escapeHtml(persona.role)}</span>
          <p>${escapeHtml(persona.goal)}</p>
        </div>`,
    )
    .join("");
  const roadmap = pack.roadmap
    .map(
      (phase) => `
        <div class="roadmap-item">
          <strong>${escapeHtml(phase.horizon)}</strong>
          <p>${escapeHtml(phase.items.join(" / "))}</p>
        </div>`,
    )
    .join("");
  const userFlowId = "prototype-userFlow";
  const projectTitleId = "project-title";

  const bridgeScript = `
    <script>
      (function() {
        if (!${isEditing}) {
          document.addEventListener('click', function(e) {
            const action = e.target.closest('[data-action-button]');
            if (!action) return;

            e.preventDefault();
            document.querySelectorAll('[data-action-button]').forEach(function(button) {
              button.removeAttribute('data-active');
              button.textContent = button.getAttribute('data-label') || button.textContent.trim();
            });
            action.setAttribute('data-active', 'true');
            action.textContent = '已选择 · ' + (action.getAttribute('data-label') || action.textContent.trim());
          });
          return;
        }
        
        const style = document.createElement('style');
        style.textContent = \`
          [data-od-id] {
            cursor: pointer;
            transition: outline 0.15s ease, background-color 0.15s ease;
          }
          [data-od-id]:hover {
            outline: 2px solid #12a7ff !important;
            outline-offset: 2px;
          }
          .od-selected {
            outline: 2px solid #34c759 !important;
            outline-offset: 2px;
          }
        \`;
        document.head.appendChild(style);

        let selectedEl = null;

        document.addEventListener('click', function(e) {
          const target = e.target.closest('[data-od-id]');
          if (!target) return;
          
          e.preventDefault();
          e.stopPropagation();

          if (selectedEl) {
            selectedEl.classList.remove('od-selected');
          }
          selectedEl = target;
          selectedEl.classList.add('od-selected');

          const computed = window.getComputedStyle(target);
          const rect = target.getBoundingClientRect();

          window.parent.postMessage({
            type: 'element-selected',
            id: target.getAttribute('data-od-id'),
            tagName: target.tagName.toLowerCase(),
            textContent: target.textContent.trim(),
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            },
            styles: {
              color: computed.color,
              fontSize: computed.fontSize,
              fontWeight: computed.fontWeight,
              backgroundColor: computed.backgroundColor,
              borderRadius: computed.borderRadius,
              padding: computed.padding,
              margin: computed.margin,
              textAlign: computed.textAlign,
              border: computed.border,
              boxShadow: computed.boxShadow
            }
          }, '*');
        }, true);
      })();
    </script>
  `;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pack.project.title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f5f1; color: #111111; }
    button, input { font: inherit; }
    .app-shell { min-height: 100vh; display: grid; grid-template-columns: 248px minmax(0, 1fr); background: #f5f5f1; }
    .sidebar { border-right: 1px solid #e7e5df; background: rgba(255,255,255,.74); padding: 18px 14px; display: flex; flex-direction: column; gap: 18px; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 750; }
    .brand-mark { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; background: #111111; color: #ffffff; font-size: 13px; }
    .nav-group { display: grid; gap: 6px; }
    .nav-label { padding: 0 8px; font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; }
    .nav-item { width: 100%; min-height: 34px; border: 0; border-radius: 8px; background: transparent; color: #5f6062; display: flex; align-items: center; gap: 9px; padding: 8px; text-align: left; cursor: pointer; }
    .nav-item span { color: #a0a0a0; font-size: 11px; font-variant-numeric: tabular-nums; }
    .nav-item.active, .nav-item:hover { background: #111111; color: #ffffff; }
    .nav-item.active span, .nav-item:hover span { color: rgba(255,255,255,.58); }
    .sidebar-footer { margin-top: auto; border: 1px solid #ece8de; border-radius: 12px; background: #fbfaf7; padding: 12px; }
    .sidebar-footer strong { display: block; font-size: 12px; }
    .sidebar-footer p { margin: 6px 0 0; color: #6a6b6c; font-size: 12px; line-height: 1.55; }
    .workspace { min-width: 0; display: flex; flex-direction: column; }
    .topbar { min-height: 58px; display: flex; align-items: center; justify-content: space-between; gap: 14px; border-bottom: 1px solid #e7e5df; background: rgba(255,255,255,.78); padding: 12px 18px; backdrop-filter: blur(14px); }
    .search { width: min(360px, 42vw); height: 34px; border: 1px solid #e7e5df; border-radius: 8px; background: #ffffff; color: #808080; display: flex; align-items: center; padding: 0 11px; font-size: 12px; }
    .status-strip { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #34c759; box-shadow: 0 0 0 4px #e1f2e6; }
    .status-strip span { color: #6a6b6c; font-size: 12px; white-space: nowrap; }
    main { min-width: 0; padding: 18px; }
    .hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(260px, .85fr); gap: 16px; margin-bottom: 16px; }
    .hero-primary, .hero-side, .module, .screen-panel, .trace-row, .metric-card, .insight-row, .persona-card, .roadmap-item { border: 1px solid rgba(17,17,17,.10); background: #ffffff; border-radius: 12px; box-shadow: 0 8px 24px rgba(17,17,17,.035); }
    .hero-primary { min-height: 248px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; }
    .eyebrow { display: inline-flex; width: fit-content; border: 1px solid #d9efe2; border-radius: 7px; background: #eaf7ee; color: #177245; padding: 5px 8px; font-size: 11px; font-weight: 750; }
    h1 { max-width: 780px; margin: 14px 0 0; font-size: 34px; line-height: 1.08; font-weight: 780; letter-spacing: 0; }
    .flow { margin: 12px 0 0; max-width: 760px; color: #5f6062; font-size: 14px; line-height: 1.65; }
    .hero-actions { margin-top: 18px; display: flex; flex-wrap: wrap; gap: 8px; }
    .prototype-action { min-height: 34px; appearance: none; border: 1px solid #111111; border-radius: 8px; background: #111111; color: #ffffff; cursor: pointer; font-size: 12px; font-weight: 700; padding: 8px 12px; transition: background-color .16s ease, color .16s ease, transform .16s ease, border-color .16s ease; }
    .prototype-action:hover { transform: translateY(-1px); }
    .prototype-action[data-active="true"] { background: #12a7ff; border-color: #12a7ff; color: #ffffff; }
    .ghost-action { border-color: #dcdcdc; background: #ffffff; color: #111111; }
    .hero-side { padding: 16px; display: grid; gap: 10px; }
    .hero-side h2, .module h2 { margin: 0; font-size: 13px; font-weight: 760; }
    .metric-grid { display: grid; gap: 8px; }
    .metric-card { padding: 12px; box-shadow: none; }
    .metric-card span, .insight-row span, .screen-index { color: #808080; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .metric-card strong { display: block; margin-top: 5px; color: #111111; font-size: 13px; line-height: 1.45; }
    .layout-grid { display: grid; grid-template-columns: minmax(0, 1fr) 336px; gap: 16px; align-items: start; }
    .main-stack { display: grid; gap: 16px; }
    .side-stack { display: grid; gap: 16px; }
    .module { padding: 16px; }
    .module-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
    .module-header span { color: #808080; font-size: 12px; }
    .screen-list { display: grid; gap: 10px; }
    .screen-panel { display: grid; grid-template-columns: 42px minmax(0, 1fr) auto; align-items: start; gap: 14px; padding: 14px; box-shadow: none; }
    .screen-index { padding-top: 3px; }
    .screen-content h2 { margin: 0; font-size: 15px; font-weight: 760; }
    .screen-content p { margin: 6px 0 0; color: #5f6062; font-size: 13px; line-height: 1.58; }
    .component-grid { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
    .component-chip { border: 1px solid #e6e6e6; border-radius: 7px; background: #fbfaf7; color: #595a5c; padding: 5px 7px; font-size: 11px; }
    .trace-list { display: grid; gap: 8px; }
    .trace-row { padding: 12px; box-shadow: none; }
    .trace-row p { margin: 0; color: #5f6062; font-size: 12px; line-height: 1.55; }
    .trace-row strong { display: block; margin-top: 8px; font-size: 13px; }
    .trace-row span { display: block; margin-top: 4px; color: #808080; font-size: 12px; line-height: 1.5; }
    .insight-list, .persona-grid, .roadmap-list { display: grid; gap: 8px; }
    .insight-row { padding: 12px; box-shadow: none; }
    .insight-row strong { display: block; margin-top: 5px; font-size: 13px; }
    .insight-row p { margin: 5px 0 0; color: #666; font-size: 12px; line-height: 1.55; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border-bottom: 1px solid #eeeeee; padding: 9px 0; text-align: left; vertical-align: top; }
    th { color: #808080; font-size: 11px; font-weight: 700; }
    td { color: #4f5052; line-height: 1.45; }
    .persona-card, .roadmap-item { padding: 12px; box-shadow: none; }
    .persona-card strong, .roadmap-item strong { display: block; font-size: 13px; }
    .persona-card span { display: block; margin-top: 3px; color: #12a7ff; font-size: 11px; font-weight: 700; }
    .persona-card p, .roadmap-item p { margin: 6px 0 0; color: #5f6062; font-size: 12px; line-height: 1.55; }
    @media (max-width: 980px) {
      .app-shell { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .hero, .layout-grid { grid-template-columns: 1fr; }
      .screen-panel { grid-template-columns: 32px minmax(0, 1fr); }
      .screen-panel .prototype-action { grid-column: 2; width: fit-content; }
      .search { display: none; }
    }
    @media (max-width: 560px) {
      main { padding: 12px; }
      .topbar { align-items: flex-start; flex-direction: column; }
      h1 { font-size: 25px; }
      .hero-primary { padding: 16px; min-height: 220px; }
      .screen-panel { grid-template-columns: 1fr; }
      .screen-panel .prototype-action { grid-column: auto; }
    }
  </style>
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">PM</span>
        <span>${escapeHtml(pack.project.title)}</span>
      </div>
      <div class="nav-group">
        <div class="nav-label">Prototype IA</div>
        ${navItems}
      </div>
      <div class="nav-group">
        <div class="nav-label">Artifacts</div>
        <button type="button" class="nav-item"><span>PRD</span>需求文档</button>
        <button type="button" class="nav-item"><span>MR</span>调研与竞品</button>
        <button type="button" class="nav-item"><span>RM</span>路线图</button>
      </div>
      <div class="sidebar-footer">
        <strong>Workflow Goal</strong>
        <p>${escapeHtml(pack.prd.objective)}</p>
      </div>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <div class="status-strip">
          <span class="status-dot"></span>
          <span>PRD linked prototype · ${escapeHtml(pack.artifactIndex.length.toString())} artifacts ready</span>
        </div>
        <div class="search">Search PRD, screens, assumptions...</div>
      </header>
      <main>
        <section class="hero">
          <div class="hero-primary" data-od-id="hero-container" ${getStyleString("hero-container", "")}>
            <div>
              <div class="eyebrow" data-od-id="eyebrow" ${getStyleString("eyebrow", "")}>AI Product Workspace</div>
              <h1 data-od-id="${projectTitleId}" ${getStyleString(projectTitleId, "")}>${escapeHtml(pack.project.title)}</h1>
              <p class="flow" data-od-id="${userFlowId}" ${getStyleString(userFlowId, "")}>${escapeHtml(pack.prototype.userFlow)}</p>
            </div>
            <div class="hero-actions">
              <button type="button" class="prototype-action" data-action-button="true" data-label="运行工作流">运行工作流</button>
              <button type="button" class="prototype-action ghost-action" data-action-button="true" data-label="导出方案包">导出方案包</button>
            </div>
          </div>
          <aside class="hero-side">
            <h2>Success Metrics</h2>
            <div class="metric-grid">${metrics}</div>
          </aside>
        </section>

        <section class="layout-grid">
          <div class="main-stack">
            <section class="module">
              <div class="module-header">
                <h2>Prototype Screens / IA</h2>
                <span>${escapeHtml(pack.prototype.screens.length.toString())} screens</span>
              </div>
              <div class="screen-list">${screens}</div>
            </section>

            <section class="module">
              <div class="module-header">
                <h2>PRD-to-Prototype Traceability</h2>
                <span>Requirement -> Screen -> Rationale</span>
              </div>
              <div class="trace-list">${prdLinks}</div>
            </section>

            <section class="module">
              <div class="module-header">
                <h2>Competitor Direction</h2>
                <span>Positioning gaps</span>
              </div>
              <table>
                <thead>
                  <tr><th>Competitor</th><th>Strength</th><th>Opportunity</th></tr>
                </thead>
                <tbody>${competitors}</tbody>
              </table>
            </section>
          </div>

          <aside class="side-stack">
            <section class="module">
              <div class="module-header">
                <h2>Market Signals</h2>
                <span>Research</span>
              </div>
              <div class="insight-list">${opportunities}</div>
            </section>
            <section class="module">
              <div class="module-header">
                <h2>User Personas</h2>
                <span>JTBD</span>
              </div>
              <div class="persona-grid">${personas}</div>
            </section>
            <section class="module">
              <div class="module-header">
                <h2>Outcome Roadmap</h2>
                <span>MVP to scale</span>
              </div>
              <div class="roadmap-list">${roadmap}</div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  </div>
  ${bridgeScript}
</body>
</html>`;
}

function updatePackField(pack: ProductPack, id: string, text: string): ProductPack {
  const updated = { ...pack };
  if (id === "project-title") {
    updated.project = { ...updated.project, title: text };
  } else if (id === "prototype-userFlow") {
    updated.prototype = { ...updated.prototype, userFlow: text };
  } else if (id.startsWith("screen-")) {
    const parts = id.split("-");
    const sIdx = parseInt(parts[1], 10);
    if (!isNaN(sIdx) && updated.prototype.screens[sIdx]) {
      const screens = [...updated.prototype.screens];
      const screen = { ...screens[sIdx] };

      if (parts[2] === "name") {
        screen.name = text;
      } else if (parts[2] === "goal") {
        screen.goal = text;
      } else if (parts[2] === "primaryAction") {
        screen.primaryAction = text;
      } else if (parts[2] === "comp") {
        const cIdx = parseInt(parts[4], 10);
        if (!isNaN(cIdx) && screen.components[cIdx] !== undefined) {
          const comps = [...screen.components];
          comps[cIdx] = text;
          screen.components = comps;
        }
      }
      screens[sIdx] = screen;
      updated.prototype = { ...updated.prototype, screens };
    }
  }
  return updated;
}

function updatePackStyle(pack: ProductPack, id: string, key: string, value: string): ProductPack {
  const updated = { ...pack };
  const stylesOverride = { ...updated.prototype.stylesOverride };
  const targetOverride = { ...stylesOverride[id] };

  if (value === "" || value === undefined) {
    delete targetOverride[key];
  } else {
    targetOverride[key] = value;
  }

  if (Object.keys(targetOverride).length === 0) {
    delete stylesOverride[id];
  } else {
    stylesOverride[id] = targetOverride;
  }

  updated.prototype = {
    ...updated.prototype,
    stylesOverride,
  };
  return updated;
}

export function StudioPrototypePreview({
  activeViewport,
  activeMode = "预览",
  exportingFormat,
  isEditing = activeMode === "修改",
  onExportHtml,
  onExportLiveArtifact,
  onSwitchMode,
  productPack,
  sourceCode,
  viewerSubtitle,
  viewerTitle,
  onChange,
}: {
  activeViewport?: string;
  activeMode?: "修改" | "源码" | "预览";
  exportingFormat?: "html" | "json" | null;
  isEditing?: boolean;
  onExportHtml?: () => void;
  onExportLiveArtifact?: () => void;
  onSwitchMode?: (mode: "修改" | "源码" | "预览") => void;
  productPack?: ProductPack;
  sourceCode?: string;
  viewerSubtitle?: string;
  viewerTitle?: string;
  onChange?: (pack: ProductPack) => void;
}) {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [viewportParam, setViewportParam] = useState(activeViewport || "desktop");
  const [viewportManuallySelected, setViewportManuallySelected] = useState(Boolean(activeViewport));
  const [zoom, setZoom] = useState(100);
  const [viewportMenuOpen, setViewportMenuOpen] = useState(false);
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inspectorStyle, setInspectorStyle] = useState<CSSProperties>({
    maxHeight: 360,
    right: 12,
    top: 12,
    width: 300,
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const viewerRef = useRef<HTMLDivElement>(null);
  const stageShellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportMenuRef = useRef<HTMLDivElement>(null);
  const zoomMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<PreviewCanvasSize | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const measure = () => {
      setCanvasSize({
        height: el.clientHeight,
        width: el.clientWidth,
      });
    };
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (activeMode === "源码") return;

    const frame = window.requestAnimationFrame(() => {
      const el = canvasRef.current;
      if (!el) return;

      setCanvasSize({
        height: el.clientHeight,
        width: el.clientWidth,
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeMode]);

  useEffect(() => {
    if (!viewportMenuOpen && !zoomMenuOpen && !exportMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (!viewportMenuRef.current?.contains(target)) {
        setViewportMenuOpen(false);
      }

      if (!zoomMenuRef.current?.contains(target)) {
        setZoomMenuOpen(false);
      }

      if (!exportMenuRef.current?.contains(target)) {
        setExportMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [exportMenuOpen, viewportMenuOpen, zoomMenuOpen]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const responsiveViewportParam =
    canvasSize === null ? viewportParam : getResponsiveViewportParam(canvasSize.width);
  const selectedViewport = getViewportFromParam(
    viewportManuallySelected ? viewportParam : responsiveViewportParam,
  );
  const SelectedViewportIcon = selectedViewport.icon;
  const canvasPadding = selectedViewport.param === "mobile" ? 24 : 48;
  const availableCanvasWidth = canvasSize ? Math.max(1, canvasSize.width - canvasPadding) : selectedViewport.width;
  const availableCanvasHeight = canvasSize
    ? Math.max(1, canvasSize.height - canvasPadding)
    : selectedViewport.height + previewChromeHeight;
  const fitScale = Math.min(
    1,
    availableCanvasWidth / selectedViewport.width,
    availableCanvasHeight / (selectedViewport.height + previewChromeHeight),
  );
  const scale = fitScale * (zoom / 100);
  const scaledFrameWidth = Math.round(selectedViewport.width * scale);
  const scaledFrameHeight = Math.round((selectedViewport.height + previewChromeHeight) * scale);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === "element-selected") {
        setSelectedElement(event.data);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!isEditing) {
      const timer = setTimeout(() => {
        setSelectedElement(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;

    const frame = window.requestAnimationFrame(() => {
      const panelWidth = 300;
      const preferredPanelHeight = 360;
      const pad = 12;
      const fallbackStyle: CSSProperties = {
        maxHeight: preferredPanelHeight,
        right: pad,
        top: pad,
        width: panelWidth,
      };
      const shellRect = stageShellRef.current?.getBoundingClientRect();
      const iframeRect = iframeRef.current?.getBoundingClientRect();

      if (!selectedElement?.rect || !shellRect || !iframeRect) {
        setInspectorStyle(fallbackStyle);
        return;
      }

      const panelHeight = Math.min(preferredPanelHeight, Math.max(240, shellRect.height - pad * 2));
      const targetLeft = iframeRect.left - shellRect.left + selectedElement.rect.left * scale;
      const targetTop = iframeRect.top - shellRect.top + selectedElement.rect.top * scale;
      const targetRight = targetLeft + selectedElement.rect.width * scale;
      const targetBottom = targetTop + selectedElement.rect.height * scale;
      const maxLeft = Math.max(pad, shellRect.width - panelWidth - pad);
      const maxTop = Math.max(pad, shellRect.height - panelHeight - pad);
      const topAligned = clampNumber(targetTop, pad, maxTop);

      if (targetRight + pad + panelWidth <= shellRect.width - pad) {
        setInspectorStyle({
          left: targetRight + pad,
          maxHeight: panelHeight,
          top: topAligned,
          width: panelWidth,
        });
        return;
      }

      if (targetLeft - panelWidth - pad >= pad) {
        setInspectorStyle({
          left: targetLeft - panelWidth - pad,
          maxHeight: panelHeight,
          top: topAligned,
          width: panelWidth,
        });
        return;
      }

      const leftAligned = clampNumber(targetLeft, pad, maxLeft);

      if (targetBottom + pad + panelHeight <= shellRect.height - pad) {
        setInspectorStyle({
          left: leftAligned,
          maxHeight: panelHeight,
          top: targetBottom + pad,
          width: panelWidth,
        });
        return;
      }

      if (targetTop - panelHeight - pad >= pad) {
        setInspectorStyle({
          left: leftAligned,
          maxHeight: panelHeight,
          top: targetTop - panelHeight - pad,
          width: panelWidth,
        });
        return;
      }

      setInspectorStyle({
        left: clampNumber(
          targetRight + pad <= shellRect.width / 2 ? targetRight + pad : targetLeft - panelWidth - pad,
          pad,
          maxLeft,
        ),
        maxHeight: panelHeight,
        top: clampNumber(targetTop, pad, maxTop),
        width: panelWidth,
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [canvasSize, isEditing, scale, selectedElement]);

  const pack = productPack;
  if (!pack) {
    return <div className="p-8 text-center text-neutral-500">等待生成产品方案包...</div>;
  }

  const sandboxHtml = generateSandboxHtml(pack, isEditing);
  const toolbarTitle = viewerTitle ?? "prototype/index.html";
  const toolbarSubtitle = viewerSubtitle ?? pack.prototype.userFlow;
  const modeOptions = [
    { label: "预览", value: "预览" as const, icon: Eye },
    { label: "修改", value: "修改" as const, icon: Pencil },
    { label: "源码", value: "源码" as const, icon: Braces },
  ];

  const handleReloadPreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.srcdoc = "";
    window.setTimeout(() => {
      iframe.srcdoc = sandboxHtml;
    }, 0);
  };

  const handleOpenPreviewWindow = () => {
    const previewWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!previewWindow) return;

    previewWindow.document.open();
    previewWindow.document.write(sandboxHtml);
    previewWindow.document.close();
  };

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    void viewerRef.current?.requestFullscreen().catch(() => {
      setIsFullscreen(false);
    });
  };

  const handleExportHtml = () => {
    onExportHtml?.();
    setExportMenuOpen(false);
  };

  const handleExportLiveArtifact = () => {
    onExportLiveArtifact?.();
    setExportMenuOpen(false);
  };

  const handleTextChange = (text: string) => {
    if (!selectedElement || !onChange) return;
    const nextPack = updatePackField(pack, selectedElement.id, text);
    onChange(nextPack);
    setSelectedElement((prev) => (prev ? { ...prev, textContent: text } : null));
  };

  const handleStyleChange = (key: string, value: string) => {
    if (!selectedElement || !onChange) return;
    const nextPack = updatePackStyle(pack, selectedElement.id, key, value);
    onChange(nextPack);
    setSelectedElement((prev) => (prev ? { ...prev, styles: { ...prev.styles, [key]: value } } : null));
  };

  // Screen CRUD actions
  const handleAddScreen = () => {
    if (!onChange) return;
    const newScreen = {
      name: `新页面 ${pack.prototype.screens.length + 1}`,
      goal: "描述该页面的核心用户目标和业务场景。",
      primaryAction: "提交操作",
      components: ["核心卡片区", "操作反馈区"],
    };
    const nextPack = {
      ...pack,
      prototype: {
        ...pack.prototype,
        screens: [...pack.prototype.screens, newScreen],
      },
    };
    onChange(nextPack);
  };

  const handleDeleteScreen = (sIdx: number) => {
    if (!onChange) return;
    const screens = pack.prototype.screens.filter((_, idx) => idx !== sIdx);
    const nextPack = {
      ...pack,
      prototype: {
        ...pack.prototype,
        screens,
      },
    };
    onChange(nextPack);
    setSelectedElement(null);
  };

  const handleAddComponent = (sIdx: number) => {
    if (!onChange || !pack.prototype.screens[sIdx]) return;
    const screens = [...pack.prototype.screens];
    const screen = { ...screens[sIdx] };
    screen.components = [...screen.components, `新组件 ${screen.components.length + 1}`];
    screens[sIdx] = screen;
    const nextPack = {
      ...pack,
      prototype: {
        ...pack.prototype,
        screens,
      },
    };
    onChange(nextPack);
  };

  const handleDeleteComponent = (sIdx: number, cIdx: number) => {
    if (!onChange || !pack.prototype.screens[sIdx]) return;
    const screens = [...pack.prototype.screens];
    const screen = { ...screens[sIdx] };
    screen.components = screen.components.filter((_, idx) => idx !== cIdx);
    screens[sIdx] = screen;
    const nextPack = {
      ...pack,
      prototype: {
        ...pack.prototype,
        screens,
      },
    };
    onChange(nextPack);
    setSelectedElement(null);
  };

  // Color options
  const colors = [
    { label: "默认", value: "#111827" },
    { label: "次要", value: "#4b5563" },
    { label: "绿色", value: "#047857" },
    { label: "蓝色", value: "#12a7ff" },
    { label: "红色", value: "#e11d48" },
  ];

  // Font size options
  const fontSizes = [
    { label: "小", value: "12px" },
    { label: "常规", value: "14px" },
    { label: "小标", value: "18px" },
    { label: "标题", value: "24px" },
    { label: "巨幕", value: "30px" },
  ];

  // Font weight options
  const fontWeights = [
    { label: "常规", value: "400" },
    { label: "中等", value: "500" },
    { label: "半粗", value: "600" },
    { label: "粗体", value: "700" },
  ];

  // Background colors
  const bgColors = [
    { label: "白色", value: "#ffffff" },
    { label: "淡灰", value: "#f8fafc" },
    { label: "淡绿", value: "#ecfdf5" },
    { label: "淡蓝", value: "#eff6ff" },
    { label: "透明", value: "transparent" },
  ];

  // Border radius options
  const radii = [
    { label: "无", value: "0px" },
    { label: "中等", value: "8px" },
    { label: "大", value: "12px" },
    { label: "超大", value: "18px" },
    { label: "完全", value: "24px" },
  ];

  // Padding options
  const paddings = [
    { label: "紧凑", value: "12px" },
    { label: "常规", value: "16px" },
    { label: "宽松", value: "20px" },
    { label: "巨大", value: "28px" },
  ];

  // Text alignment options
  const textAligns = [
    { label: "左对齐", value: "left" },
    { label: "居中", value: "center" },
    { label: "右对齐", value: "right" },
  ];

  // Borders configuration
  const borders = [
    { label: "无", value: "none" },
    { label: "虚线灰", value: "1px dashed #cccccc" },
    { label: "细实灰", value: "1px solid #dddddd" },
    { label: "高亮蓝", value: "2px solid #12a7ff" },
    { label: "护眼绿", value: "2px solid #34c759" },
  ];

  // Box Shadows config
  const shadows = [
    { label: "无", value: "none" },
    { label: "微弱", value: "0 2px 4px rgba(0,0,0,0.02)" },
    { label: "常规", value: "0 4px 6px -1px rgba(0,0,0,0.05)" },
    { label: "立体", value: "0 10px 15px -3px rgba(0,0,0,0.08)" },
  ];

  return (
    <div
      data-testid="prototype-container"
      ref={viewerRef}
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm",
        isFullscreen && "h-screen rounded-none border-0",
      )}
    >
      <div className="border-b border-neutral-200 bg-white px-3 py-2.5">
        <div className="grid gap-2 xl:grid-cols-[minmax(220px,1fr)_auto] xl:items-center">
          <div className="min-w-0 xl:max-w-[420px]">
            <div className="flex min-w-0 items-center gap-2">
              <Code2 className="h-4 w-4 shrink-0 text-neutral-500" />
              <p className="truncate text-sm font-semibold text-neutral-950">{toolbarTitle}</p>
            </div>
            <p className="mt-0.5 max-w-3xl truncate text-xs text-neutral-500">{toolbarSubtitle}</p>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-1.5 xl:flex-nowrap xl:justify-end">
            <div className="flex shrink-0 rounded-lg border border-neutral-200 bg-neutral-100 p-1">
              {modeOptions.map((mode) => {
                const Icon = mode.icon;
                const active = activeMode === mode.value;

                return (
                  <button
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition",
                      active
                        ? "bg-white text-neutral-950 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-950",
                    )}
                    key={mode.value}
                    onClick={() => onSwitchMode?.(mode.value)}
                    type="button"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {mode.label}
                  </button>
                );
              })}
            </div>

            <div className="relative shrink-0" ref={viewportMenuRef}>
              <button
                aria-expanded={viewportMenuOpen}
                aria-haspopup="menu"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
                onClick={() => setViewportMenuOpen((value) => !value)}
                type="button"
              >
                <SelectedViewportIcon className="h-3.5 w-3.5 text-neutral-500" />
                <span>{selectedViewport.label}</span>
                <span className="text-neutral-400">{selectedViewport.size}</span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>
              {viewportMenuOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-black/10 bg-white p-1 shadow-xl">
                  {viewports.map((item) => {
                    const Icon = item.icon;
                    const active = item.param === selectedViewport.param;

                    return (
                      <button
                        className={cn(
                          "flex h-8 w-full items-center justify-between gap-2 rounded-lg px-2.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950",
                          active && "bg-neutral-950 text-white hover:bg-neutral-950 hover:text-white",
                        )}
                        key={item.param}
                        onClick={() => {
                          setViewportManuallySelected(true);
                          setViewportParam(item.param);
                          setViewportMenuOpen(false);
                        }}
                        role="menuitem"
                        type="button"
                      >
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        <span className={cn("text-[11px]", active ? "text-white/62" : "text-neutral-400")}>
                          {item.size}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="relative shrink-0" ref={zoomMenuRef}>
              <button
                aria-expanded={zoomMenuOpen}
                aria-haspopup="menu"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
                onClick={() => setZoomMenuOpen((value) => !value)}
                type="button"
              >
                <span className="tabular-nums">{zoom}%</span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>
              {zoomMenuOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-32 overflow-hidden rounded-xl border border-black/10 bg-white p-1 shadow-xl">
                  {zoomLevels.map((level) => (
                    <button
                      className={cn(
                        "flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950",
                        zoom === level && "bg-neutral-950 text-white hover:bg-neutral-950 hover:text-white",
                      )}
                      key={level}
                      onClick={() => {
                        setZoom(level);
                        setZoomMenuOpen(false);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      <span>{level}%</span>
                      {zoom === level ? <Check className="h-3.5 w-3.5" /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              aria-label="重载预览"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950"
              onClick={handleReloadPreview}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              aria-label="新窗口打开预览"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950"
              onClick={handleOpenPreviewWindow}
              type="button"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <button
              aria-label={isFullscreen ? "退出全屏" : "全屏预览"}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950"
              onClick={handleToggleFullscreen}
              type="button"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <div className="relative shrink-0" ref={exportMenuRef}>
              <button
                aria-expanded={exportMenuOpen}
                aria-haspopup="menu"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-950 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-black"
                onClick={() => setExportMenuOpen((value) => !value)}
                type="button"
              >
                <Download className="h-3.5 w-3.5" />
                导出
                <ChevronDown className="h-3.5 w-3.5 text-white/60" />
              </button>
              {exportMenuOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-black/10 bg-white p-1 shadow-xl">
                  <button
                    className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-55"
                    disabled={!onExportHtml || exportingFormat === "html"}
                    onClick={handleExportHtml}
                    role="menuitem"
                    type="button"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    {exportingFormat === "html" ? "HTML 导出中" : "导出 HTML"}
                  </button>
                  <button
                    className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-55"
                    disabled={!onExportLiveArtifact || exportingFormat === "json"}
                    onClick={handleExportLiveArtifact}
                    role="menuitem"
                    type="button"
                  >
                    <Braces className="h-3.5 w-3.5" />
                    {exportingFormat === "json" ? "Artifact 导出中" : "导出 Live Artifact"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className={cn("bg-[#111111] p-4", activeMode !== "源码" && "hidden")}>
          <pre className="max-h-[calc(100vh-220px)] min-h-[560px] overflow-auto rounded-lg border border-white/10 bg-[#111111] p-4 text-xs leading-5 text-white/82">
            <code>{sourceCode ?? sandboxHtml}</code>
          </pre>
        </div>
      <div
        className={cn("relative overflow-hidden", activeMode === "源码" && "hidden")}
        ref={stageShellRef}
      >
        {/* Sandbox Canvas */}
        <div
          ref={canvasRef}
          className="flex items-start justify-center overflow-auto bg-[linear-gradient(45deg,rgba(221,221,221,0.42)_25%,transparent_25%),linear-gradient(-45deg,rgba(221,221,221,0.42)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(221,221,221,0.42)_75%),linear-gradient(-45deg,transparent_75%,rgba(221,221,221,0.42)_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] bg-neutral-100 p-3 sm:p-6"
          style={{
            height: isFullscreen ? "calc(100vh - 58px)" : "clamp(480px, calc(100vh - 210px), 960px)",
          }}
        >
          <div
            style={{
              width: `${scaledFrameWidth}px`,
              height: `${scaledFrameHeight}px`,
            }}
            className={cn(
              "relative flex-none overflow-hidden border border-neutral-300 bg-white shadow-2xl shadow-black/20 transition-[width,height] duration-300 ease-out",
              selectedViewport.param === "mobile" ? "rounded-[28px]" : "rounded-[18px]",
            )}
          >
            <div
              style={{
                width: `${selectedViewport.width}px`,
                height: `${selectedViewport.height + previewChromeHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className="absolute left-0 top-0 flex flex-col bg-white"
            >
              <div
                className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2.5"
                style={{ height: previewChromeHeight }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                </div>
                <span className="text-xs font-mono text-neutral-400">{getPreviewDomain(pack)}</span>
              </div>
              <iframe
                ref={iframeRef}
                srcDoc={sandboxHtml}
                title={`${pack.project.title} prototype preview`}
                style={{
                  width: `${selectedViewport.width}px`,
                  height: `${selectedViewport.height}px`,
                }}
                className="border-none bg-white"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>

        {/* Visual / Text Element Inspector */}
        {isEditing && (
          <div
            className="absolute z-30 flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white/95 text-sm text-neutral-700 shadow-2xl shadow-black/18 backdrop-blur-xl"
            style={inspectorStyle}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 bg-white/95 px-3 py-2.5 backdrop-blur-xl">
              <span className="flex items-center gap-1.5 font-semibold text-neutral-900">
                <MousePointer2 className="h-4 w-4 text-[#12a7ff]" />
                原型元素检查器
              </span>
              <div className="flex shrink-0 items-center gap-2">
                {selectedElement && (
                  <span className="rounded bg-neutral-200 px-1.5 py-0.5 font-mono text-[10px] uppercase text-neutral-600">
                    {selectedElement.tagName}
                  </span>
                )}
                <button
                  aria-label="关闭编辑窗口"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950"
                  onClick={() => onSwitchMode?.("预览")}
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {selectedElement ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Element ID Indicator */}
                <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 shadow-sm">
                  <p className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">定位标识 (ID)</p>
                  <p className="font-mono text-xs text-neutral-600 truncate mt-0.5">{selectedElement.id}</p>
                </div>

                {/* Text Content Editor */}
                {selectedElement.id !== "hero-container" && !selectedElement.id.startsWith("screen-card") && (
                  <div className="space-y-1">
                    <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
                      <Type className="h-3.5 w-3.5" />
                      文本内容 (Text)
                    </label>
                    <textarea
                      className="min-h-20 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs leading-5 text-neutral-800 outline-none transition focus:border-[#12a7ff] focus:ring-4 focus:ring-[#94D8FF]/30"
                      value={selectedElement.textContent}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="输入修改文本..."
                    />
                  </div>
                )}

                {/* Structural Editing Controls */}
                {(selectedElement.id.startsWith("screen-") || selectedElement.id.includes("-comp-")) && (
                  <div className="space-y-2 pt-2 border-t border-neutral-200">
                    <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                      原型页面结构调整
                    </span>

                    {/* Case 1: Screen card is selected */}
                    {selectedElement.id.startsWith("screen-") && !selectedElement.id.includes("-comp-") && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const sIdx = parseInt(selectedElement.id.split("-")[1], 10);
                            if (!isNaN(sIdx)) handleAddComponent(sIdx);
                          }}
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition shadow-sm animate-in fade-in"
                        >
                          <Plus className="h-3.5 w-3.5 text-neutral-400" />
                          添加组件
                        </button>
                        <button
                          onClick={() => {
                            const sIdx = parseInt(selectedElement.id.split("-")[1], 10);
                            if (!isNaN(sIdx)) handleDeleteScreen(sIdx);
                          }}
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 text-xs font-medium text-rose-700 hover:bg-rose-100 transition animate-in fade-in"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                          删除此页
                        </button>
                      </div>
                    )}

                    {/* Case 2: Screen list item (component) is selected */}
                    {selectedElement.id.includes("-comp-") && (
                      <button
                        onClick={() => {
                          const parts = selectedElement.id.split("-");
                          const sIdx = parseInt(parts[1], 10);
                          const cIdx = parseInt(parts[4], 10);
                          if (!isNaN(sIdx) && !isNaN(cIdx)) handleDeleteComponent(sIdx, cIdx);
                        }}
                        className="w-full inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 text-xs font-medium text-rose-700 hover:bg-rose-100 transition animate-in fade-in"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        删除此组件
                      </button>
                    )}
                  </div>
                )}

                {/* Style Customizer */}
                <div className="space-y-3 pt-2 border-t border-neutral-200">
                  <span className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
                    <Paintbrush className="h-3.5 w-3.5" />
                    样式微调 (Styles)
                  </span>

                  {/* Text Color Selection */}
                  {selectedElement.id !== "hero-container" && !selectedElement.id.startsWith("screen-card") && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-neutral-400">文字颜色</span>
                      <div className="flex flex-wrap gap-1">
                        {colors.map((c) => {
                          const active = selectedElement.styles.color === c.value;
                          return (
                            <button
                              key={c.value}
                              onClick={() => handleStyleChange("color", c.value)}
                              className={cn(
                                "h-6 rounded-md px-2 text-[10px] border border-neutral-200 transition hover:bg-neutral-100",
                                active && "bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800",
                              )}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Text Align Selection */}
                  {selectedElement.id !== "hero-container" && !selectedElement.id.startsWith("screen-card") && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-neutral-400">文字对齐</span>
                      <div className="flex flex-wrap gap-1">
                        {textAligns.map((ta) => {
                          const active = selectedElement.styles.textAlign === ta.value;
                          return (
                            <button
                              key={ta.value}
                              onClick={() => handleStyleChange("textAlign", ta.value)}
                              className={cn(
                                "h-6 rounded-md px-2 text-[10px] border border-neutral-200 transition hover:bg-neutral-100",
                                active && "bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800",
                              )}
                            >
                              {ta.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Font Size Selection */}
                  {selectedElement.id !== "hero-container" && !selectedElement.id.startsWith("screen-card") && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-neutral-400">字号大小</span>
                      <div className="flex flex-wrap gap-1">
                        {fontSizes.map((f) => {
                          const active = selectedElement.styles.fontSize === f.value;
                          return (
                            <button
                              key={f.value}
                              onClick={() => handleStyleChange("fontSize", f.value)}
                              className={cn(
                                "h-6 rounded-md px-2 text-[10px] border border-neutral-200 transition hover:bg-neutral-100",
                                active && "bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800",
                              )}
                            >
                              {f.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Font Weight Selection */}
                  {selectedElement.id !== "hero-container" && !selectedElement.id.startsWith("screen-card") && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-neutral-400">字体粗细</span>
                      <div className="flex flex-wrap gap-1">
                        {fontWeights.map((w) => {
                          const active = selectedElement.styles.fontWeight === w.value;
                          return (
                            <button
                              key={w.value}
                              onClick={() => handleStyleChange("fontWeight", w.value)}
                              className={cn(
                                "h-6 rounded-md px-2 text-[10px] border border-neutral-200 transition hover:bg-neutral-100",
                                active && "bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800",
                              )}
                            >
                              {w.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Background Color Selection (For Card Container or Hero Container) */}
                  {(selectedElement.id.includes("screen-") || selectedElement.id === "hero-container") && (
                    <>
                      <div className="space-y-1">
                        <span className="text-[11px] text-neutral-400">背景颜色</span>
                        <div className="flex flex-wrap gap-1">
                          {bgColors.map((bg) => {
                            const active = selectedElement.styles.backgroundColor === bg.value;
                            return (
                              <button
                                key={bg.value}
                                onClick={() => handleStyleChange("backgroundColor", bg.value)}
                                className={cn(
                                  "h-6 rounded-md px-2 text-[10px] border border-neutral-200 transition hover:bg-neutral-100",
                                  active && "bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800",
                                )}
                              >
                                {bg.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Border configuration */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-neutral-400">边框样式</span>
                        <div className="flex flex-wrap gap-1">
                          {borders.map((b) => {
                            const active = selectedElement.styles.border === b.value;
                            return (
                              <button
                                key={b.value}
                                onClick={() => handleStyleChange("border", b.value)}
                                className={cn(
                                  "h-6 rounded-md px-2 text-[10px] border border-neutral-200 transition hover:bg-neutral-100",
                                  active && "bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800",
                                )}
                              >
                                {b.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Shadows configuration */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-neutral-400">卡片阴影</span>
                        <div className="flex flex-wrap gap-1">
                          {shadows.map((s) => {
                            const active = selectedElement.styles.boxShadow === s.value;
                            return (
                              <button
                                key={s.value}
                                onClick={() => handleStyleChange("boxShadow", s.value)}
                                className={cn(
                                  "h-6 rounded-md px-2 text-[10px] border border-neutral-200 transition hover:bg-neutral-100",
                                  active && "bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800",
                                )}
                              >
                                {s.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Border Radius Selection */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-neutral-400">容器圆角 (Radius)</span>
                        <div className="flex flex-wrap gap-1">
                          {radii.map((r) => {
                            const active = selectedElement.styles.borderRadius === r.value;
                            return (
                              <button
                                key={r.value}
                                onClick={() => handleStyleChange("borderRadius", r.value)}
                                className={cn(
                                  "h-6 rounded-md px-2 text-[10px] border border-neutral-200 transition hover:bg-neutral-100",
                                  active && "bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800",
                                )}
                              >
                                {r.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Padding Selection */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-neutral-400">内部边距 (Padding)</span>
                        <div className="flex flex-wrap gap-1">
                          {paddings.map((p) => {
                            const active = selectedElement.styles.padding === p.value;
                            return (
                              <button
                                key={p.value}
                                onClick={() => handleStyleChange("padding", p.value)}
                                className={cn(
                                  "h-6 rounded-md px-2 text-[10px] border border-neutral-200 transition hover:bg-neutral-100",
                                  active && "bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800",
                                )}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Global Workspace Actions (When nothing is selected) */}
                <div className="rounded-xl border border-dashed border-neutral-200 p-4 bg-white flex flex-col items-center justify-center text-center">
                  <Plus className="h-6 w-6 text-neutral-400 mb-2" />
                  <p className="text-xs font-semibold text-neutral-700">添加新的原型页面</p>
                  <p className="text-[10px] text-neutral-400 mt-1 max-w-[200px] leading-4 mb-3">
                    直接在交互式网格中新增一个页面，用于扩展你的产品流程设计。
                  </p>
                  <button
                    onClick={handleAddScreen}
                    className="w-full inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-950 text-white text-xs font-semibold hover:bg-black transition shadow-sm active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" />
                    添加新页面
                  </button>
                </div>

                <div className="h-48 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-neutral-200 bg-white/50">
                  <MousePointer2 className="h-7 w-7 text-neutral-400 mb-2 animate-bounce" />
                  <p className="text-xs font-semibold text-neutral-700">选择页面元素</p>
                  <p className="text-[10px] text-neutral-400 mt-1 max-w-[200px] leading-4">
                    点击左侧原型网格中的任何文本、按钮、列表项或卡片容器，在此处微调属性和结构。
                  </p>
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
