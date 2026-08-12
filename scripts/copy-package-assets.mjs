import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const packageRoot = process.cwd();
const source = path.join(packageRoot, "src", "styles");
const destination = path.join(packageRoot, "dist", "styles");

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true, force: true });

console.log(`Copied package styles to ${path.relative(packageRoot, destination)}`);
