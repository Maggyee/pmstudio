import type { ProductPack } from "@/lib/product-pack";

export type PMDocumentTone = "blue" | "green" | "neutral" | "orange" | "red";

export type PMDocumentSourceKind = "core-feature" | "mvp-scope" | "user-story";

export type PMDocumentSourceItem = {
  index: number;
  source: PMDocumentSourceKind;
  text: string;
};

export type PMDocumentBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "table";
      columns: string[];
      rows: string[][];
    }
  | {
      type: "callout";
      body: string;
      title: string;
      tone?: PMDocumentTone;
    }
  | {
      type: "source-list";
      description?: string;
      items: PMDocumentSourceItem[];
      title: string;
    }
  | {
      type: "roadmap";
      phases: Array<{
        horizon: string;
        items: string[];
        metric: string;
        outcome: string;
      }>;
    };

export type PMDocumentSection = {
  blocks: PMDocumentBlock[];
  description?: string;
  id: string;
  title: string;
};

export type PMDocument = {
  artifactId: string;
  eyebrow: string;
  generatedAt: string;
  sourceSkill: string;
  subtitle: string;
  title: string;
  sections: PMDocumentSection[];
};

const artifactTitles: Record<string, string> = {
  competitors: "竞品分析文档",
  "executive-summary": "项目汇报摘要",
  personas: "用户画像文档",
  prd: "产品需求文档",
  "product-pack": "完整产品方案包",
  research: "市场机会研究",
  roadmap: "Outcome Roadmap",
};

function list(items: string[]) {
  return items.filter(Boolean);
}

function marketRows(pack: ProductPack) {
  const items = pack.research.marketOpportunity;

  return [
    ["TAM", items[0]?.value ?? "待估算", items[0]?.detail ?? "需要补充行业总盘和可服务问题空间。"],
    ["SAM", items[1]?.value ?? "待估算", items[1]?.detail ?? "需要根据早期客户、渠道和产品能力收敛。"],
    ["SOM", items[2]?.value ?? "待估算", items[2]?.detail ?? "需要根据 1-3 年可达渠道和竞争位置估算。"],
  ];
}

function buildPrdDocument(pack: ProductPack): PMDocument {
  return {
    artifactId: "prd",
    eyebrow: "PM Skills / create-prd",
    generatedAt: pack.generatedAt,
    sourceSkill: "Create PRD + User Stories",
    subtitle: pack.project.oneLiner,
    title: `${pack.project.title} PRD`,
    sections: [
      {
        id: "summary",
        title: "1. Summary",
        blocks: [
          {
            type: "paragraph",
            text: `${pack.project.title} 聚焦 ${pack.project.positioning}`,
          },
          {
            type: "callout",
            title: "产品目标",
            body: pack.prd.objective,
            tone: "blue",
          },
        ],
      },
      {
        id: "contacts",
        title: "2. Contacts",
        description: "当前 demo 以角色代替真实姓名，便于后续接入项目协作。",
        blocks: [
          {
            type: "table",
            columns: ["角色", "职责", "备注"],
            rows: [
              ["Product", "定义问题、目标、范围和验收标准", "负责 PRD 和路线图"],
              ["Design", "把 PRD 映射为 IA、user flow 和 prototype", "负责原型评审"],
              ["Engineering", "评估数据、模型、集成和实现边界", "负责技术可行性"],
            ],
          },
        ],
      },
      {
        id: "background",
        title: "3. Background",
        blocks: [
          {
            type: "paragraph",
            text: pack.project.positioning,
          },
          {
            type: "list",
            items: pack.project.painPoints,
          },
        ],
      },
      {
        id: "objective",
        title: "4. Objective",
        blocks: [
          {
            type: "paragraph",
            text: pack.prd.objective,
          },
          {
            type: "table",
            columns: ["Key Result", "衡量方式"],
            rows: pack.prd.successMetrics.map((metric) => [metric, "MVP 试点期间持续追踪"]),
          },
        ],
      },
      {
        id: "segments",
        title: "5. Market Segment(s)",
        blocks: [
          {
            type: "list",
            items: pack.project.targetUsers,
          },
          {
            type: "callout",
            title: "PM Skills 约束",
            body: "市场应按用户问题和任务定义，而不是只按人口统计或组织类型定义。",
            tone: "neutral",
          },
        ],
      },
      {
        id: "value-propositions",
        title: "6. Value Proposition(s)",
        blocks: [
          {
            type: "paragraph",
            text: pack.project.valueProposition,
          },
          {
            type: "list",
            items: pack.prd.assumptions,
          },
        ],
      },
      {
        id: "solution",
        title: "7. Solution",
        description: "这些需求可直接驱动 prototype screen、IA 和 user flow 更新。",
        blocks: [
          {
            type: "source-list",
            title: "7.1 Core Features",
            description: "点击任一项可打开 PRD-to-Prototype 联动弹窗。",
            items: pack.prd.coreFeatures.map((text, index) => ({
              index,
              source: "core-feature",
              text,
            })),
          },
          {
            type: "source-list",
            title: "7.2 User Stories",
            items: pack.prd.userStories.map((text, index) => ({
              index,
              source: "user-story",
              text,
            })),
          },
          {
            type: "source-list",
            title: "7.3 MVP Scope",
            items: pack.prd.mvpScope.map((text, index) => ({
              index,
              source: "mvp-scope",
              text,
            })),
          },
        ],
      },
      {
        id: "release",
        title: "8. Release",
        blocks: [
          {
            type: "roadmap",
            phases: pack.roadmap.map((phase, index) => ({
              horizon: phase.horizon,
              items: phase.items,
              metric: pack.prd.successMetrics[index % pack.prd.successMetrics.length] ?? "试点结果可量化",
              outcome: `Enable ${pack.project.targetUsers[0] ?? "target users"} to ${phase.items[0] ?? "complete the core workflow"} so that ${pack.project.valueProposition}`,
            })),
          },
        ],
      },
    ],
  };
}

