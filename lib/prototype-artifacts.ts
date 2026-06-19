import type { ProductPack } from "@/lib/product-pack";

export type PrototypeKind =
  | "web-dashboard"
  | "mobile-flow"
  | "ai-editor"
  | "ops-console"
  | "landing-plus-app"
  | "wizard";

export type PrototypeTemplateId =
  | "auto"
  | "od-web-prototype"
  | "ai-workspace"
  | "mobile-flow"
  | "review-wizard"
  | "landing-product-proof";

export type PrototypeGenerationOptions = {
  designSystem?: string;
  kind?: PrototypeKind | "auto";
  templateId?: PrototypeTemplateId;
};

export type PrototypeGenerationBrief = {
  schemaVersion: "pmstudio.prototype-brief.v1";
  kind: PrototypeKind;
  templateId: PrototypeTemplateId;
  designSystem: string;
  title: string;
  productSignal: string;
  userFlow: string;
  screens: ProductPack["prototype"]["screens"];
  prdLinks: ProductPack["prototype"]["prdLinks"];
  designIntent: string;
  prompt: string;
};

export type PrototypeArtifactFile = {
  path: string;
  name: string;
  mimeType: string;
  purpose: string;
  editable: boolean;
  body: string;
};

export type PrototypeArtifactBundle = {
  schemaVersion: "pmstudio.prototype-artifact-bundle.v1";
  artifactId: "prototype";
  projectId: string;
  entryFile: "index.html";
  brief: PrototypeGenerationBrief;
  files: PrototypeArtifactFile[];
};

const token = {
  accent: "#12A7FF",
  accentSoft: "#E8F6FF",
  bg: "#F5F5F1",
  border: "#DDDDDD",
  fg: "#111111",
  muted: "#6A6B6C",
  success: "#34C759",
  successSoft: "#E1F2E6",
  surface: "#FFFFFF",
  warm: "#FBFAF7",
  warning: "#FFB005",
};

export const prototypeKindOptions: Array<{
  id: PrototypeKind | "auto";
  label: string;
  description: string;
}> = [
  {
    id: "auto",
    label: "自动判断",
    description: "根据产品 idea、PRD 和 screen 目标自动选择原型形态。",
  },
  {
    id: "ai-editor",
    label: "AI 编辑工作流",
    description: "适合生成、审阅、修改、交付类 AI 工作台。",
  },
  {
    id: "web-dashboard",
    label: "Web 产品界面",
    description: "适合 SaaS、数据产品和多模块管理界面。",
  },
  {
    id: "ops-console",
    label: "运营控制台",
    description: "适合工单、履约、排班、库存、CRM 等业务操作流。",
  },
  {
    id: "mobile-flow",
    label: "移动端流程",
    description: "适合 App、轻量任务流和移动端多步骤交互。",
  },
  {
    id: "wizard",
    label: "分步向导",
    description: "适合 onboarding、配置、审批、申请等任务链。",
  },
  {
    id: "landing-plus-app",
    label: "落地页 + 产品",
    description: "适合先解释价值，再进入产品证明的展示原型。",
  },
];

export const prototypeTemplateOptions: Array<{
  id: PrototypeTemplateId;
  label: string;
  description: string;
}> = [
  {
    id: "auto",
    label: "自动模板",
    description: "按原型类型选择最贴近的 OpenDesign 风格模板。",
  },
  {
    id: "od-web-prototype",
    label: "OpenDesign Web Prototype",
    description: "多屏 HTML、manifest、handoff、设计 token 优先。",
  },
  {
    id: "ai-workspace",
    label: "AI Workspace",
    description: "左侧输入/过程，中间产物，右侧上下文的生成工作流。",
  },
  {
    id: "mobile-flow",
    label: "Mobile Flow",
    description: "手机画布、底部导航、步骤反馈和轻量表单。",
  },
  {
    id: "review-wizard",
    label: "Review Wizard",
    description: "PRD 要点、步骤、检查项、确认动作的评审向导。",
  },
  {
    id: "landing-product-proof",
    label: "Landing + Product Proof",
    description: "价值主张与可检查产品界面并列呈现。",
  },
];

function escapeHtml(value: string | number | undefined | null) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value: string, fallback = "screen") {
  const ascii = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii) return ascii;

  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return `${fallback}-${hash.toString(36)}`;
}

