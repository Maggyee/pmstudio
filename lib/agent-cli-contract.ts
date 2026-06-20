import type { HarnessEvent } from "@/lib/agent-harness";
import type { ProductPack } from "@/lib/product-pack";

export type ProductPackDelta = {
  schemaVersion?: "pm-product-pack-delta.v1";
  project?: Partial<ProductPack["project"]>;
  prd?: Partial<ProductPack["prd"]>;
  prototype?: Partial<Omit<ProductPack["prototype"], "liveArtifact">>;
  research?: Partial<ProductPack["research"]>;
  competitors?: ProductPack["competitors"];
  personas?: ProductPack["personas"];
  roadmap?: ProductPack["roadmap"];
  summary?: Partial<ProductPack["summary"]>;
  artifactIndex?: ProductPack["artifactIndex"];
};

export type AgentCliResult = {
  schemaVersion: "pmstudio.agent-cli-result.v1";
  events?: HarnessEvent[];
  delta?: ProductPackDelta;
  notes?: string[];
};

type JsonRecord = Record<string, unknown>;

const eventTypes = new Set<HarnessEvent["type"]>(["queued", "running", "artifact", "done"]);
const deltaKeys = new Set([
  "project",
  "prd",
  "prototype",
  "research",
  "competitors",
  "personas",
  "roadmap",
  "summary",
  "artifactIndex",
]);

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  const items = value.map(asString).filter((item): item is string => Boolean(item));

  return items.length ? items : undefined;
}

function asRecordArray<T>(value: unknown, normalize: (item: JsonRecord) => T | undefined) {
  if (!Array.isArray(value)) return undefined;

  const items = value
    .map((item) => (isRecord(item) ? normalize(item) : undefined))
    .filter((item): item is T => Boolean(item));

  return items.length ? items : undefined;
}

function normalizeLabeledValue(item: JsonRecord) {
  const label = asString(item.label);
  const value = asString(item.value);

  if (!label || !value) return undefined;

  return { label, value };
}

function normalizeScreen(item: JsonRecord) {
  const name = asString(item.name);
  const goal = asString(item.goal);
  const primaryAction = asString(item.primaryAction);
  const components = asStringArray(item.components);

  if (!name || !goal || !primaryAction || !components) return undefined;

  return { name, goal, primaryAction, components };
}

function normalizePrdLink(item: JsonRecord) {
  const requirement = asString(item.requirement);
  const screen = asString(item.screen);
  const rationale = asString(item.rationale);

  if (!requirement || !screen || !rationale) return undefined;

  return { requirement, screen, rationale };
}

function normalizeMarketOpportunity(item: JsonRecord) {
  const label = asString(item.label);
  const value = asString(item.value);
  const detail = asString(item.detail);

  if (!label || !value || !detail) return undefined;

  return { label, value, detail };
}

function normalizeCompetitor(item: JsonRecord) {
  const competitor = asString(item.competitor);
  const positioning = asString(item.positioning);
  const strength = asString(item.strength);
  const weakness = asString(item.weakness);
  const opportunity = asString(item.opportunity);

  if (!competitor || !positioning || !strength || !weakness || !opportunity) return undefined;

  return { competitor, positioning, strength, weakness, opportunity };
}

function normalizePersona(item: JsonRecord) {
  const name = asString(item.name);
  const role = asString(item.role);
  const goal = asString(item.goal);
  const pain = asString(item.pain);

  if (!name || !role || !goal || !pain) return undefined;

  return { name, role, goal, pain };
}

function normalizeRoadmapItem(item: JsonRecord) {
  const horizon = asString(item.horizon);
  const items = asStringArray(item.items);

  if (!horizon || !items) return undefined;

  return { horizon, items };
}