function buildResearchDocument(pack: ProductPack): PMDocument {
  return {
    artifactId: "research",
    eyebrow: "PM Skills / market-sizing",
    generatedAt: pack.generatedAt,
    sourceSkill: "Market Sizing + Opportunity Solution Tree",
    subtitle: "按 TAM / SAM / SOM、增长驱动和关键假设组织市场机会。",
    title: `${pack.project.title} 市场机会研究`,
    sections: [
      {
        id: "definition",
        title: "Market Definition",
        blocks: [
          {
            type: "paragraph",
            text: pack.project.positioning,
          },
          {
            type: "table",
            columns: ["边界", "说明"],
            rows: [
              ["问题空间", pack.project.painPoints[0] ?? "高频 PM 工作流提效"],
              ["目标用户", pack.project.targetUsers.join("、")],
              ["核心价值", pack.project.valueProposition],
            ],
          },
        ],
      },
      {
        id: "tam-sam-som",
        title: "TAM / SAM / SOM",
        blocks: [
          {
            type: "table",
            columns: ["Metric", "当前估计", "依据和约束"],
            rows: marketRows(pack),
          },
        ],
      },
      {
        id: "growth",
        title: "Growth Drivers & Trends",
        blocks: [
          {
            type: "list",
            items: pack.research.marketOpportunity.map((item) => `${item.label}: ${item.detail}`),
          },
        ],
      },
      {
        id: "assumptions",
        title: "Key Assumptions & Risks",
        blocks: [
          {
            type: "list",
            items: [...pack.research.insights, ...pack.prd.assumptions],
          },
        ],
      },
    ],
  };
}

function buildCompetitorDocument(pack: ProductPack): PMDocument {
  return {
    artifactId: "competitors",
    eyebrow: "PM Skills / competitor-analysis",
    generatedAt: pack.generatedAt,
    sourceSkill: "Competitor Analysis",
    subtitle: "识别直接竞品、能力差距和可防守的差异化机会。",
    title: `${pack.project.title} 竞品分析`,
    sections: [
      {
        id: "overview",
        title: "Market Overview & Competitive Set",
        blocks: [
          {
            type: "paragraph",
            text: pack.project.valueProposition,
          },
          {
            type: "table",
            columns: ["Competitor", "Positioning", "Strength", "Weakness", "Opportunity"],
            rows: pack.competitors.map((item) => [
              item.competitor,
              item.positioning,
              item.strength,
              item.weakness,
              item.opportunity,
            ]),
          },
        ],
      },
      {
        id: "profiles",
        title: "Competitor Profiles",
        blocks: pack.competitors.flatMap((item): PMDocumentBlock[] => [
          {
            type: "callout",
            title: item.competitor,
            body: `${item.positioning}。优势：${item.strength}。短板：${item.weakness}。`,
            tone: "neutral",
          },
          {
            type: "paragraph",
            text: `差异化机会：${item.opportunity}`,
          },
        ]),
      },
      {
        id: "recommendation",
        title: "Competitive Positioning Recommendation",
        blocks: [
          {
            type: "callout",
            title: "建议定位",
            body: pack.project.positioning,
            tone: "green",
          },
        ],
      },
    ],
  };
}