function getStyleString(pack: ProductPack, id: string, defaultStyles = "") {
  const custom = pack.prototype.stylesOverride?.[id];

  if (!custom) return defaultStyles ? `style="${defaultStyles}"` : "";

  const customStr = Object.entries(custom)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${value}`)
    .join(";");

  return `style="${defaultStyles}${defaultStyles && !defaultStyles.endsWith(";") ? ";" : ""}${customStr}"`;
}

function summarizePack(pack: ProductPack) {
  return [
    pack.sourceIdea,
    pack.project.title,
    pack.project.oneLiner,
    pack.project.positioning,
    pack.project.valueProposition,
    pack.prd.objective,
    pack.prd.coreFeatures.join(" "),
    pack.prd.mvpScope.join(" "),
    pack.prototype.userFlow,
    pack.prototype.screens.map((screen) => `${screen.name} ${screen.goal}`).join(" "),
  ].join(" ");
}

export function inferPrototypeKind(
  pack: ProductPack,
  requested?: PrototypeKind | "auto",
): PrototypeKind {
  if (requested && requested !== "auto") return requested;

  const text = summarizePack(pack);

  if (/移动|手机|app|小程序|mobile|ios|android/i.test(text)) return "mobile-flow";
  if (/官网|落地页|landing|waitlist|预约|注册转化|市场页/i.test(text)) return "landing-plus-app";
  if (/编辑|生成|写作|画布|工作台|agent|ai|prompt|文档|原型/i.test(text)) return "ai-editor";
  if (/排班|库存|工单|履约|门店|crm|续费|任务|运营|审批|订单|客服/i.test(text)) return "ops-console";
  if (/配置|申请|开户|审核|向导|步骤|onboarding|wizard/i.test(text)) return "wizard";

  return "web-dashboard";
}

function resolveTemplateId(
  kind: PrototypeKind,
  requested?: PrototypeTemplateId,
): PrototypeTemplateId {
  if (requested && requested !== "auto") return requested;

  if (kind === "mobile-flow") return "mobile-flow";
  if (kind === "wizard") return "review-wizard";
  if (kind === "landing-plus-app") return "landing-product-proof";
  if (kind === "ai-editor") return "ai-workspace";

  return "od-web-prototype";
}

function screenPath(screen: ProductPack["prototype"]["screens"][number], index: number) {
  return `screens/${String(index + 1).padStart(2, "0")}-${slugify(screen.name, "screen")}.html`;
}

export function getPrototypeScreenPath(pack: ProductPack, index: number) {
  const screen = pack.prototype.screens[index];

  return screen ? screenPath(screen, index) : "screens/01-screen.html";
}

function templateLabel(templateId: PrototypeTemplateId) {
  return prototypeTemplateOptions.find((item) => item.id === templateId)?.label ?? templateId;
}

function kindLabel(kind: PrototypeKind) {
  return prototypeKindOptions.find((item) => item.id === kind)?.label ?? kind;
}

export function buildPrototypeBrief(
  pack: ProductPack,
  options: PrototypeGenerationOptions = {},
): PrototypeGenerationBrief {
  const kind = inferPrototypeKind(pack, options.kind);
  const templateId = resolveTemplateId(kind, options.templateId);
  const designSystem = options.designSystem ?? "PM Studio DESIGN.md";
  const designIntent =
    "像 OpenDesign 一样先冻结设计系统和模板，再输出可检查的多文件原型。index.html 只做 artifact launcher；每个用户可见 screen 单独生成 HTML 文件，避免把所有内容塞进同一个业务工作台模板。";

  return {
    schemaVersion: "pmstudio.prototype-brief.v1",
    kind,
    templateId,
    designSystem,
    title: pack.project.title,
    productSignal: pack.project.oneLiner,
    userFlow: pack.prototype.userFlow,
    screens: pack.prototype.screens,
    prdLinks: pack.prototype.prdLinks,
    designIntent,
    prompt: [
      `Generate a ${kindLabel(kind)} prototype for ${pack.project.title}.`,
      `Use template: ${templateLabel(templateId)}.`,
      `Use design system: ${designSystem}.`,
      "Deliver an OpenDesign-style artifact bundle: index.html launcher, independent screen HTML files, data.json, design-manifest.json, and DESIGN-HANDOFF.md.",
      "Do not reuse a generic business-dashboard template unless the PRD clearly asks for it.",
      "Every screen must map to a PRD requirement, a user task, or a measurable workflow step.",
      "Keep generated product UI free of OpenDesign chrome; only the surrounding PM Studio workspace may show generation metadata.",
      "",
      `Product idea: ${pack.sourceIdea}`,
      `PRD objective: ${pack.prd.objective}`,
      `User flow: ${pack.prototype.userFlow}`,
    ].join("\n"),
  };
}

function buildBridgeScript(pack: ProductPack, isEditing: boolean) {
  return `
    <script>
      (function() {
        window.__PM_STUDIO_PROTOTYPE__ = ${JSON.stringify({
          artifactId: pack.prototype.liveArtifact.id,
          productPackId: pack.id,
        })};

        function getClickedElement(event) {
          if (!event.target) return null;
          if (event.target.nodeType === 1) return event.target;
          return event.target.parentElement || null;
        }

        function normalizeArtifactPath(rawPath) {
          if (!rawPath) return null;
          if (/^[a-z][a-z0-9+.-]*:/i.test(rawPath) || rawPath.charAt(0) === '#') return null;

          var clean = rawPath
            .split('#')[0]
            .split('?')[0]
            .replace(/^\\.\\/+/g, '')
            .replace(/^\\/+/, '')
            .replace(/^prototype\\//, '');

          if (!clean || clean.indexOf('../') === 0) return null;
          if (clean === 'index.html') return clean;
          if (clean === 'data.json') return clean;
          if (clean === 'design-manifest.json') return clean;
          if (clean === 'DESIGN-HANDOFF.md') return clean;
          if (clean.indexOf('screens/') === 0) return clean;
          if (/^[^/]+\\.html$/i.test(clean)) return 'screens/' + clean;
          return null;
        }

        document.addEventListener('click', function(event) {
          const clicked = getClickedElement(event);
          if (!clicked) return;

          const fileTarget = clicked.closest('[data-prototype-file]');
          const link = clicked.closest('a[href]');
          const filePath = fileTarget
            ? normalizeArtifactPath(fileTarget.getAttribute('data-prototype-file'))
            : null;
          const linkPath = link ? normalizeArtifactPath(link.getAttribute('href')) : null;
          const targetPath = filePath || linkPath;

          if (!targetPath) return;

          event.preventDefault();
          event.stopPropagation();
          window.parent.postMessage({
            type: 'prototype-file-open',
            path: targetPath
          }, '*');
        }, true);

        if (!${isEditing}) {
          document.addEventListener('click', function(event) {
            const clicked = getClickedElement(event);
            const action = clicked ? clicked.closest('[data-action-button]') : null;
            if (!action) return;
            event.preventDefault();
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
            outline: 2px solid ${token.accent} !important;
            outline-offset: 2px;
          }
          .od-selected {
            outline: 2px solid ${token.success} !important;
            outline-offset: 2px;
          }
        \`;
        document.head.appendChild(style);

        let selectedEl = null;

        document.addEventListener('click', function(event) {
          const clicked = getClickedElement(event);
          const target = clicked ? clicked.closest('[data-od-id]') : null;
          if (!target) return;

          event.preventDefault();
          event.stopPropagation();

          if (selectedEl) selectedEl.classList.remove('od-selected');
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
}

function baseStyle(extra = "") {
  return `
    <style>
      :root {
        --bg: ${token.bg};
        --warm: ${token.warm};
        --surface: ${token.surface};
        --fg: ${token.fg};
        --muted: ${token.muted};
        --border: ${token.border};
        --accent: ${token.accent};
        --accent-soft: ${token.accentSoft};
        --success: ${token.success};
        --success-soft: ${token.successSoft};
        --warning: ${token.warning};
        --radius: 8px;
        --shadow: 0 18px 42px rgba(17, 17, 17, 0.07);
        --font-body: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--fg);
        font-family: var(--font-body);
        line-height: 1.5;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
      }
      button, input, textarea { font: inherit; }
      a { color: inherit; text-decoration: none; }
      .od-chip {
        display: inline-flex;
        align-items: center;
        min-height: 26px;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--surface);
        color: var(--muted);
        padding: 5px 8px;
        font-size: 12px;
        font-weight: 600;
      }
      .od-action {
        display: inline-flex;
        min-height: 36px;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 1px solid var(--fg);
        border-radius: var(--radius);
        background: var(--fg);
        color: var(--surface);
        cursor: pointer;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 700;
        transition: transform .16s ease, background-color .16s ease, border-color .16s ease;
      }
      .od-action:hover { transform: translateY(-1px); }
      .od-action.secondary {
        border-color: var(--border);
        background: var(--surface);
        color: var(--fg);
      }
      .od-action[data-active="true"] {
        border-color: var(--accent);
        background: var(--accent);
      }
      .od-section-title {
        margin: 0;
        font-size: 14px;
        font-weight: 760;
      }
      .od-caption {
        color: var(--muted);
        font-size: 12px;
      }
      ${extra}
    </style>
  `;
}

function screenPrdLink(pack: ProductPack, screenName: string, index: number) {
  return (
    pack.prototype.prdLinks.find((link) => link.screen === screenName) ??
    pack.prototype.prdLinks[index] ?? {
      requirement: pack.prd.coreFeatures[index] ?? pack.prd.objective,
      rationale: "该页面承接 PRD 中的核心任务和关键成功路径。",
      screen: screenName,
    }
  );
}

function componentChips(pack: ProductPack, screenIndex: number, components: string[]) {
  return components
    .map((component, componentIndex) => {
      const id = `screen-${screenIndex}-comp-${componentIndex}`;

      return `<span class="od-chip" data-od-id="${id}" ${getStyleString(pack, id)}>${escapeHtml(component)}</span>`;
    })
    .join("");
}

function metricRows(pack: ProductPack) {
  return pack.prd.successMetrics
    .slice(0, 3)
    .map(
      (metric, index) => `
        <div class="metric-row">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${escapeHtml(metric)}</strong>
        </div>`,
    )
    .join("");
}

function renderAiWorkspaceScreen(
  pack: ProductPack,
  brief: PrototypeGenerationBrief,
  screenIndex: number,
  isEditing: boolean,
) {
  const screen = pack.prototype.screens[screenIndex] ?? pack.prototype.screens[0];
  const link = screenPrdLink(pack, screen.name, screenIndex);
  const screenId = `screen-${screenIndex}`;
  const nameId = `screen-${screenIndex}-name`;
  const goalId = `screen-${screenIndex}-goal`;
  const actionId = `screen-${screenIndex}-primaryAction`;
  const screenCount = Math.max(pack.prototype.screens.length, 1);
  const nextScreenIndex = (screenIndex + 1) % screenCount;
  const nextScreen = pack.prototype.screens[nextScreenIndex] ?? pack.prototype.screens[0] ?? screen;
  const nextScreenFile = screenPath(nextScreen, nextScreenIndex);

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(screen.name)} · ${escapeHtml(pack.project.title)}</title>
  ${baseStyle(`
    .workspace { min-height: 100vh; display: grid; grid-template-columns: 270px minmax(0, 1fr) 312px; background: var(--bg); }
    .pane { min-width: 0; border-right: 1px solid var(--border); background: color-mix(in oklch, var(--surface) 82%, transparent); }
    .left { padding: 18px 16px; display: flex; flex-direction: column; gap: 18px; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 780; }
    .mark { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; background: var(--fg); color: var(--surface); font-size: 12px; }
    .flow-list { display: grid; gap: 8px; }
    .flow-item { display: grid; grid-template-columns: 24px minmax(0,1fr); gap: 8px; border: 1px solid transparent; border-radius: var(--radius); padding: 8px; color: var(--muted); font-size: 13px; }
    .flow-item.active { border-color: var(--fg); background: var(--fg); color: var(--surface); }
    .flow-item span { color: inherit; opacity: .62; font-size: 11px; font-variant-numeric: tabular-nums; }
    .prompt-box { margin-top: auto; border: 1px solid var(--border); border-radius: 10px; background: var(--warm); padding: 12px; }
    .prompt-box p { margin: 6px 0 0; color: var(--muted); font-size: 12px; line-height: 1.55; }
    .main { min-width: 0; padding: 22px; }
    .topline { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
    .topline p { margin: 0; color: var(--muted); font-size: 13px; }
    .screen-frame { min-height: calc(100vh - 86px); border: 1px solid var(--border); border-radius: 14px; background: var(--surface); box-shadow: var(--shadow); overflow: hidden; }
    .screen-hero { padding: 22px; border-bottom: 1px solid var(--border); background: linear-gradient(180deg, var(--surface), var(--warm)); }
    .screen-hero h1 { max-width: 780px; margin: 8px 0 0; font-size: 30px; line-height: 1.12; letter-spacing: 0; }
    .screen-hero p { max-width: 760px; margin: 10px 0 0; color: var(--muted); font-size: 14px; line-height: 1.65; }
    .screen-body { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(280px,.85fr); gap: 16px; padding: 18px; }
    .module { border: 1px solid var(--border); border-radius: 10px; background: var(--surface); padding: 15px; }
    .module + .module { margin-top: 12px; }
    .module-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
    .component-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .draft-card { border: 1px solid var(--border); border-radius: 10px; background: var(--warm); padding: 14px; }
    .draft-card p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.62; }
    .right { border-right: 0; border-left: 1px solid var(--border); padding: 18px 16px; }
    .trace { border: 1px solid var(--border); border-radius: 10px; background: var(--surface); padding: 13px; }
    .trace p { margin: 6px 0 0; color: var(--muted); font-size: 12px; line-height: 1.55; }
    .metric-row { display: grid; grid-template-columns: 28px minmax(0,1fr); gap: 8px; border-top: 1px solid var(--border); padding: 10px 0; }
    .metric-row span { color: var(--accent); font-size: 11px; font-weight: 800; }
    .metric-row strong { font-size: 12px; line-height: 1.45; }
    @media (max-width: 980px) { .workspace { grid-template-columns: 1fr; } .left, .right { display: none; } .screen-body { grid-template-columns: 1fr; } }
  `)}
</head>
<body>
  <div class="workspace">
    <aside class="pane left">
      <div class="brand"><span class="mark">PM</span><span>${escapeHtml(pack.project.title)}</span></div>
      <div>
        <p class="od-caption">Prototype flow</p>
        <div class="flow-list">
          ${pack.prototype.screens
            .map(
              (item, index) => `
                <a class="flow-item ${index === screenIndex ? "active" : ""}" href="./${escapeHtml(
                  screenPath(item, index).replace(/^screens\//, ""),
                )}">
                  <span>${String(index + 1).padStart(2, "0")}</span>
                  <strong>${escapeHtml(item.name)}</strong>
                </a>`,
            )
            .join("")}
        </div>
      </div>
      <div class="prompt-box">
        <strong>生成 Brief</strong>
        <p>${escapeHtml(brief.designIntent)}</p>
      </div>
    </aside>

    <main class="main">
      <div class="topline">
        <p>${escapeHtml(kindLabel(brief.kind))} · ${escapeHtml(templateLabel(brief.templateId))}</p>
        <button class="od-action secondary" data-action-button="true" data-prototype-file="${escapeHtml(
          nextScreenFile,
        )}" data-label="打开下一屏">打开下一屏：${escapeHtml(nextScreen.name)}</button>
      </div>
      <section class="screen-frame" data-od-id="${screenId}" ${getStyleString(pack, screenId)}>
        <div class="screen-hero">
          <span class="od-chip">${escapeHtml(link.requirement)}</span>
          <h1 data-od-id="${nameId}" ${getStyleString(pack, nameId)}>${escapeHtml(screen.name)}</h1>
          <p data-od-id="${goalId}" ${getStyleString(pack, goalId)}>${escapeHtml(screen.goal)}</p>
          <div style="margin-top: 16px;">
            <button class="od-action" type="button" data-action-button="true" data-label="${escapeHtml(
              screen.primaryAction,
            )}" data-od-id="${actionId}" ${getStyleString(pack, actionId)}>${escapeHtml(screen.primaryAction)}</button>
          </div>
        </div>
        <div class="screen-body">
          <div>
            <section class="module">
              <div class="module-head">
                <h2 class="od-section-title">核心界面模块</h2>
                <span class="od-caption">from PRD components</span>
              </div>
              <div class="component-grid">${componentChips(pack, screenIndex, screen.components)}</div>
            </section>
            <section class="module">
              <div class="module-head">
                <h2 class="od-section-title">当前产物草稿</h2>
                <span class="od-caption">editable output</span>
              </div>
              <div class="draft-card">
                <p>${escapeHtml(pack.project.valueProposition)}</p>
              </div>
            </section>
          </div>
          <aside>
            <section class="module">
              <div class="module-head">
                <h2 class="od-section-title">成功标准</h2>
                <span class="od-caption">KR</span>
              </div>
              ${metricRows(pack)}
            </section>
            <section class="module">
              <div class="module-head">
                <h2 class="od-section-title">PRD 映射</h2>
                <span class="od-caption">trace</span>
              </div>
              <div class="trace">
                <strong>${escapeHtml(link.screen)}</strong>
                <p>${escapeHtml(link.rationale)}</p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>

    <aside class="pane right">
      <section class="trace">
        <strong>PRD Objective</strong>
        <p>${escapeHtml(pack.prd.objective)}</p>
      </section>
      <div style="margin-top: 14px;">${metricRows(pack)}</div>
    </aside>
  </div>
  ${buildBridgeScript(pack, isEditing)}
</body>
</html>`;
}

function renderMobileScreen(
  pack: ProductPack,
  brief: PrototypeGenerationBrief,
  screenIndex: number,
  isEditing: boolean,
) {
  const screen = pack.prototype.screens[screenIndex] ?? pack.prototype.screens[0];
  const link = screenPrdLink(pack, screen.name, screenIndex);
  const screenId = `screen-${screenIndex}`;
  const nameId = `screen-${screenIndex}-name`;
  const goalId = `screen-${screenIndex}-goal`;
  const actionId = `screen-${screenIndex}-primaryAction`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(screen.name)} · ${escapeHtml(pack.project.title)}</title>
  ${baseStyle(`
    body { min-height: 100vh; display: grid; place-items: center; padding: 28px; }
    .phone { width: min(390px, 100%); min-height: 780px; border: 10px solid var(--fg); border-radius: 36px; background: var(--surface); box-shadow: var(--shadow); overflow: hidden; }
    .phone-bar { height: 48px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border); background: var(--warm); }
    .notch { width: 88px; height: 8px; border-radius: 999px; background: color-mix(in oklch, var(--fg) 12%, transparent); }
    .screen { padding: 18px; }
    .screen h1 { margin: 12px 0 0; font-size: 26px; line-height: 1.12; letter-spacing: 0; }
    .screen p { margin: 9px 0 0; color: var(--muted); font-size: 14px; line-height: 1.62; }
    .component-list { margin-top: 18px; display: grid; gap: 10px; }
    .component-list .od-chip { justify-content: space-between; min-height: 44px; width: 100%; padding: 10px 12px; }
    .bottom { position: sticky; bottom: 0; display: grid; gap: 10px; border-top: 1px solid var(--border); background: color-mix(in oklch, var(--surface) 94%, transparent); padding: 14px 18px 18px; backdrop-filter: blur(12px); }
  `)}
</head>
<body>
  <main class="phone" data-od-id="${screenId}" ${getStyleString(pack, screenId)}>
    <div class="phone-bar"><span class="notch"></span></div>
    <section class="screen">
      <span class="od-chip">${escapeHtml(kindLabel(brief.kind))}</span>
      <h1 data-od-id="${nameId}" ${getStyleString(pack, nameId)}>${escapeHtml(screen.name)}</h1>
      <p data-od-id="${goalId}" ${getStyleString(pack, goalId)}>${escapeHtml(screen.goal)}</p>
      <div class="component-list">${componentChips(pack, screenIndex, screen.components)}</div>
      <section style="margin-top:18px;border:1px solid var(--border);border-radius:10px;background:var(--warm);padding:13px;">
        <strong style="font-size:13px;">PRD link</strong>
        <p>${escapeHtml(link.requirement)}</p>
      </section>
    </section>
    <footer class="bottom">
      <button class="od-action" type="button" data-action-button="true" data-label="${escapeHtml(
        screen.primaryAction,
      )}" data-od-id="${actionId}" ${getStyleString(pack, actionId)}>${escapeHtml(screen.primaryAction)}</button>
      <span class="od-caption">${escapeHtml(link.rationale)}</span>
    </footer>
  </main>
  ${buildBridgeScript(pack, isEditing)}