function normalizeArtifactIndexItem(item: JsonRecord) {
  const id = asString(item.id);
  const title = asString(item.title);
  const surface = asString(item.surface) as ProductPack["artifactIndex"][number]["surface"] | undefined;
  const status = asString(item.status) as ProductPack["artifactIndex"][number]["status"] | undefined;
  const exportFormats = asStringArray(item.exportFormats) as
    | ProductPack["artifactIndex"][number]["exportFormats"]
    | undefined;

  if (!id || !title || !surface || !status || !exportFormats) return undefined;

  return { id, title, surface, status, exportFormats };
}

function normalizeStylesOverride(value: unknown) {
  if (!isRecord(value)) return undefined;

  const entries = Object.entries(value)
    .map(([elementId, styles]) => {
      if (!isRecord(styles)) return undefined;

      const styleEntries = Object.entries(styles)
        .map(([key, styleValue]) => {
          const normalized = asString(styleValue);

          return normalized ? [key, normalized] : undefined;
        })
        .filter((item): item is [string, string] => Boolean(item));

      return styleEntries.length ? [elementId, Object.fromEntries(styleEntries)] : undefined;
    })
    .filter((item): item is [string, Record<string, string>] => Boolean(item));

  return entries.length ? Object.fromEntries(entries) : undefined;
}

function hasDeltaShape(value: JsonRecord) {
  return Object.keys(value).some((key) => deltaKeys.has(key));
}

function normalizeEvent(item: JsonRecord): HarnessEvent | undefined {
  const type = asString(item.type) as HarnessEvent["type"] | undefined;
  const agent = asString(item.agent);
  const message = asString(item.message);
  const artifactId = asString(item.artifactId);

  if (!type || !eventTypes.has(type) || !agent || !message) return undefined;

  return artifactId ? { type, agent, message, artifactId } : { type, agent, message };
}

function normalizeEvents(value: unknown) {
  return asRecordArray(value, normalizeEvent);
}

function normalizeProductPackDelta(value: unknown): ProductPackDelta | undefined {
  if (!isRecord(value) || !hasDeltaShape(value)) return undefined;

  const project = isRecord(value.project) ? value.project : undefined;
  const prd = isRecord(value.prd) ? value.prd : undefined;
  const prototype = isRecord(value.prototype) ? value.prototype : undefined;
  const research = isRecord(value.research) ? value.research : undefined;
  const summary = isRecord(value.summary) ? value.summary : undefined;
  const delta: ProductPackDelta = {};

  if (project) {
    delta.project = {
      title: asString(project.title),
      oneLiner: asString(project.oneLiner),
      positioning: asString(project.positioning),
      targetUsers: asStringArray(project.targetUsers),
      painPoints: asStringArray(project.painPoints),
      valueProposition: asString(project.valueProposition),
    };
  }

  if (prd) {
    delta.prd = {
      objective: asString(prd.objective),
      sections: asRecordArray(prd.sections, normalizeLabeledValue),
      coreFeatures: asStringArray(prd.coreFeatures),
      userStories: asStringArray(prd.userStories),
      assumptions: asStringArray(prd.assumptions),
      successMetrics: asStringArray(prd.successMetrics),
      mvpScope: asStringArray(prd.mvpScope),
    };
  }

  if (prototype) {
    delta.prototype = {
      userFlow: asString(prototype.userFlow),
      screens: asRecordArray(prototype.screens, normalizeScreen),
      prdLinks: asRecordArray(prototype.prdLinks, normalizePrdLink),
      openDesignPrompt: asString(prototype.openDesignPrompt),
      stylesOverride: normalizeStylesOverride(prototype.stylesOverride),
    };
  }

  if (research) {
    delta.research = {
      marketOpportunity: asRecordArray(research.marketOpportunity, normalizeMarketOpportunity),
      insights: asStringArray(research.insights),
    };
  }

  if (summary) {
    delta.summary = {
      headline: asString(summary.headline),
      bullets: asStringArray(summary.bullets),
      nextActions: asStringArray(summary.nextActions),
    };
  }

  delta.competitors = asRecordArray(value.competitors, normalizeCompetitor);
  delta.personas = asRecordArray(value.personas, normalizePersona);
  delta.roadmap = asRecordArray(value.roadmap, normalizeRoadmapItem);
  delta.artifactIndex = asRecordArray(value.artifactIndex, normalizeArtifactIndexItem);

  return stripEmptyDelta(delta);
}

