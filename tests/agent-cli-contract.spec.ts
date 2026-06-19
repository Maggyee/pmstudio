import { expect, test } from "@playwright/test";

import {
  extractAgentCliResult,
  mergeProductPackDelta,
} from "../lib/agent-cli-contract";
import { buildProductPackFromIdea } from "../lib/product-pack";

test("extracts fenced Codex JSON result and merges a delta", () => {
  const rawOutput = [
    "analysis omitted",
    "```json",
    JSON.stringify({
      schemaVersion: "pmstudio.agent-cli-result.v1",
      events: [
        {
          type: "artifact",
          agent: "Codex Adapter",
          message: "Updated PRD and summary.",
          artifactId: "prd",
        },
      ],
      delta: {
        schemaVersion: "pm-product-pack-delta.v1",
        project: {
          title: "CoffeeOps AI 工作台",
          targetUsers: ["独立咖啡店老板", "店长"],
        },
        prd: {
          objective: "让咖啡店 3 分钟内完成补货判断和班次建议。",
        },
        summary: {
          headline: "CoffeeOps 已形成可评审 MVP。",
        },
      },
    }),
    "```",
  ].join("\n");

  const result = extractAgentCliResult(rawOutput);
  const pack = buildProductPackFromIdea("给独立咖啡店做一个自动订货和会员运营工作台");
  const merged = mergeProductPackDelta(pack, result?.delta);

  expect(result?.events?.[0]).toMatchObject({
    type: "artifact",
    artifactId: "prd",
  });
  expect(merged.project.title).toBe("CoffeeOps AI 工作台");
  expect(merged.project.targetUsers).toEqual(["独立咖啡店老板", "店长"]);
  expect(merged.prd.objective).toContain("3 分钟");
  expect(merged.summary.headline).toBe("CoffeeOps 已形成可评审 MVP。");
  expect(merged.prototype.liveArtifact.title).toBe("CoffeeOps AI 工作台 Prototype Preview");
});

test("extracts Claude stream-json text content", () => {
  const resultJson = JSON.stringify({
    schemaVersion: "pmstudio.agent-cli-result.v1",
    delta: {
      schemaVersion: "pm-product-pack-delta.v1",
      prototype: {
        userFlow: "录入门店数据 -> 生成补货建议 -> 分配执行任务",
      },
    },
  });
  const rawOutput = [
    JSON.stringify({
      type: "assistant",
      message: {
        content: [{ type: "text", text: resultJson }],
      },
    }),
  ].join("\n");

  const result = extractAgentCliResult(rawOutput);

  expect(result?.delta?.prototype?.userFlow).toBe("录入门店数据 -> 生成补货建议 -> 分配执行任务");
});

test("ignores invalid output and keeps the base pack stable", () => {
  const pack = buildProductPackFromIdea("给独立咖啡店做一个自动订货和会员运营工作台");
  const result = extractAgentCliResult("I updated the plan but forgot JSON.");
  const merged = mergeProductPackDelta(pack, result?.delta);

  expect(result).toBeUndefined();
  expect(merged).toEqual(pack);
});