</body>
</html>`;
}

function renderWizardScreen(
  pack: ProductPack,
  brief: PrototypeGenerationBrief,
  screenIndex: number,
  isEditing: boolean,
) {
  const screen = pack.prototype.screens[screenIndex] ?? pack.prototype.screens[0];
  const link = screenPrdLink(pack, screen.name, screenIndex);
  const screenId = `screen-${screenIndex}`;
  const nameId = `screen-${screenIndex}-name`;
  const goalId = `screen-${screenIndex}-goal`;
  const actionId = `screen-${screenIndex}-primaryAction`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(screen.name)} · ${escapeHtml(pack.project.title)}</title>
  ${baseStyle(`
    .shell { min-height: 100vh; padding: 26px; }
    .wizard { max-width: 1120px; margin: 0 auto; border: 1px solid var(--border); border-radius: 14px; background: var(--surface); box-shadow: var(--shadow); overflow: hidden; }
    .header { padding: 22px; border-bottom: 1px solid var(--border); background: var(--warm); }
    .header h1 { margin: 8px 0 0; font-size: 30px; line-height: 1.12; }
    .header p { max-width: 720px; margin: 10px 0 0; color: var(--muted); }
    .body { display: grid; grid-template-columns: 300px minmax(0,1fr); }
    .steps { border-right: 1px solid var(--border); padding: 18px; }
    .step { display: grid; grid-template-columns: 28px minmax(0,1fr); gap: 10px; border-radius: var(--radius); padding: 10px; color: var(--muted); }
    .step.active { background: var(--fg); color: var(--surface); }
    .step span { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 999px; background: color-mix(in oklch, currentColor 14%, transparent); font-size: 11px; font-weight: 800; }
    .content { padding: 20px; }
    .grid { display: grid; grid-template-columns: minmax(0,1fr) 280px; gap: 16px; }
    .module { border: 1px solid var(--border); border-radius: 10px; background: var(--surface); padding: 15px; }
    .component-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    @media (max-width: 860px) { .body, .grid { grid-template-columns: 1fr; } .steps { border-right: 0; border-bottom: 1px solid var(--border); } }
  `)}
</head>
<body>
  <main class="shell">
    <section class="wizard" data-od-id="${screenId}" ${getStyleString(pack, screenId)}>
      <header class="header">
        <span class="od-chip">${escapeHtml(templateLabel(brief.templateId))}</span>
        <h1 data-od-id="${nameId}" ${getStyleString(pack, nameId)}>${escapeHtml(screen.name)}</h1>
        <p data-od-id="${goalId}" ${getStyleString(pack, goalId)}>${escapeHtml(screen.goal)}</p>
      </header>
      <div class="body">
        <aside class="steps">
          ${pack.prototype.screens
            .map(
              (item, index) => `
                <div class="step ${index === screenIndex ? "active" : ""}">
                  <span>${index + 1}</span>
                  <strong>${escapeHtml(item.name)}</strong>
                </div>`,
            )
            .join("")}
        </aside>
        <section class="content">
          <div class="grid">
            <div class="module">
              <h2 class="od-section-title">本步骤输入和产出</h2>
              <div class="component-grid">${componentChips(pack, screenIndex, screen.components)}</div>
              <div style="margin-top:16px;">
                <button class="od-action" type="button" data-action-button="true" data-label="${escapeHtml(
                  screen.primaryAction,
                )}" data-od-id="${actionId}" ${getStyleString(pack, actionId)}>${escapeHtml(screen.primaryAction)}</button>
              </div>
            </div>
            <aside class="module">
              <h2 class="od-section-title">PRD 映射</h2>
              <p class="od-caption">${escapeHtml(link.requirement)}</p>
              <p class="od-caption">${escapeHtml(link.rationale)}</p>
            </aside>
          </div>
        </section>
      </div>
    </section>
  </main>
  ${buildBridgeScript(pack, isEditing)}
</body>
</html>`;
}

