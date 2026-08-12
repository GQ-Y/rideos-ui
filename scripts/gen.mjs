/**
 * 组件脚手架:pnpm gen <ComponentName>
 * 在 packages/ui/src/components 下生成组件目录(tsx / index / 测试)。
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const name = process.argv[2];
if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  console.error("用法: pnpm gen <ComponentName>(大驼峰,如 DatePicker)");
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = resolve(root, "packages/ui/src/components", name);
if (existsSync(dir)) {
  console.error(`组件已存在: ${dir}`);
  process.exit(1);
}

const kebab = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

mkdirSync(resolve(dir, "__tests__"), { recursive: true });

writeFileSync(
  resolve(dir, `${name}.tsx`),
  `import { cx } from "../../utils/cx";

export interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${name}({ className, children }: ${name}Props) {
  return <div className={cx("rideos-${kebab}", className)}>{children}</div>;
}
`,
);

writeFileSync(resolve(dir, "index.ts"), `export * from "./${name}";\n`);

writeFileSync(
  resolve(dir, "__tests__", `${name}.test.tsx`),
  `import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ${name} } from "../${name}";

describe("${name}", () => {
  it("renders children", () => {
    render(<${name}>content</${name}>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
`,
);

console.log(`已生成 ${dir}`);
console.log(
  `记得:1) 在 packages/ui/src/index.ts 增加导出 2) 在 styles 中补充 .rideos-${kebab} 样式`,
);