function buildPersonasDocument(pack: ProductPack): PMDocument {
  return {
    artifactId: "personas",
    eyebrow: "PM Skills / user-personas",
    generatedAt: pack.generatedAt,
    sourceSkill: "User Personas",
    subtitle: "用 JTBD、痛点、收益、意外洞察和产品适配度描述目标用户。",
    title: `${pack.project.title} 用户画像`,
    sections: pack.personas.map((persona, index) => ({
      id: `persona-${index + 1}`,
      title: persona.name,
      description: persona.role,
      blocks: [
        {
          type: "table",
          columns: ["维度", "内容"],
          rows: [
            ["Primary Job-to-be-Done", persona.goal],
            ["Top Pain Point", persona.pain],
            ["Desired Gain", pack.project.valueProposition],
            ["Unexpected Insight", pack.research.insights[index % pack.research.insights.length] ?? "需要补充研究数据验证。"],
            ["Product Fit Assessment", `${pack.project.title} 可以通过 ${pack.prd.coreFeatures[index % pack.prd.coreFeatures.length] ?? "核心工作流"} 支持该角色。`],
          ],
        },
      ],
    })),
  };
}

function buildRoadmapDocument(pack: ProductPack): PMDocument {
  return {
    artifactId: "roadmap",
    eyebrow: "PM Skills / outcome-roadmap",
    generatedAt: pack.generatedAt,
    sourceSkill: "Outcome Roadmap",
    subtitle: "用 outcome、指标和依赖描述路线图，避免只堆功能清单。",
    title: `${pack.project.title} Outcome Roadmap`,
    sections: [
      {
        id: "strategic-context",
        title: "Strategic Context",
        blocks: [
          {
            type: "paragraph",
            text: pack.summary.headline,
          },
          {
            type: "list",
            items: pack.prd.assumptions,
          },
        ],
      },
      {
        id: "roadmap",
        title: "Outcome Roadmap",
        blocks: [
          {
            type: "roadmap",
            phases: pack.roadmap.map((phase, index) => ({
              horizon: phase.horizon,
              items: phase.items,
              metric: pack.prd.successMetrics[index % pack.prd.successMetrics.length] ?? "结果可衡量",
              outcome: `Enable ${pack.project.targetUsers[index % pack.project.targetUsers.length] ?? "target users"} to ${phase.items[0] ?? "complete a key workflow"} so that ${pack.summary.bullets[index % pack.summary.bullets.length] ?? pack.project.valueProposition}`,
            })),
          },
        ],
      },
      {
        id: "dependencies",
        title: "Dependencies & Sequencing Notes",
        blocks: [
          {
            type: "list",
            items: pack.summary.nextActions,
          },
        ],
      },
    ],
  };
}

function buildSummaryDocument(pack: ProductPack): PMDocument {
  return {
    artifactId: "executive-summary",
    eyebrow: "PM Studio / product-pack",
    generatedAt: pack.generatedAt,
    sourceSkill: "Project Summary",
    subtitle: pack.project.oneLiner,
    title: `${pack.project.title} 项目汇报摘要`,
    sections: [
      {
        id: "decision-summary",
        title: "Decision Summary",
        blocks: [
          {
            type: "callout",
            title: "核心结论",
            body: pack.summary.headline,
            tone: "green",
          },
          {
            type: "list",
            items: pack.summary.bullets,
          },
        ],
      },
      {
        id: "artifacts",
        title: "Generated Documents",
        blocks: [
          {
            type: "table",
            columns: ["Artifact", "Surface", "Status"],
            rows: pack.artifactIndex.map((artifact) => [
              artifact.title,
              artifact.surface,
              artifact.status,
            ]),
          },
        ],
      },
      {
        id: "next-actions",
        title: "Next Actions",
        blocks: [
          {
            type: "list",
            items: pack.summary.nextActions,
          },
        ],
      },
    ],
  };
}