function stripUndefined<T extends JsonRecord>(value: T): Partial<T> | undefined {
  const entries = Object.entries(value).filter(([, item]) => item !== undefined);

  return entries.length ? Object.fromEntries(entries) as Partial<T> : undefined;
}

function stripEmptyDelta(delta: ProductPackDelta): ProductPackDelta | undefined {
  const clean: ProductPackDelta = {};

  Object.entries(delta).forEach(([key, value]) => {
    if (value === undefined) return;

    if (isRecord(value)) {
      const stripped = stripUndefined(value);

      if (stripped) {
        clean[key as keyof ProductPackDelta] = stripped as never;
      }

      return;
    }

    clean[key as keyof ProductPackDelta] = value as never;
  });

  return Object.keys(clean).length ? clean : undefined;
}

function normalizeAgentCliResult(value: unknown): AgentCliResult | undefined {
  if (!isRecord(value)) return undefined;

  const deltaSource =
    value.delta ??
    value.productPackDelta ??
    value.product_pack_delta ??
    (hasDeltaShape(value) ? value : undefined);
  const delta = normalizeProductPackDelta(deltaSource);
  const events = normalizeEvents(value.events);
  const notes = asStringArray(value.notes);

  if (!delta && !events?.length && !notes?.length) return undefined;

  return {
    schemaVersion: "pmstudio.agent-cli-result.v1",
    events,
    delta,
    notes,
  };
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function extractFencedJson(rawOutput: string) {
  return Array.from(rawOutput.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)).map((match) =>
    match[1].trim(),
  );
}

function extractBalancedJsonObjects(rawOutput: string) {
  const candidates: string[] = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < rawOutput.length; index += 1) {
    const char = rawOutput[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }

      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) start = index;
      depth += 1;
      continue;
    }

    if (char === "}" && depth > 0) {
      depth -= 1;

      if (depth === 0 && start >= 0) {
        candidates.push(rawOutput.slice(start, index + 1));
        start = -1;
      }
    }
  }

  return candidates;
}

function collectTextFragments(value: unknown, fragments: string[] = []) {
  if (typeof value === "string") {
    fragments.push(value);
    return fragments;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectTextFragments(item, fragments));
    return fragments;
  }

  if (isRecord(value)) {
    Object.entries(value).forEach(([key, item]) => {
      if (["text", "content", "result", "output", "message", "item"].includes(key)) {
        collectTextFragments(item, fragments);
      }
    });
  }

  return fragments;
}

function normalizeCandidate(candidate: string) {
  const parsed = tryParseJson(candidate);
  const direct = normalizeAgentCliResult(parsed);

  if (direct) return direct;

  if (parsed !== undefined) {
    const textCandidate = collectTextFragments(parsed).join("\n");

    if (textCandidate && textCandidate !== candidate) {
      return extractAgentCliResult(textCandidate);
    }
  }

  return undefined;
}

export function extractAgentCliResult(rawOutput: string): AgentCliResult | undefined {
  const trimmed = rawOutput.trim();

  if (!trimmed) return undefined;

  const candidates = [
    trimmed,
    ...extractFencedJson(trimmed),
    ...trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
    ...extractBalancedJsonObjects(trimmed),
  ];

  for (const candidate of candidates.reverse()) {
    const result = normalizeCandidate(candidate);

    if (result) return result;
  }

  return undefined;
}

