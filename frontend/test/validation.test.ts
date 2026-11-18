import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzePrompt } from "../src/lib/studio/analyze";
import { generateFiles } from "../src/lib/studio/generate";
import { applyInstruction } from "../src/lib/studio/iterate";
import { materialize, validateBundle } from "../src/lib/studio/pipeline";
import type { AppType, Blueprint, GeneratedFile } from "../src/lib/studio/types";

const CASES: Array<{ appType: AppType; prompt: string }> = [
  { appType: "fullstack", prompt: "Build a notes app with title, body and tags" },
  { appType: "mobile", prompt: "Build a habit tracker with name and streak" },
  { appType: "landing", prompt: "Build a landing page for a photography studio" },
];

const primary = CASES[0];

function plan(candidate: { appType: AppType; prompt: string }): Blueprint {
  return analyzePrompt(candidate.prompt, candidate.appType);
}

function filesFor(candidate: { appType: AppType; prompt: string }, jobId = "test-job"): GeneratedFile[] {
  return generateFiles(plan(candidate), jobId);
}

function findFile(files: GeneratedFile[], path: string): GeneratedFile {
  const entry = files.find((file) => file.path === path);
  assert.ok(entry, `expected ${path} in the bundle`);
  return entry;
}

function defective(files: GeneratedFile[], mutate: (copy: GeneratedFile[]) => void): GeneratedFile[] {
  const copy = files.map((file) => ({ ...file }));
  mutate(copy);
  return copy;
}

describe("generated bundles", () => {
  for (const candidate of CASES) {
    it(`passes validation for ${candidate.appType}`, () => {
      const blueprint = plan(candidate);
      assert.deepEqual(validateBundle(blueprint, generateFiles(blueprint, "test-job")), []);
    });
  }

  it("ships the five hostable files", () => {
    const files = filesFor(primary);
    assert.deepEqual(
      files.map((file) => file.path),
      ["index.html", "styles.css", "app.js", "schema.json", "README.md"]
    );
  });

  it("is deterministic for the same blueprint", () => {
    const blueprint = plan(primary);
    assert.deepEqual(generateFiles(blueprint, "job-a"), generateFiles(blueprint, "job-a"));
  });

  it("materializes with an honest Reviewer message", () => {
    const bundle = materialize(plan(primary), "test-job", "Built the first version.");
    assert.equal(bundle.files.length, 5);
    const reviewer = bundle.events.find((event) => event.agent === "Reviewer");
    assert.ok(reviewer, "expected a Reviewer event");
    assert.match(reviewer.message, /asset links resolve locally/);
    assert.match(reviewer.message, /JavaScript parses/);
    assert.match(reviewer.message, /schema matches blueprint/);
  });

  it("stays valid after chat edits", () => {
    let blueprint = plan(primary);
    for (const instruction of ["add a due date field", "use a teal accent", "remove the CSV export"]) {
      const outcome = applyInstruction(blueprint, instruction);
      assert.ok(outcome.ok, `edit should apply: ${instruction}`);
      blueprint = outcome.blueprint;
    }
    assert.deepEqual(validateBundle(blueprint, generateFiles(blueprint, "test-job")), []);
  });
});

describe("bundle validation", () => {
  const baseline = filesFor(primary);

  const rejections: Array<{ name: string; expected: string; mutate: (files: GeneratedFile[]) => void }> = [
    {
      name: "JavaScript with a syntax error",
      expected: "has a syntax error",
      mutate: (files) => {
        findFile(files, "app.js").content = "function () {";
      },
    },
    {
      name: "an asset reference without a matching file",
      expected: "references missing file logo.png",
      mutate: (files) => {
        const html = findFile(files, "index.html");
        html.content = html.content.replace("</body>", '<img src="logo.png" /></body>');
      },
    },
    {
      name: "an external script",
      expected: "external resource https://cdn.example.com/x.js",
      mutate: (files) => {
        const html = findFile(files, "index.html");
        html.content = html.content.replace("</body>", '<script src="https://cdn.example.com/x.js"></script></body>');
      },
    },
    {
      name: "an external CSS background",
      expected: "external resource https://cdn.example.com/bg.png",
      mutate: (files) => {
        findFile(files, "styles.css").content += "\nbody{background:url(https://cdn.example.com/bg.png)}";
      },
    },
    {
      name: "a schema that drifted from the blueprint",
      expected: "fields do not match the blueprint",
      mutate: (files) => {
        const schema = findFile(files, "schema.json");
        const parsed = JSON.parse(schema.content) as { fields: unknown[] };
        parsed.fields.pop();
        schema.content = JSON.stringify(parsed);
      },
    },
    {
      name: "a missing README",
      expected: "missing README.md",
      mutate: (files) => {
        files.splice(
          files.findIndex((file) => file.path === "README.md"),
          1
        );
      },
    },
  ];

  it("accepts the untouched baseline", () => {
    assert.deepEqual(validateBundle(plan(primary), baseline), []);
  });

  for (const { name, expected, mutate } of rejections) {
    it(`rejects ${name}`, () => {
      const problems = validateBundle(plan(primary), defective(baseline, mutate));
      assert.ok(problems.length > 0, "the bundle should be rejected");
      assert.ok(
        problems.some((problem) => problem.includes(expected)),
        `expected a problem mentioning "${expected}", got: ${problems.join(" | ") || "none"}`
      );
    });
  }
});