function renderLandingProductProofScreen(
  pack: ProductPack,
  brief: PrototypeGenerationBrief,
  screenIndex: number,
  isEditing: boolean,
) {
  const screen = pack.prototype.screens[screenIndex] ?? pack.prototype.screens[0];
  const link = screenPrdLink(pack, screen.name, screenIndex);
  const screenId = `screen-${screenIndex}`;
  const nameId = `screen-${screenIndex}-name`;
  const goalId = `screen-${screenIndex}-goal`;
  const actionId = `screen-${screenIndex}-primaryAction`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(screen.name)} · ${escapeHtml(pack.project.title)}</title>
  ${baseStyle(`
    .page { min-height: 100vh; }
    .hero { min-height: 62vh; display: grid; grid-template-columns: minmax(0, .95fr) minmax(320px,1.05fr); gap: 28px; align-items: center; max-width: 1180px; margin: 0 auto; padding: 56px 28px 36px; }
    .hero h1 { margin: 12px 0 0; font-size: clamp(38px, 6vw, 68px); line-height: 1.02; letter-spacing: 0; }
    .hero p { margin: 16px 0 0; color: var(--muted); font-size: 17px; line-height: 1.65; }
    .product-shot { border: 1px solid var(--border); border-radius: 14px; background: var(--surface); box-shadow: var(--shadow); padding: 16px; }
    .shot-top { display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
    .shot-body { display: grid; grid-template-columns: .9fr 1.1fr; gap: 12px; padding-top: 12px; }
    .module { border: 1px solid var(--border); border-radius: 10px; background: var(--warm); padding: 13px; }
    .component-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .proof { border-top: 1px solid var(--border); padding: 28px; }
    .proof-inner { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
    @media (max-width: 860px) { .hero, .shot-body, .proof-inner { grid-template-columns: 1fr; } }
  `)}
