import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npm = "npm";
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "rideos-ui-package-"));
const artifacts = path.join(temporaryRoot, "artifacts");

function run(command, args, cwd, capture = false) {
  const isWindows = process.platform === "win32";
  const executable = isWindows ? process.env.ComSpec : command;
  const commandArgs = isWindows
    ? [
        "/d",
        "/s",
        "/c",
        [command, ...args.map((value) => `"${value.replaceAll('"', '""')}"`)].join(" "),
      ]
    : args;
  const result = spawnSync(executable, commandArgs, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, npm_config_registry: "https://registry.npmjs.org/" },
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    windowsVerbatimArguments: isWindows,
  });
  if (result.status !== 0) {
    if (capture) {
      process.stderr.write(result.stdout ?? "");
      process.stderr.write(result.stderr ?? "");
    }
    throw new Error(
      `${command} ${args.join(" ")} exited with ${result.status}: ${result.error?.message ?? "unknown error"}`,
    );
  }
  return result.stdout ?? "";
}

async function pack(relativePackagePath) {
  const packagePath = path.join(workspaceRoot, relativePackagePath);
  const output = run(
    npm,
    ["pack", packagePath, "--ignore-scripts", "--pack-destination", artifacts, "--json"],
    workspaceRoot,
    true,
  );
  const metadata = JSON.parse(output)[0];
  const paths = metadata.files.map((file) => file.path.replaceAll("\\", "/"));

  for (const forbidden of [/^src\//, /__tests__/, /\.test\.[cm]?[jt]sx?$/]) {
    const match = paths.find((entry) => forbidden.test(entry));
    if (match) throw new Error(`${metadata.name} tarball contains forbidden entry: ${match}`);
  }

  for (const required of ["package.json", "README.md", "LICENSE", "NOTICE", "dist/index.d.ts"]) {
    if (!paths.includes(required))
      throw new Error(`${metadata.name} tarball is missing ${required}`);
  }

  if (!paths.some((entry) => /^dist\/rideos-.+\.js$/.test(entry))) {
    throw new Error(`${metadata.name} tarball is missing its ESM bundle`);
  }
  if (!paths.some((entry) => /^dist\/styles\/.+\.css$/.test(entry))) {
    throw new Error(`${metadata.name} tarball is missing CSS under dist/styles`);
  }

  console.log(
    `${metadata.name}@${metadata.version}: ${metadata.entryCount} entries, ${metadata.size} packed bytes`,
  );
  return metadata.filename;
}

async function writeConsumer(reactMajor, uiTarball, chartsTarball) {
  const consumer = path.join(temporaryRoot, `react-${reactMajor}`);
  const relativeArtifact = (filename) => `file:../artifacts/${filename}`;
  await mkdir(path.join(consumer, "src"), { recursive: true });

  await writeFile(
    path.join(consumer, "package.json"),
    JSON.stringify(
      {
        name: `rideos-package-consumer-react-${reactMajor}`,
        private: true,
        type: "module",
        scripts: { typecheck: "tsc --noEmit", build: "vite build", ssr: "node ssr.mjs" },
        dependencies: {
          "@ant-design/icons": "6.3.2",
          "@rideos-ai/charts": relativeArtifact(chartsTarball),
          "@rideos-ai/ui": relativeArtifact(uiTarball),
          react: reactMajor === 18 ? "18.3.1" : "19.2.8",
          "react-dom": reactMajor === 18 ? "18.3.1" : "19.2.8",
        },
        devDependencies: {
          "@types/node": "^24.0.0",
          "@types/react": reactMajor === 18 ? "^18.3.0" : "^19.2.0",
          "@types/react-dom": reactMajor === 18 ? "^18.3.0" : "^19.2.0",
          "@vitejs/plugin-react": "6.0.5",
          typescript: "5.9.2",
          vite: "8.2.1",
        },
      },
      null,
      2,
    ) + "\n",
  );
  await writeFile(
    path.join(consumer, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          lib: ["ESNext", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: false,
          noEmit: true,
        },
        include: ["src", "vite.config.ts"],
      },
      null,
      2,
    ) + "\n",
  );
  await writeFile(
    path.join(consumer, "vite.config.ts"),
    'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nexport default defineConfig({ plugins: [react()] });\n',
  );
  await writeFile(
    path.join(consumer, "index.html"),
    '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
  );
  await writeFile(
    path.join(consumer, "src", "main.tsx"),
    `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@rideos-ai/ui/styles.css";
import "@rideos-ai/charts/styles.css";
import { Button, PageCard, RichTextEditor } from "@rideos-ai/ui";
import { LineChart } from "@rideos-ai/charts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PageCard>
      <Button variant="primary">Package smoke test</Button>
      <RichTextEditor defaultValue="<p>Package editor smoke test</p>" minHeight={120} />
      <LineChart categories={["A", "B"]} series={[{ name: "S", data: [1, 2] }]} />
    </PageCard>
  </StrictMode>,
);
`,
  );
  await writeFile(
    path.join(consumer, "ssr.mjs"),
    `import React from "react";
import { renderToString } from "react-dom/server";
import { Button, RichTextEditor } from "@rideos-ai/ui";
import { LineChart } from "@rideos-ai/charts";

const button = renderToString(React.createElement(Button, null, "SSR"));
const richText = renderToString(React.createElement(RichTextEditor, {
  value: "<p>SSR editor</p>",
  readOnly: true,
  toolbar: false,
}));
const chart = renderToString(React.createElement(LineChart, {
  categories: ["A"],
  series: [{ name: "S", data: [1] }],
  width: 400,
  height: 200,
}));
if (!button.includes("SSR") || !richText.includes("rideos-richtext-editor") || !chart.includes("svg")) {
  throw new Error("SSR smoke test failed");
}
console.log("SSR smoke test passed");
`,
  );

  console.log(`Verifying independent React ${reactMajor} consumer...`);
  run(npm, ["install", "--ignore-scripts", "--no-audit", "--no-fund"], consumer);
  run(npm, ["run", "typecheck"], consumer);
  run(npm, ["run", "build"], consumer);
  run(npm, ["run", "ssr"], consumer);

  const builtAssets = await readdir(path.join(consumer, "dist", "assets"));
  if (!builtAssets.some((entry) => entry.endsWith(".css"))) {
    throw new Error(`React ${reactMajor} consumer build did not emit CSS`);
  }
}

await mkdir(artifacts, { recursive: true });

try {
  const uiTarball = await pack("packages/ui");
  const chartsTarball = await pack("packages/charts");
  await writeConsumer(18, uiTarball, chartsTarball);
  await writeConsumer(19, uiTarball, chartsTarball);
  console.log("Package verification passed for React 18 and React 19.");
} finally {
  const expectedPrefix = path.join(os.tmpdir(), "rideos-ui-package-");
  if (temporaryRoot.startsWith(expectedPrefix) && process.env.KEEP_PACKAGE_VERIFY_TEMP !== "1") {
    await rm(temporaryRoot, { recursive: true, force: true });
  } else {
    console.log(`Package verification files kept at ${temporaryRoot}`);
  }
}
