"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Code2,
  Monitor,
  PanelTop,
  RefreshCw,
  Smartphone,
  Tablet,
  MousePointer2,
  Type,
  Paintbrush,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";

import type { ProductPack } from "@/lib/product-pack";
import { cn } from "@/lib/utils";

const viewports = [
  { label: "桌面", param: "desktop", icon: Monitor, width: 1024, height: 550, size: "1200px" },
  { label: "平板", param: "tablet", icon: Tablet, width: 820, height: 700, size: "820px" },
  { label: "手机", param: "mobile", icon: Smartphone, width: 390, height: 750, size: "390px" },
];

function getViewportFromParam(viewport?: string) {
  return viewports.find((item) => item.param === viewport) ?? viewports[0];
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

  const bridgeScript = `
    <script>
      (function() {
        if (!${isEditing}) return;
        
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

          window.parent.postMessage({
            type: 'element-selected',
            id: target.getAttribute('data-od-id'),
            tagName: target.tagName.toLowerCase(),
            textContent: target.textContent.trim(),
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
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; color: #111827; }
    main { max-width: 1120px; margin: 0 auto; padding: 24px 16px; }
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
      <div class="eyebrow" data-od-id="eyebrow" ${getStyleString("eyebrow", "")}>AI 交互原型</div>
      <h1 data-od-id="${projectTitleId}" ${getStyleString(projectTitleId, "")}>${escapeHtml(pack.project.title)}</h1>
      <p class="flow" data-od-id="${userFlowId}" ${getStyleString(userFlowId, "")}>${escapeHtml(pack.prototype.userFlow)}</p>
    </section>
    <section class="grid">${screens}</section>
  </main>
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
  exportHref,
  isExporting,
  isEditing = false,
  onEditPrompt,
  onExportHtml,
  onRegenerate,
  productPack,
  onChange,
}: {
  activeViewport?: string;
  exportHref?: string;
  isExporting?: boolean;
  isEditing?: boolean;
  onEditPrompt?: () => void;
  onExportHtml?: () => void;
  onRegenerate?: () => void;
  productPack?: ProductPack;
  onChange?: (pack: ProductPack) => void;
}) {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [prevActiveViewport, setPrevActiveViewport] = useState(activeViewport);
  const [viewportParam, setViewportParam] = useState(activeViewport || "desktop");

  if (activeViewport !== prevActiveViewport) {
    setPrevActiveViewport(activeViewport);
    setViewportParam(activeViewport || "desktop");
  }

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedViewport = getViewportFromParam(viewportParam);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const measure = () => {
      setCanvasWidth(el.clientWidth);
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

  let scale = 1;
  if (selectedViewport.param !== "desktop" && canvasWidth) {
    const padding = 32;
    const availableWidth = canvasWidth - padding;
    if (availableWidth < selectedViewport.width) {
      scale = availableWidth / selectedViewport.width;
    }
  }

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

  const pack = productPack;
  if (!pack) {
    return <div className="p-8 text-center text-neutral-500">等待生成产品方案包...</div>;
  }

  const prototypeTitle = pack.prototype.liveArtifact.title || `${pack.project.title} Prototype`;
  const sandboxHtml = generateSandboxHtml(pack, isEditing);

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
    <div data-testid="prototype-container" className="min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-500">
            {isEditing ? "原型设计与编辑工作台" : "原型交付物"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-neutral-950">{prototypeTitle}</h2>
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-500">
              {selectedViewport.label} · {selectedViewport.size}
            </span>
          </div>
        </div>
        <div className="flex w-full overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-100 p-1 md:w-auto">
          {viewports.map((item) => {
            const Icon = item.icon;
            const active = item.param === selectedViewport.param;
            return (
              <button
                className={cn(
                  "flex h-8 flex-1 items-center justify-center gap-2 rounded-md px-3 text-xs font-medium text-neutral-500 transition hover:bg-white/70 hover:text-neutral-950 active:scale-[0.98] md:flex-none",
                  active && "bg-white text-neutral-950 shadow-sm ring-1 ring-black/5",
                )}
                key={item.label}
                onClick={() => setViewportParam(item.param)}
                type="button"
                role="tab"
                aria-selected={active}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
        {/* Sandbox Canvas */}
        <div
          ref={canvasRef}
          className="overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.04),transparent_32%),linear-gradient(135deg,#f3f4f6,#ffffff)] p-3 sm:p-5 flex items-center justify-center min-h-[500px]"
        >
          {selectedViewport.param === "desktop" ? (
            <div
              className="min-w-0 w-full max-w-5xl transition-all duration-500 ease-out shadow-2xl rounded-2xl border border-neutral-300 overflow-hidden bg-white"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2.5">
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
                className="w-full h-[550px] border-none bg-white"
                sandbox="allow-scripts"
              />
            </div>
          ) : (
            <div
              style={{
                width: `${selectedViewport.width * scale}px`,
                height: `${(selectedViewport.height + 40) * scale}px`,
                position: "relative",
                overflow: "hidden",
                transition: "width 0.3s ease-out, height 0.3s ease-out",
              }}
              className="shadow-2xl rounded-2xl border border-neutral-300 bg-white"
            >
              <div
                style={{
                  width: `${selectedViewport.width}px`,
                  height: `${selectedViewport.height + 40}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
                className="flex flex-col bg-white"
              >
                <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2.5 shrink-0">
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
                  style={{ width: `${selectedViewport.width}px`, height: `${selectedViewport.height}px` }}
                  className="border-none bg-white grow"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}
        </div>

        {/* Visual / Text Element Inspector */}
        {isEditing && (
          <div className="p-4 overflow-y-auto space-y-4 max-h-[600px] text-sm text-neutral-700 bg-neutral-50/50">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <span className="flex items-center gap-1.5 font-semibold text-neutral-900">
                <MousePointer2 className="h-4 w-4 text-[#12a7ff]" />
                原型元素检查器
              </span>
              {selectedElement && (
                <span className="text-[10px] font-mono bg-neutral-200 text-neutral-600 rounded px-1.5 py-0.5 uppercase">
                  {selectedElement.tagName}
                </span>
              )}
            </div>

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
                          const cIdx = parseInt(parts[3], 10);
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
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto border-t border-neutral-200 bg-white p-4 sm:justify-end">
        <button
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          onClick={onRegenerate}
          type="button"
        >
          <RefreshCw className="h-4 w-4" />
          重新生成
        </button>
        <button
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          onClick={onEditPrompt}
          type="button"
        >
          <PanelTop className="h-4 w-4" />
          编辑提示词
        </button>
        {onExportHtml ? (
          <button
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-neutral-950 px-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-400"
            disabled={isExporting}
            onClick={onExportHtml}
            type="button"
          >
            <Code2 className="h-4 w-4" />
            {isExporting ? "导出中" : "导出 HTML"}
          </button>
        ) : exportHref ? (
          <a
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-neutral-950 px-3 text-sm font-medium text-white transition hover:bg-black"
            href={exportHref}
          >
            <Code2 className="h-4 w-4" />
            导出 HTML
          </a>
        ) : (
          <button
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-neutral-950 px-3 text-sm font-medium text-white transition hover:bg-black"
            type="button"
          >
            <Code2 className="h-4 w-4" />
            导出 HTML
          </button>
        )}
      </div>
    </div>
  );
}