</head>
<body>
  <main class="page">
    <section class="hero" data-od-id="${screenId}" ${getStyleString(pack, screenId)}>
      <div>
        <span class="od-chip">${escapeHtml(pack.project.positioning)}</span>
        <h1 data-od-id="${nameId}" ${getStyleString(pack, nameId)}>${escapeHtml(screen.name)}</h1>
        <p data-od-id="${goalId}" ${getStyleString(pack, goalId)}>${escapeHtml(screen.goal)}</p>
        <div style="margin-top:22px;">
          <button class="od-action" type="button" data-action-button="true" data-label="${escapeHtml(
            screen.primaryAction,
          )}" data-od-id="${actionId}" ${getStyleString(pack, actionId)}>${escapeHtml(screen.primaryAction)}</button>
        </div>
      </div>
      <aside class="product-shot">
        <div class="shot-top">
          <strong>${escapeHtml(pack.project.title)}</strong>
          <span class="od-caption">${escapeHtml(templateLabel(brief.templateId))}</span>
        </div>
        <div class="shot-body">
          <div class="module">
            <h2 class="od-section-title">PRD link</h2>
            <p class="od-caption">${escapeHtml(link.requirement)}</p>
          </div>
          <div class="module">
            <h2 class="od-section-title">Product proof</h2>
            <div class="component-grid">${componentChips(pack, screenIndex, screen.components)}</div>
          </div>
        </div>
      </aside>
    </section>
    <section class="proof">
      <div class="proof-inner">
        ${pack.prd.successMetrics
          .slice(0, 3)
          .map(
            (metric) => `<article class="module"><h2 class="od-section-title">Proof</h2><p class="od-caption">${escapeHtml(
              metric,
            )}</p></article>`,
          )
          .join("")}
      </div>
    </section>
  </main>
  ${buildBridgeScript(pack, isEditing)}
