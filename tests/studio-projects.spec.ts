import { expect, test } from "@playwright/test";

import { buildProductPackFromIdea } from "../lib/product-pack";
import {
  archiveProject,
  buildShowcaseProjects,
  createProject,
  deleteProject,
  duplicateProject,
  ensureShowcaseProjects,
  getActiveProjectId,
  readProjects,
  restoreProject,
  studioProjectsStorageKeys,
  updateProject,
} from "../lib/studio-projects";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

test("migrates v4 browser-local projects into v5 records", () => {
  const storage = new MemoryStorage();
  const pack = buildProductPackFromIdea("帮我生成一个阅读 app 的 PRD 和移动端原型");

  storage.setItem(
    studioProjectsStorageKeys.legacyProjects,
    JSON.stringify([
      {
        agentEvents: [
          {
            agent: "Mock",
            artifactId: "prd",
            message: "Generated PRD.",
            type: "done",
          },
        ],
        createdAt: pack.generatedAt,
        id: "legacy-project",
        productPack: pack,
        updatedAt: pack.generatedAt,
      },
    ]),
  );
  storage.setItem(studioProjectsStorageKeys.legacyActiveProject, "legacy-project");

  const projects = readProjects(storage);

  expect(projects).toHaveLength(1);
  expect(projects[0]).toMatchObject({
    id: "legacy-project",
    name: pack.project.title,
    sourceIdea: pack.sourceIdea,
    status: "ready",
  });
  expect(projects[0].productPack?.project.title).toBe(pack.project.title);
  expect(getActiveProjectId(storage)).toBe("legacy-project");
  expect(storage.getItem(studioProjectsStorageKeys.projects)).toBeTruthy();
  expect(storage.getItem(studioProjectsStorageKeys.legacyProjects)).toBeTruthy();
});

test("creates an empty project without generating a product pack", () => {
  const storage = new MemoryStorage();
  const project = createProject(
    {
      providerId: "mock",
      sourceIdea: "帮我生成一个阅读 app 的 PRD",
      workflowId: "generate-prd",
    },
    storage,
  );

  expect(project.status).toBe("empty");
  expect(project.productPack).toBeUndefined();
  expect(readProjects(storage)[0]).toMatchObject({
    id: project.id,
    providerId: "mock",
    workflowId: "generate-prd",
  });
  expect(getActiveProjectId(storage)).toBe(project.id);
});

test("builds showcase projects with generated prototype files", () => {
  const projects = buildShowcaseProjects();

  expect(projects.length).toBeGreaterThanOrEqual(4);
  expect(projects.map((project) => project.id)).toEqual(
    expect.arrayContaining(["demo", "showcase-reading-app", "showcase-coffee-ops", "showcase-clinic-intake"]),
  );

  for (const project of projects) {
    const generatedFiles = project.productPack?.prototype.generatedArtifact?.files ?? [];
    const screenPaths = generatedFiles
      .map((file) => file.path)
      .filter((path) => path.startsWith("screens/") && path.endsWith(".html"));

    expect(project.status).toBe("ready");
    expect(project.productPack?.project.title).toBe(project.name);
    expect(screenPaths.length).toBeGreaterThanOrEqual(3);
    expect(screenPaths.some((path) => /^screens\/\d{2}-screen-[a-z0-9]+\.html$/i.test(path))).toBe(false);
  }
});

test("seeds showcase projects once without overwriting local projects", () => {
  const storage = new MemoryStorage();
  const localProject = createProject(
    {
      name: "本地项目",
      sourceIdea: "我自己的项目",
    },
    storage,
  );

  const seeded = ensureShowcaseProjects(storage);
  const seededAgain = ensureShowcaseProjects(storage);

  expect(seeded.length).toBeGreaterThanOrEqual(5);
  expect(seeded.filter((project) => project.id === localProject.id)).toHaveLength(1);
  expect(seededAgain).toHaveLength(seeded.length);
  expect(storage.getItem(studioProjectsStorageKeys.showcaseSeeded)).toBe("1");
  expect(getActiveProjectId(storage)).toBe(localProject.id);
});

test("renames, duplicates, archives, restores, and deletes projects", () => {
  const storage = new MemoryStorage();
  const project = createProject(
    {
      name: "阅读 App",
      sourceIdea: "阅读 app",
    },
    storage,
  );

  const renamed = updateProject(project.id, { name: "Reading Studio" }, storage);
  const copy = duplicateProject(project.id, storage);
  const archived = archiveProject(project.id, storage);
  const restored = restoreProject(project.id, storage);
  const deleted = copy ? deleteProject(copy.id, storage) : false;

  expect(renamed?.name).toBe("Reading Studio");
  expect(copy?.name).toBe("Reading Studio 副本");
  expect(copy?.id).not.toBe(project.id);
  expect(archived?.status).toBe("archived");
  expect(restored?.status).toBe("empty");
  expect(deleted).toBe(true);
  expect(readProjects(storage).some((item) => item.id === copy?.id)).toBe(false);
});

test("updates only the selected project when a run completes", () => {
  const storage = new MemoryStorage();
  const first = createProject({ sourceIdea: "阅读 app" }, storage);
  const second = createProject({ sourceIdea: "咖啡店订货工具" }, storage);
  const pack = buildProductPackFromIdea("阅读 app");

  updateProject(first.id, {
    productPack: pack,
    status: "ready",
  }, storage);

  const projects = readProjects(storage);
  const updatedFirst = projects.find((project) => project.id === first.id);
  const untouchedSecond = projects.find((project) => project.id === second.id);

  expect(updatedFirst?.productPack?.id).toBe(pack.id);
  expect(updatedFirst?.status).toBe("ready");
  expect(untouchedSecond?.productPack).toBeUndefined();
  expect(untouchedSecond?.status).toBe("empty");
});