export function mergeProductPackDelta(base: ProductPack, delta?: ProductPackDelta): ProductPack {
  if (!delta) return base;

  const project = {
    ...base.project,
    ...stripUndefined(delta.project ?? {}),
  };
  const prd = {
    ...base.prd,
    ...stripUndefined(delta.prd ?? {}),
  };
  const prototypeDelta = stripUndefined(delta.prototype ?? {});
  const prototype = {
    ...base.prototype,
    ...prototypeDelta,
    liveArtifact: {
      ...base.prototype.liveArtifact,
      title: `${project.title} Prototype Preview`,
    },
  };
  const research = {
    ...base.research,
    ...stripUndefined(delta.research ?? {}),
  };
  const summary = {
    ...base.summary,
    ...stripUndefined(delta.summary ?? {}),
  };

  return {
    ...base,
    project,
    prd,
    prototype,
    research,
    competitors: delta.competitors ?? base.competitors,
    personas: delta.personas ?? base.personas,
    roadmap: delta.roadmap ?? base.roadmap,
    summary,
    artifactIndex: delta.artifactIndex ?? base.artifactIndex,
  };
}

export function buildAgentCliOutputInstructions() {
  return [
    "Your final response must contain exactly one JSON object. Do not wrap it in Markdown.",
    "Use this schema:",
    JSON.stringify(
      {
        schemaVersion: "pmstudio.agent-cli-result.v1",
        events: [
          {
            type: "running",
            agent: "Codex or Claude Code",
            message: "Short user-visible progress note.",
            artifactId: "optional-artifact-id",
          },
        ],
        delta: {
          schemaVersion: "pm-product-pack-delta.v1",
          project: {
            title: "Optional revised title",
            oneLiner: "Optional one-line product summary",
            positioning: "Optional positioning",
            targetUsers: ["Optional target user"],
            painPoints: ["Optional pain point"],
            valueProposition: "Optional value proposition",
          },
          prd: {
            objective: "Optional objective",
            coreFeatures: ["Optional feature"],
            userStories: ["Optional story"],
            assumptions: ["Optional assumption"],
            successMetrics: ["Optional metric"],
            mvpScope: ["Optional scope item"],
          },
          prototype: {
            userFlow: "Optional flow",
            screens: [
              {
                name: "Screen name",
                goal: "Screen goal",
                primaryAction: "Primary action",
                components: ["Component"],
              },
            ],
            prdLinks: [
              {
                requirement: "Requirement",
                screen: "Screen name",
                rationale: "Why this screen satisfies the requirement",
              },
            ],
            openDesignPrompt: "Optional prototype continuation prompt",
          },
          summary: {
            headline: "Optional review headline",
            bullets: ["Optional bullet"],
            nextActions: ["Optional next action"],
          },
        },
        notes: ["Optional private adapter note safe to show in metadata."],
      },
      null,
      2,
    ),
    "Only include fields you are improving. Keep arrays complete for any field you include.",
    "Do not edit the PM Studio repository. Work only from the files in this temporary run directory.",
  ].join("\n\n");
}