</body>
</html>`;
}

function renderScreenHtml(
  pack: ProductPack,
  brief: PrototypeGenerationBrief,
  screenIndex: number,
  isEditing: boolean,
) {
  if (brief.kind === "mobile-flow" || brief.templateId === "mobile-flow") {
    return renderMobileScreen(pack, brief, screenIndex, isEditing);
  }

  if (brief.kind === "wizard" || brief.templateId === "review-wizard") {
    return renderWizardScreen(pack, brief, screenIndex, isEditing);
  }

  if (brief.kind === "landing-plus-app" || brief.templateId === "landing-product-proof") {
    return renderLandingProductProofScreen(pack, brief, screenIndex, isEditing);
  }

  return renderAiWorkspaceScreen(pack, brief, screenIndex, isEditing);
}

function renderIndexHtml(pack: ProductPack, brief: PrototypeGenerationBrief) {
  const screenCards = pack.prototype.screens
    .map((screen, index) => {
      const path = screenPath(screen, index);
      const link = screenPrdLink(pack, screen.name, index);

      return `
        <article class="screen-card">
          <div class="card-index">${String(index + 1).padStart(2, "0")}</div>
          <div>
            <h2>${escapeHtml(screen.name)}</h2>
            <p>${escapeHtml(screen.goal)}</p>
            <div class="component-row">${componentChips(pack, index, screen.components.slice(0, 4))}</div>
            <div class="trace-line">${escapeHtml(link.requirement)}</div>
          </div>
          <a class="open-link" href="./${escapeHtml(path)}">打开 screen</a>
        </article>`;
    })
    .join("");

  const prdLinks = pack.prototype.prdLinks
    .map(
      (link) => `
        <tr>
          <td>${escapeHtml(link.requirement)}</td>
          <td>${escapeHtml(link.screen)}</td>
          <td>${escapeHtml(link.rationale)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pack.project.title)} Prototype Artifact</title>
  ${baseStyle(`
    .launcher { min-height: 100vh; padding: 24px; }
    .shell { max-width: 1240px; margin: 0 auto; }
    .hero { display: grid; grid-template-columns: minmax(0,1.05fr) minmax(300px,.95fr); gap: 18px; align-items: stretch; }
    .hero-main, .brief-card, .screen-card, .table-wrap, .handoff { border: 1px solid var(--border); border-radius: 12px; background: var(--surface); box-shadow: var(--shadow); }
    .hero-main { padding: 24px; min-height: 280px; display: flex; flex-direction: column; justify-content: space-between; }
    .hero-main h1 { max-width: 820px; margin: 12px 0 0; font-size: clamp(32px, 5vw, 58px); line-height: 1.04; letter-spacing: 0; }
    .hero-main p { max-width: 760px; margin: 14px 0 0; color: var(--muted); font-size: 15px; line-height: 1.7; }
    .brief-card { padding: 18px; display: grid; gap: 12px; }
    .brief-row { border-top: 1px solid var(--border); padding-top: 12px; }
    .brief-row:first-child { border-top: 0; padding-top: 0; }
    .brief-row strong { display: block; font-size: 13px; }
    .brief-row span { display: block; margin-top: 4px; color: var(--muted); font-size: 12px; line-height: 1.5; }
    .section { margin-top: 18px; }
    .section-head { display: flex; align-items: end; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
    .section-head h2 { margin: 0; font-size: 17px; }
    .screen-grid { display: grid; gap: 10px; }
    .screen-card { display: grid; grid-template-columns: 48px minmax(0,1fr) auto; gap: 14px; align-items: start; padding: 15px; box-shadow: none; }
    .card-index { color: var(--accent); font-size: 12px; font-weight: 820; font-variant-numeric: tabular-nums; }
    .screen-card h2 { margin: 0; font-size: 16px; }
    .screen-card p { margin: 6px 0 0; color: var(--muted); font-size: 13px; line-height: 1.58; }
    .component-row { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
    .trace-line { margin-top: 10px; color: var(--muted); font-size: 12px; line-height: 1.5; }
    .open-link { min-height: 34px; border: 1px solid var(--fg); border-radius: var(--radius); background: var(--fg); color: var(--surface); padding: 8px 10px; font-size: 12px; font-weight: 700; }
    .table-wrap { overflow: hidden; box-shadow: none; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border-bottom: 1px solid var(--border); padding: 10px 12px; text-align: left; vertical-align: top; }
    th { background: var(--warm); color: var(--muted); font-size: 11px; }
    td { color: #454545; line-height: 1.55; }
    .handoff { padding: 16px; box-shadow: none; }
    .handoff code { color: var(--accent); }
    @media (max-width: 880px) { .hero, .screen-card { grid-template-columns: 1fr; } .open-link { width: fit-content; } }
  `)}
