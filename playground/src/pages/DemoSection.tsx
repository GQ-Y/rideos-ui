import type { ReactNode } from "react";

/** 演示页小节:标题 + 说明 + 内容区 */
export function DemoSection({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children?: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 15 }}>{title}</h3>
      {desc ? <p style={{ margin: "0 0 12px", color: "#8f959e", fontSize: 12 }}>{desc}</p> : null}
      <div style={{ marginTop: desc ? 0 : 12 }}>{children}</div>
    </section>
  );
}

/** 行内排列容器 */
export function DemoRow({ children }: { children?: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      {children}
    </div>
  );
}