export function buildAgentCliOutputJsonSchema() {
  const nullableString = { type: ["string", "null"] };
  const nullableStringArray = {
    type: ["array", "null"],
    items: { type: "string" },
  };
  const labeledValue = {
    type: "object",
    additionalProperties: false,
    required: ["label", "value"],
    properties: {
      label: { type: "string" },
      value: { type: "string" },
    },
  };
  const nullableLabeledValues = {
    type: ["array", "null"],
    items: labeledValue,
  };
  const screen = {
    type: "object",
    additionalProperties: false,
    required: ["name", "goal", "primaryAction", "components"],
    properties: {
      name: { type: "string" },
      goal: { type: "string" },
      primaryAction: { type: "string" },
      components: {
        type: "array",
        items: { type: "string" },
      },
    },
  };
  const prdLink = {
    type: "object",
    additionalProperties: false,
    required: ["requirement", "screen", "rationale"],
    properties: {
      requirement: { type: "string" },
      screen: { type: "string" },
      rationale: { type: "string" },
    },
  };
  const marketOpportunity = {
    type: "object",
    additionalProperties: false,
    required: ["label", "value", "detail"],
    properties: {
      label: { type: "string" },
      value: { type: "string" },
      detail: { type: "string" },
    },
  };
  const competitor = {
    type: "object",
    additionalProperties: false,
    required: ["competitor", "positioning", "strength", "weakness", "opportunity"],
    properties: {
      competitor: { type: "string" },
      positioning: { type: "string" },
      strength: { type: "string" },
      weakness: { type: "string" },
      opportunity: { type: "string" },
    },
  };
  const persona = {
    type: "object",
    additionalProperties: false,
    required: ["name", "role", "goal", "pain"],
    properties: {
      name: { type: "string" },
      role: { type: "string" },
      goal: { type: "string" },
      pain: { type: "string" },
    },
  };
  const roadmapItem = {
    type: "object",
    additionalProperties: false,
    required: ["horizon", "items"],
    properties: {
      horizon: { type: "string" },
      items: {
        type: "array",
        items: { type: "string" },
      },
    },
  };

  return {
    type: "object",
    additionalProperties: false,
    required: ["schemaVersion", "events", "delta", "notes"],
    properties: {
      schemaVersion: {
        type: "string",
        const: "pmstudio.agent-cli-result.v1",
      },
      events: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "agent", "message", "artifactId"],
          properties: {
            type: {
              enum: ["queued", "running", "artifact", "done"],
            },
            agent: { type: "string" },
            message: { type: "string" },
            artifactId: { type: ["string", "null"] },
          },
        },
      },
      delta: {
        type: ["object", "null"],
        additionalProperties: false,
        required: [
          "schemaVersion",
          "project",
          "prd",
          "prototype",
          "research",
          "competitors",
          "personas",
          "roadmap",
          "summary",
          "artifactIndex",
        ],
        properties: {
          schemaVersion: {
            type: "string",
            const: "pm-product-pack-delta.v1",
          },
          project: {
            type: ["object", "null"],
            additionalProperties: false,
            required: [
              "title",
              "oneLiner",
              "positioning",
              "targetUsers",
              "painPoints",
              "valueProposition",
            ],
            properties: {
              title: nullableString,
              oneLiner: nullableString,
              positioning: nullableString,
              targetUsers: nullableStringArray,
              painPoints: nullableStringArray,
              valueProposition: nullableString,
            },
          },
          prd: {
            type: ["object", "null"],
            additionalProperties: false,
            required: [
              "objective",
              "sections",
              "coreFeatures",
              "userStories",
              "assumptions",
              "successMetrics",
              "mvpScope",
            ],
            properties: {
              objective: nullableString,
              sections: nullableLabeledValues,
              coreFeatures: nullableStringArray,
              userStories: nullableStringArray,
              assumptions: nullableStringArray,
              successMetrics: nullableStringArray,
              mvpScope: nullableStringArray,
            },
          },
          prototype: {
            type: ["object", "null"],
            additionalProperties: false,
            required: ["userFlow", "screens", "prdLinks", "openDesignPrompt"],
            properties: {
              userFlow: nullableString,
              screens: {
                type: ["array", "null"],
                items: screen,
              },
              prdLinks: {
                type: ["array", "null"],
                items: prdLink,
              },
              openDesignPrompt: nullableString,
            },
          },
          research: {
            type: ["object", "null"],
            additionalProperties: false,
            required: ["marketOpportunity", "insights"],
            properties: {
              marketOpportunity: {
                type: ["array", "null"],
                items: marketOpportunity,
              },
              insights: nullableStringArray,
            },
          },
          competitors: {
            type: ["array", "null"],
            items: competitor,
          },
          personas: {
            type: ["array", "null"],
            items: persona,
          },
          roadmap: {
            type: ["array", "null"],
            items: roadmapItem,
          },
          summary: {
            type: ["object", "null"],
            additionalProperties: false,
            required: ["headline", "bullets", "nextActions"],
            properties: {
              headline: nullableString,
              bullets: nullableStringArray,
              nextActions: nullableStringArray,
            },
          },
          artifactIndex: {
            type: ["array", "null"],
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "title", "surface", "status", "exportFormats"],
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                surface: { type: "string" },
                status: { type: "string" },
                exportFormats: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
        },
      },
      notes: {
        type: "array",
        items: { type: "string" },
      },
    },
  };
}