</head>
<body>
  <main class="launcher">
    <div class="shell">
      <section class="hero">
        <div class="hero-main">
          <div>
            <span class="od-chip">Generated Prototype Artifact</span>
            <h1>${escapeHtml(pack.project.title)}</h1>
            <p>${escapeHtml(pack.project.oneLiner)}</p>
          </div>
          <div>
            <a class="od-action" href="./${escapeHtml(getPrototypeScreenPath(pack, 0))}">打开首屏</a>
            <a class="od-action secondary" href="./design-manifest.json">查看 manifest</a>
          </div>
        </div>
        <aside class="brief-card">
          <div class="brief-row">
            <strong>Prototype brief</strong>
            <span>${escapeHtml(brief.designIntent)}</span>
          </div>
          <div class="brief-row">
            <strong>原型类型</strong>
            <span>${escapeHtml(kindLabel(brief.kind))}</span>
          </div>
          <div class="brief-row">
            <strong>设计模板</strong>
            <span>${escapeHtml(templateLabel(brief.templateId))}</span>
          </div>
          <div class="brief-row">
            <strong>User flow</strong>
            <span data-od-id="prototype-userFlow">${escapeHtml(pack.prototype.userFlow)}</span>
          </div>
        </aside>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Screen files</h2>
          <span class="od-caption">index.html 是 launcher；screen 才是用户界面。</span>
        </div>
        <div class="screen-grid">${screenCards}</div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>PRD-to-Prototype traceability</h2>
          <span class="od-caption">需求驱动 screen / IA / user flow</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>PRD 要点</th><th>Screen</th><th>生成理由</th></tr></thead>
            <tbody>${prdLinks}</tbody>
          </table>
        </div>
      </section>

      <section class="section handoff">
        <strong>Artifact contract</strong>
        <p class="od-caption">继续实现时先读 <code>design-manifest.json</code> 和 <code>DESIGN-HANDOFF.md</code>，再进入具体 screen 文件。</p>
      </section>
    </div>
  </main>
  ${buildBridgeScript(pack, false)}
