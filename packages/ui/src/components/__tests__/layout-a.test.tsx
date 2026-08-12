import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Container } from "../Container";
import { Flex } from "../Flex";
import { Col, Row } from "../Grid";
import { Layout, LayoutContent, LayoutFooter, LayoutHeader, LayoutSider } from "../Layout";

describe("Layout", () => {
  it("默认纵向,包含 Sider 时自动横向", () => {
    const { container, rerender } = render(
      <Layout>
        <LayoutHeader>头部</LayoutHeader>
        <LayoutContent>内容</LayoutContent>
        <LayoutFooter>底部</LayoutFooter>
      </Layout>,
    );
    const root = container.querySelector(".rideos-layout") as HTMLElement;
    expect(root.classList.contains("rideos-layout-has-sider")).toBe(false);
    expect(screen.getByText("头部")).toBeInTheDocument();
    expect(screen.getByText("底部")).toBeInTheDocument();

    rerender(
      <Layout>
        <LayoutSider>菜单</LayoutSider>
        <LayoutContent>内容</LayoutContent>
      </Layout>,
    );
    expect(container.querySelector(".rideos-layout-has-sider")).toBeTruthy();
  });

  it("Sider 默认宽 220,折叠后切到折叠宽度 72", () => {
    const { container, rerender } = render(
      <Layout>
        <LayoutSider>菜单</LayoutSider>
        <LayoutContent>内容</LayoutContent>
      </Layout>,
    );
    const sider = container.querySelector(".rideos-layout-sider") as HTMLElement;
    expect(sider.style.width).toBe("220px");
    expect(sider.classList.contains("is-collapsed")).toBe(false);

    rerender(
      <Layout>
        <LayoutSider collapsed>菜单</LayoutSider>
        <LayoutContent>内容</LayoutContent>
      </Layout>,
    );
    expect(sider.style.width).toBe("72px");
    expect(sider.classList.contains("is-collapsed")).toBe(true);
  });

  it("Sider 自定义 width 与 collapsedWidth", () => {
    const { container } = render(
      <Layout>
        <LayoutSider width={260} collapsed collapsedWidth={56}>
          菜单
        </LayoutSider>
        <LayoutContent>内容</LayoutContent>
      </Layout>,
    );
    const sider = container.querySelector(".rideos-layout-sider") as HTMLElement;
    expect(sider.style.width).toBe("56px");
  });
});

describe("Row / Col", () => {
  it("span 与 offset 按 24 栅格换算宽度", () => {
    const { container } = render(
      <Row>
        <Col span={12}>甲</Col>
        <Col span={6} offset={6}>
          乙
        </Col>
      </Row>,
    );
    const cols = container.querySelectorAll<HTMLElement>(".rideos-col");
    expect(cols[0].style.width).toBe("50%");
    expect(cols[1].style.width).toBe("25%");
    expect(cols[1].style.marginLeft).toBe("25%");
  });

  it("gutter 通过 Row 负 margin 与 Col padding 实现", () => {
    const { container } = render(
      <Row gutter={[16, 8]}>
        <Col span={12}>甲</Col>
        <Col span={12}>乙</Col>
      </Row>,
    );
    const row = container.querySelector(".rideos-row") as HTMLElement;
    expect(row.style.marginLeft).toBe("-8px");
    expect(row.style.marginRight).toBe("-8px");
    expect(row.style.marginTop).toBe("-4px");
    const col = container.querySelector(".rideos-col") as HTMLElement;
    expect(col.style.paddingLeft).toBe("8px");
    expect(col.style.paddingRight).toBe("8px");
    expect(col.style.paddingTop).toBe("4px");
  });

  it("align / justify 类名与 flex 列覆盖 span", () => {
    const { container } = render(
      <Row align="middle" justify="space-between">
        <Col flex="1">甲</Col>
      </Row>,
    );
    const row = container.querySelector(".rideos-row") as HTMLElement;
    expect(row.classList.contains("align-middle")).toBe(true);
    expect(row.classList.contains("justify-space-between")).toBe(true);
    const col = container.querySelector(".rideos-col") as HTMLElement;
    expect(col.style.width).toBe("");
    expect(col.getAttribute("style") ?? "").toContain("flex");
  });
});

describe("Flex", () => {
  it("方向 / 对齐 / 间距 / 换行全部生效", () => {
    const { container } = render(
      <Flex direction="column" align="center" justify="space-between" gap={12} wrap>
        <span>甲</span>
        <span>乙</span>
      </Flex>,
    );
    const flex = container.querySelector(".rideos-flex") as HTMLElement;
    expect(flex.style.flexDirection).toBe("column");
    expect(flex.style.alignItems).toBe("center");
    expect(flex.style.justifyContent).toBe("space-between");
    expect(flex.style.gap).toBe("12px");
    expect(flex.style.flexWrap).toBe("wrap");
  });

  it("默认不换行且正常渲染子元素", () => {
    const { container } = render(
      <Flex>
        <span>甲</span>
      </Flex>,
    );
    const flex = container.querySelector(".rideos-flex") as HTMLElement;
    expect(flex.style.flexWrap).toBe("");
    expect(screen.getByText("甲")).toBeInTheDocument();
  });
});

describe("Container", () => {
  it("默认 1200 定宽且带内边距", () => {
    const { container } = render(<Container>页面内容</Container>);
    const el = container.querySelector(".rideos-container") as HTMLElement;
    expect(el.style.maxWidth).toBe("1200px");
    expect(el.classList.contains("is-padded")).toBe(true);
    expect(screen.getByText("页面内容")).toBeInTheDocument();
  });

  it("自定义 maxWidth 与关闭内边距", () => {
    const { container } = render(
      <Container maxWidth={960} padded={false}>
        页面内容
      </Container>,
    );
    const el = container.querySelector(".rideos-container") as HTMLElement;
    expect(el.style.maxWidth).toBe("960px");
    expect(el.classList.contains("is-padded")).toBe(false);
  });
});