function buildProductPackDocument(pack: ProductPack): PMDocument {
  return {
    artifactId: "product-pack",
    eyebrow: "PM Studio / Idea-to-Product Pack",
    generatedAt: pack.generatedAt,
    sourceSkill: "Idea-to-Product Pack",
    subtitle: pack.project.oneLiner,
    title: `${pack.project.title} 完整产品方案包`,
    sections: [
      {
        id: "overview",
        title: "Product Overview",
        blocks: [
          {
            type: "paragraph",
            text: pack.project.positioning,
          },
          {
            type: "table",
            columns: ["维度", "内容"],
            rows: [
              ["目标用户", pack.project.targetUsers.join("、")],
              ["核心痛点", pack.project.painPoints.join("；")],
              ["价值主张", pack.project.valueProposition],
            ],
          },
        ],
      },
      {
        id: "prd",
        title: "PRD Snapshot",
        blocks: [
          {
            type: "paragraph",
            text: pack.prd.objective,
          },
          {
            type: "list",
            items: pack.prd.coreFeatures,
          },
        ],
      },
      {
        id: "prototype",
        title: "Prototype Linkage",
        blocks: [
          {
            type: "paragraph",
            text: pack.prototype.userFlow,
          },
          {
            type: "table",
            columns: ["Requirement", "Screen", "Rationale"],
            rows: pack.prototype.prdLinks.map((link) => [
              link.requirement,
              link.screen,
              link.rationale,
            ]),
          },
        ],
      },
      {
        id: "next-actions",
        title: "Next Actions",
        blocks: [
          {
            type: "list",
            items: pack.summary.nextActions,
          },
        ],
      },
    ],
  };
}

export function buildArtifactDocument(artifactId: string, pack: ProductPack): PMDocument {
  const builders: Record<string, (pack: ProductPack) => PMDocument> = {
    competitors: buildCompetitorDocument,
    "executive-summary": buildSummaryDocument,
    personas: buildPersonasDocument,
    prd: buildPrdDocument,
    "product-pack": buildProductPackDocument,
    research: buildResearchDocument,
    roadmap: buildRoadmapDocument,
    summary: buildSummaryDocument,
  };

  return builders[artifactId]?.(pack) ?? buildProductPackDocument(pack);
}

function renderBlockMarkdown(block: PMDocumentBlock) {
  if (block.type === "paragraph") return block.text;

  if (block.type === "list") return list(block.items).map((item) => `- ${item}`).join("\n");

  if (block.type === "table") {
    return [
      `| ${block.columns.join(" | ")} |`,
      `| ${block.columns.map(() => "---").join(" | ")} |`,
      ...block.rows.map((row) => `| ${row.join(" | ")} |`),
    ].join("\n");
  }

  if (block.type === "callout") {
    return [`> **${block.title}**`, `> ${block.body}`].join("\n");
  }

  if (block.type === "source-list") {
    return [
      `### ${block.title}`,
      block.description ?? "",
      block.items.map((item) => `- ${item.text}`).join("\n"),
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return block.phases
    .map((phase) =>
      [
        `### ${phase.horizon}`,
        "",
        `Outcome: ${phase.outcome}`,
        "",
        `Metric: ${phase.metric}`,
        "",
        phase.items.map((item) => `- ${item}`).join("\n"),
      ].join("\n"),
    )
    .join("\n\n");
}

export function renderDocumentMarkdown(document: PMDocument) {
  return [
    `# ${document.title}`,
    "",
    document.subtitle,
    "",
    `Source: ${document.sourceSkill}`,
    "",
    ...document.sections.flatMap((section) => [
      `## ${section.title}`,
      section.description ?? "",
      ...section.blocks.map(renderBlockMarkdown),
      "",
    ]),
  ]
    .filter((line) => line !== undefined)
    .join("\n")
    .replace(/\n{4,}/g, "\n\n\n");
}

export function renderArtifactMarkdown(artifactId: string, pack: ProductPack) {
  const document = buildArtifactDocument(artifactId, pack);

  if (artifactId === "product-pack") {
    return [
      renderDocumentMarkdown(document),
      "",
      renderDocumentMarkdown(buildArtifactDocument("prd", pack)),
      "",
      renderDocumentMarkdown(buildArtifactDocument("research", pack)),
      "",
      renderDocumentMarkdown(buildArtifactDocument("competitors", pack)),
      "",
      renderDocumentMarkdown(buildArtifactDocument("personas", pack)),
      "",
      renderDocumentMarkdown(buildArtifactDocument("roadmap", pack)),
    ].join("\n\n");
  }

  return renderDocumentMarkdown(document);
}
