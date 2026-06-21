import { expect, test } from "@playwright/test";

import { buildProductPackFromIdea } from "../lib/product-pack";
import { buildPrototypeArtifactBundle } from "../lib/prototype-artifacts";

test("uses agent generated screen files instead of hashed fallback screen files", () => {
  const pack = buildProductPackFromIdea("帮我生成一个阅读 app 的 PRD 和移动端原型");

  pack.prototype.screens = [
    {
      name: "首页",
      goal: "发现新书并继续最近阅读",
      primaryAction: "继续阅读",
      components: ["推荐书单", "最近阅读", "阅读目标"],
    },
    {
      name: "沉浸阅读器",
      goal: "在专注状态下阅读和做笔记",
      primaryAction: "打开笔记",
      components: ["正文排版", "进度条", "标注工具"],
    },
    {
      name: "个人与目标",
      goal: "查看阅读统计和调整目标",
      primaryAction: "调整目标",
      components: ["阅读日历", "连续阅读", "目标设置"],
    },
  ];
  pack.prototype.generatedArtifact = {
    schemaVersion: "pmstudio.generated-prototype-files.v1",
    entryFile: "index.html",
    files: [
      {
        path: "index.html",
        mimeType: "text/html",
        purpose: "generated prototype entry",
        editable: true,
        body: "<!doctype html><html><body data-od-id=\"entry\">Reading App</body></html>",
      },
      {
        path: "screens/01-home.html",
        mimeType: "text/html",
        purpose: "generated home screen",
        editable: true,
        body: "<!doctype html><html><body data-od-id=\"home\">Home</body></html>",
      },
      {
        path: "screens/02-reader.html",
        mimeType: "text/html",
        purpose: "generated reader screen",
        editable: true,
        body: "<!doctype html><html><body data-od-id=\"reader\">Reader</body></html>",
      },
      {
        path: "screens/03-profile.html",
        mimeType: "text/html",
        purpose: "generated profile screen",
        editable: true,
        body: "<!doctype html><html><body data-od-id=\"profile\">Profile</body></html>",
      },
    ],
  };

  const paths = buildPrototypeArtifactBundle(pack).files.map((file) => file.path);

  expect(paths).toEqual(
    expect.arrayContaining([
      "index.html",
      "screens/01-home.html",
      "screens/02-reader.html",
      "screens/03-profile.html",
    ]),
  );
  expect(paths.filter((path) => /^screens\/\d{2}-screen-[a-z0-9]+\.html$/i.test(path))).toEqual(
    [],
  );
  expect(paths.filter((path) => path.startsWith("screens/") && path.endsWith(".html")).sort()).toEqual(
    ["screens/01-home.html", "screens/02-reader.html", "screens/03-profile.html"],
  );
});

test("uses stable fallback screen file names for non-ascii screen names", () => {
  const pack = buildProductPackFromIdea("帮我生成一个阅读 app 的 PRD 和移动端原型");

  pack.prototype.screens = [
    {
      name: "首页",
      goal: "发现新书并继续最近阅读",
      primaryAction: "继续阅读",
      components: ["推荐书单"],
    },
    {
      name: "沉浸阅读器",
      goal: "在专注状态下阅读和做笔记",
      primaryAction: "打开笔记",
      components: ["正文排版"],
    },
    {
      name: "个人与目标",
      goal: "查看阅读统计和调整目标",
      primaryAction: "调整目标",
      components: ["阅读日历"],
    },
  ];
  pack.prototype.generatedArtifact = undefined;

  const paths = buildPrototypeArtifactBundle(pack).files.map((file) => file.path);

  expect(paths.filter((path) => path.startsWith("screens/") && path.endsWith(".html")).sort()).toEqual(
    ["screens/01-screen.html", "screens/02-screen.html", "screens/03-screen.html"],
  );
  expect(paths.filter((path) => /^screens\/\d{2}-screen-[a-z0-9]+\.html$/i.test(path))).toEqual(
    [],
  );
});