</body>
</html>`;
}

function buildPrototypeData(pack: ProductPack, brief: PrototypeGenerationBrief) {
  return {
    project: pack.project,
    prd: {
      objective: pack.prd.objective,
      coreFeatures: pack.prd.coreFeatures,
      mvpScope: pack.prd.mvpScope,
      successMetrics: pack.prd.successMetrics,
    },
    prototype: {
      brief,
      userFlow: pack.prototype.userFlow,
      screens: pack.prototype.screens,
      prdLinks: pack.prototype.prdLinks,
      openDesignPrompt: pack.prototype.openDesignPrompt,
    },
    research: pack.research,
    summary: pack.summary,
  };
}

function buildDesignManifest(pack: ProductPack, brief: PrototypeGenerationBrief, files: string[]) {
  const htmlFiles = files.filter((file) => /\.html?$/i.test(file));
  const screenFiles = htmlFiles.filter((file) => file !== "index.html");

  return {
    schema: "open-design.design-manifest.v1",
    title: `${pack.project.title} prototype`,
    kind: "html",
    entryFile: "index.html",
    sourceFiles: {
      all: files,
      html: htmlFiles,
      css: [],
      scriptsAndComponents: [],
      assets: [],
    },
    screens: [
      {
        file: "index.html",
        role: "launcher-overview",
        implementationNote:
          "Use this file to understand artifact scope only; implement user-facing routes from screens/*.html.",
      },
      ...screenFiles.map((file, index) => ({
        file,
        role: "product-screen",
        implementationNote: `Preserve the ${pack.prototype.screens[index]?.name ?? "screen"} visual hierarchy, responsive behavior, and PRD trace.`,
      })),
    ],
    prototypeBrief: {
      schemaVersion: brief.schemaVersion,
      kind: brief.kind,
      templateId: brief.templateId,
      designSystem: brief.designSystem,
      userFlow: brief.userFlow,
    },
    screenFilePolicy: {
      mode: "screen-file-first",
      entryFileRole: "launcher-overview",
      rules: [
        "Each distinct user-facing screen must remain its own HTML file or route.",
        "Do not treat index.html as the combined final UI when multiple screen files exist.",
        "Map PRD requirements to screen goals before adding or deleting screens.",
        "Keep product UI free of PM Studio or OpenDesign preview chrome.",
      ],
    },
    tokens: {
      source: ["index.html", ...screenFiles],
      required: [
        "background",
        "surface",
        "foreground",
        "muted text",
        "border",
        "accent",
        "radius",
        "spacing",
        "type scale",
      ],
    },
    interactions: {
      source: screenFiles,
      requiredStates: ["default", "hover", "focus", "active", "disabled", "loading", "empty", "error", "success"],
      requiredBehaviors: ["primary action", "screen navigation", "editable artifact output", "PRD trace review"],
    },
    responsiveViewports: [
      { name: "mobile-standard", width: 390, height: 844, category: "mobile", mustAvoidHorizontalScroll: true },
      { name: "tablet-portrait", width: 820, height: 1180, category: "tablet", mustAvoidHorizontalScroll: true },
      { name: "desktop", width: 1440, height: 900, category: "desktop", mustAvoidHorizontalScroll: true },
    ],
    implementationChecklist: [
      "Open design-manifest.json and DESIGN-HANDOFF.md before coding.",
      "Open index.html only as launcher context, then inspect every screens/*.html file.",
      "Extract and freeze tokens before framework implementation.",
      "Implement real domain modules and states, not generic dashboard cards.",
      "Validate desktop/tablet/mobile previews with no horizontal overflow.",
    ],
  };
}

function buildDesignHandoff(pack: ProductPack, brief: PrototypeGenerationBrief, files: string[]) {
  const screenFiles = pack.prototype.screens
    .map((screen, index) => `- \`${screenPath(screen, index)}\`: ${screen.name} — ${screen.goal}`)
    .join("\n");

  return `# ${pack.project.title} Prototype Handoff

This artifact bundle follows an OpenDesign-style generation flow: design system -> prototype brief -> template -> screen files -> manifest.

## Source Of Truth

- Primary entry: \`index.html\`
- Design manifest: \`design-manifest.json\`
- Structured data: \`data.json\`
- Template: ${templateLabel(brief.templateId)}
- Prototype type: ${kindLabel(brief.kind)}
- Design system: ${brief.designSystem}

## Screen Files

${screenFiles}

## PRD Linkage

${pack.prototype.prdLinks
  .map((link) => `- ${link.requirement} -> ${link.screen}: ${link.rationale}`)
  .join("\n")}

## Implementation Rules

- Treat \`index.html\` as a launcher/overview, not the final combined product UI.
- Implement every screen file as its own route or independently inspectable surface.
- Preserve the PM Studio visual token roles: warm workspace background, white artifact surfaces, black primary text/actions, blue active states, green completion states.
- Keep generated product UI free of OpenDesign or PM Studio process chrome.
- If the PRD changes, update the brief first, then update screen files, IA, and traceability together.

## Included Files

${files.map((file) => `- \`${file}\``).join("\n")}
`;
}

export function buildPrototypeArtifactBundle(
  pack: ProductPack,
  options: PrototypeGenerationOptions = {},
  isEditing = false,
): PrototypeArtifactBundle {
  const brief = buildPrototypeBrief(pack, options);
  const screenFiles = pack.prototype.screens.map((screen, index) => screenPath(screen, index));
  const filePaths = ["index.html", ...screenFiles, "data.json", "design-manifest.json", "DESIGN-HANDOFF.md"];
  const data = buildPrototypeData(pack, brief);
  const manifest = buildDesignManifest(pack, brief, filePaths);
  const handoff = buildDesignHandoff(pack, brief, filePaths);
  const files: PrototypeArtifactFile[] = [
    {
      path: "index.html",
      name: "index.html",
      mimeType: "text/html",
      purpose: "artifact launcher and screen map",
      editable: true,
      body: renderIndexHtml(pack, brief),
    },
    ...pack.prototype.screens.map((screen, index) => ({
      path: screenPath(screen, index),
      name: `${String(index + 1).padStart(2, "0")}-${slugify(screen.name, "screen")}.html`,
      mimeType: "text/html",
      purpose: `user-facing prototype screen: ${screen.name}`,
      editable: true,
      body: renderScreenHtml(pack, brief, index, isEditing),
    })),
    {
      path: "data.json",
      name: "data.json",
      mimeType: "application/json",
      purpose: "structured product, PRD, prototype, and research data",
      editable: true,
      body: JSON.stringify(data, null, 2),
    },
    {
      path: "design-manifest.json",
      name: "design-manifest.json",
      mimeType: "application/json",
      purpose: "OpenDesign-style implementation manifest",
      editable: true,
      body: JSON.stringify(manifest, null, 2),
    },
    {
      path: "DESIGN-HANDOFF.md",
      name: "DESIGN-HANDOFF.md",
      mimeType: "text/markdown",
      purpose: "implementation handoff for design-to-code continuation",
      editable: true,
      body: handoff,
    },
  ];

  return {
    schemaVersion: "pmstudio.prototype-artifact-bundle.v1",
    artifactId: "prototype",
    projectId: pack.id,
    entryFile: "index.html",
    brief,
    files,
  };
}

export function renderPrototypeFile(
  path: string,
  pack: ProductPack,
  options: PrototypeGenerationOptions = {},
  isEditing = false,
) {
  const normalizedPath = path.replace(/^prototype\//, "");
  const bundle = buildPrototypeArtifactBundle(pack, options, isEditing);

  return bundle.files.find((file) => file.path === normalizedPath)?.body ?? bundle.files[0].body;
}

export function generatePrototypeHtml(
  pack: ProductPack,
  isEditing: boolean,
  options: PrototypeGenerationOptions = {},
) {
  return renderPrototypeFile(getPrototypeScreenPath(pack, 0), pack, options, isEditing);
}
