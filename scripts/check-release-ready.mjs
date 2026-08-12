import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageFiles = ["packages/ui/package.json", "packages/charts/package.json"];
const errors = [];

function fail(message) {
  errors.push(message);
}

for (const relativePath of packageFiles) {
  const filename = path.join(workspaceRoot, relativePath);
  const manifest = JSON.parse(await readFile(filename, "utf8"));
  const label = manifest.name ?? relativePath;

  if (manifest.license !== "Apache-2.0") fail(`${label}: license must be Apache-2.0`);
  if (manifest.publishConfig?.access !== "public")
    fail(`${label}: publishConfig.access must be public`);
  if (manifest.publishConfig?.registry !== "https://registry.npmjs.org/") {
    fail(`${label}: publishConfig.registry must be https://registry.npmjs.org/`);
  }
  if (!Array.isArray(manifest.files) || manifest.files.includes("src")) {
    fail(`${label}: published files must not include src`);
  }
  if (!manifest.scripts?.prepack) fail(`${label}: prepack build guard is required`);

  const repositoryUrl =
    typeof manifest.repository === "string" ? manifest.repository : manifest.repository?.url;
  if (!repositoryUrl) {
    fail(`${label}: repository.url is required before Trusted Publishing can be enabled`);
  } else if (process.env.GITHUB_REPOSITORY) {
    const expected = `github.com/${process.env.GITHUB_REPOSITORY}`.toLowerCase();
    if (!repositoryUrl.toLowerCase().includes(expected)) {
      fail(`${label}: repository.url must match ${process.env.GITHUB_REPOSITORY}`);
    }
  }
}

const npmrc = await readFile(path.join(workspaceRoot, ".npmrc"), "utf8");
if (!/^registry=https:\/\/registry\.npmjs\.org\/$/m.test(npmrc)) {
  fail(".npmrc must use the official npm registry");
}

let origin = "";
try {
  origin = execFileSync("git", ["remote", "get-url", "origin"], {
    cwd: workspaceRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
} catch {
  // Reported below with the repository metadata failure.
}

if (!origin) fail("git remote 'origin' is required before release");

const status = execFileSync("git", ["status", "--porcelain"], {
  cwd: workspaceRoot,
  encoding: "utf8",
});
if (status.trim()) fail("git worktree must be clean before release");

if (errors.length > 0) {
  console.error("Release preflight failed:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Release preflight passed.");
