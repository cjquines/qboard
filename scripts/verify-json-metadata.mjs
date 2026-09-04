import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { build } from "esbuild";

const scriptDirectory = resolve(fileURLToPath(import.meta.url), "..");
const projectDirectory = resolve(scriptDirectory, "..");
const temporaryDirectory = await mkdtemp(
  resolve(tmpdir(), "qboard-json-metadata-"),
);
const proofEntry = resolve(temporaryDirectory, "proof.ts");
const proofBundle = resolve(temporaryDirectory, "proof.mjs");
const filesModule = resolve(projectDirectory, "src/lib/files.ts");

try {
  await writeFile(
    proofEntry,
    `
      import assert from "node:assert/strict";
      import { JSONReader, JSONWriter } from ${JSON.stringify(filesModule)};

      const pages = [];
      const exportedDate = new Date("2026-09-04T12:34:56.789Z");
      const saved = JSON.parse(new JSONWriter(pages, exportedDate).toString());

      assert.deepEqual(saved, {
        "qboard-version": 3,
        pages,
        "exported-date": "2026-09-04T12:34:56.789Z",
      });
      assert.deepEqual(JSONReader.readParsed(saved), pages);
      assert.deepEqual(JSONReader.readParsed(pages), pages);
      for (const version of [1, 2, 3]) {
        assert.deepEqual(JSONReader.readParsed({ "qboard-version": version, pages }), pages);
      }
      assert.deepEqual(
        JSONReader.readParsed({ "qboard-version": 3, pages, "future-field": true }),
        pages,
      );
    `,
  );
  await build({
    bundle: true,
    entryPoints: [proofEntry],
    format: "esm",
    outfile: proofBundle,
    platform: "node",
  });
  await import(pathToFileURL(proofBundle).href);
  console.log("JSON metadata export and compatibility checks passed.");
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
