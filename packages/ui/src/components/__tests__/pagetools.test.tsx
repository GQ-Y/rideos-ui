import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Affix } from "../Affix";
import { Anchor } from "../Anchor";
import { Scrollbar } from "../Scrollbar";
import { Splitter } from "../Splitter";
import { Watermark } from "../Watermark";

afterEach(() => {
  vi.restoreAllMocks();
});

function rectWithTop(top: number, width = 100, height = 50): DOMRect {
  return {
    x: 0,
    y: top,
    top,
    left: 0,
    right: width,
    bottom: top + height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("Watermark", () => {
  beforeEach(() => {
    const ctxStub = {
      measureText: () => ({ width: 60 }),
      scale: () => {},
      translate: () => {},
      rotate: () => {},
      fillText: () => {},
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctxStub);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/png;base64,x",
    );
  });

  it("渲染内容与平铺水印层", () => {
    const { container } = render(
      <Watermark content={["机密", "RideOS"]}>
        <div>业务内容</div>
      </Watermark>,
    );
    expect(screen.getByText("业务内容")).toBeInTheDocument();

    const layer = container.querySelector(".rideos-watermark-layer") as HTMLElement;
    expect(layer).toBeTruthy();
    expect(layer.style.backgroundImage).toContain("data:image/png;base64,x");
    expect(layer.style.zIndex).toBe("9");
  });

  it("取不到 2d 上下文时只渲染内容,不绘制水印层", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { container } = render(
      <Watermark content="机密">
        <span>内容</span>
      </Watermark>,
    );
    expect(screen.getByText("内容")).toBeInTheDocument();
    expect(container.querySelector(".rideos-watermark-layer")).toBeNull();
  });
});

describe("Scrollbar", () => {
  it("渲染滚动容器,数字高度按 px 生效", () => {
    const { container } = render(
      <Scrollbar height={200} className="custom">
        <p>列表内容</p>
      </Scrollbar>,
    );
    const el = container.querySelector(".rideos-scrollbar") as HTMLElement;
    expect(el).toHaveClass("custom");
    expect(el.style.height).toBe("200px");
    expect(screen.getByText("列表内容")).toBeInTheDocument();
  });

  it("maxHeight 支持字符串值透传", () => {
    const { container } = render(<Scrollbar maxHeight="50vh">内容</Scrollbar>);
    const el = container.querySelector(".rideos-scrollbar") as HTMLElement;
    expect(el.style.maxHeight).toBe("50vh");
  });
});

describe("Splitter", () => {
  it("按 defaultRatio 分配两个面板,超界时收敛到 min/max", () => {
    const { container } = render(
      <Splitter defaultRatio={0.3}>
        <div>左侧</div>
        <div>右侧</div>
      </Splitter>,
    );
    const panes = container.querySelectorAll<HTMLElement>(".rideos-splitter-pane");
    expect(panes).toHaveLength(2);
    expect(panes[0].style.flexGrow).toBe("0.3");
    expect(panes[1].style.flexGrow).toBe("0.7");
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");

    const { container: clamped } = render(
      <Splitter defaultRatio={0.95}>
        <div>A</div>
        <div>B</div>
      </Splitter>,
    );
    const clampedPane = clamped.querySelector(".rideos-splitter-pane") as HTMLElement;
    expect(clampedPane.style.flexGrow).toBe("0.85");
  });

  it("拖拽分隔条按容器比例更新并触发回调", () => {
    const onRatioChange = vi.fn();
    const { container } = render(
      <Splitter defaultRatio={0.5} onRatioChange={onRatioChange}>
        <div>A</div>
        <div>B</div>
      </Splitter>,
    );
    const root = container.querySelector(".rideos-splitter") as HTMLElement;
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue(rectWithTop(0, 200, 100));

    fireEvent.mouseDown(container.querySelector(".rideos-splitter-bar") as HTMLElement, {
      clientX: 100,
    });
    expect(root).toHaveClass("is-dragging");

    fireEvent.mouseMove(document, { clientX: 150 });
    expect(onRatioChange).toHaveBeenLastCalledWith(0.75);

    /* 超出 max 收敛到 0.85 */
    fireEvent.mouseMove(document, { clientX: 400 });
    expect(onRatioChange).toHaveBeenLastCalledWith(0.85);

    fireEvent.mouseUp(document);
    expect(root).not.toHaveClass("is-dragging");
    /* 松开后不再响应移动 */
    fireEvent.mouseMove(document, { clientX: 100 });
    expect(onRatioChange).toHaveBeenCalledTimes(2);

    const panes = container.querySelectorAll<HTMLElement>(".rideos-splitter-pane");
    expect(panes[0].style.flexGrow).toBe("0.85");
  });
});

describe("Anchor", () => {
  const sections: HTMLElement[] = [];

  function addSection(id: string, initialTop: number): { top: number } {
    const el = document.createElement("div");
    el.id = id;
    document.body.appendChild(el);
    sections.push(el);
    const pos = { top: initialTop };
    vi.spyOn(el, "getBoundingClientRect").mockImplementation(() => rectWithTop(pos.top));
    return pos;
  }

  afterEach(() => {
    sections.splice(0).forEach((el) => el.remove());
  });

  it("滚动时高亮最后一个越过顶部的区块并触发 onChange", () => {
    const posA = addSection("sec-a", 300);
    const posB = addSection("sec-b", 800);
    const onChange = vi.fn();
    const { container } = render(
      <Anchor
        items={[
          { key: "a", href: "#sec-a", title: "区块 A" },
          { key: "b", href: "#sec-b", title: "区块 B" },
        ]}
        onChange={onChange}
      />,
    );
    expect(container.querySelector(".rideos-anchor-ink")).toBeTruthy();
    expect(container.querySelector(".rideos-anchor-item.is-active")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();

    posA.top = -20;
    fireEvent.scroll(window);
    expect(onChange).toHaveBeenLastCalledWith("a");
    expect(screen.getByText("区块 A")).toHaveClass("is-active");

    posB.top = 0;
    fireEvent.scroll(window);
    expect(onChange).toHaveBeenLastCalledWith("b");
    expect(screen.getByText("区块 B")).toHaveClass("is-active");
    expect(screen.getByText("区块 A")).not.toHaveClass("is-active");
  });

  it("点击锚点平滑滚动到 offsetTop 校正后的位置并高亮", () => {
    addSection("sec-target", 500);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const onChange = vi.fn();
    render(
      <Anchor
        items={[{ key: "t", href: "#sec-target", title: "目标区块" }]}
        offsetTop={64}
        onChange={onChange}
      />,
    );

    const link = screen.getByText("目标区块");
    expect(link).toHaveAttribute("href", "#sec-target");
    fireEvent.click(link);

    expect(scrollTo).toHaveBeenCalledWith({ top: 436, behavior: "smooth" });
    expect(onChange).toHaveBeenCalledWith("t");
    expect(link).toHaveClass("is-active");
  });
});

describe("Affix", () => {
  it("原位置滚过 offsetTop 后固定并保留占位,回滚后还原", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Affix offsetTop={20} onChange={onChange}>
        <button type="button">操作按钮</button>
      </Affix>,
    );
    const outer = container.querySelector(".rideos-affix") as HTMLElement;
    const pos = { top: 100 };
    vi.spyOn(outer, "getBoundingClientRect").mockImplementation(() =>
      rectWithTop(pos.top, 200, 40),
    );

    fireEvent.scroll(window);
    expect(container.querySelector(".rideos-affix-fixed")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();

    pos.top = 5;
    fireEvent.scroll(window);
    const fixed = container.querySelector(".rideos-affix-fixed") as HTMLElement;
    expect(fixed).toBeTruthy();
    expect(fixed.style.top).toBe("20px");
    expect(fixed.style.width).toBe("200px");
    const placeholder = container.querySelector(".rideos-affix-placeholder") as HTMLElement;
    expect(placeholder.style.height).toBe("40px");
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("button", { name: "操作按钮" })).toBeInTheDocument();

    pos.top = 100;
    fireEvent.scroll(window);
    expect(container.querySelector(".rideos-affix-fixed")).toBeNull();
    expect(container.querySelector(".rideos-affix-placeholder")).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("自定义滚动容器时按容器顶部计算固定位置", () => {
    const scroller = document.createElement("div");
    vi.spyOn(scroller, "getBoundingClientRect").mockReturnValue(rectWithTop(50, 400, 300));
    const onChange = vi.fn();
    const { container } = render(
      <Affix target={() => scroller} onChange={onChange}>
        <span>工具条</span>
      </Affix>,
    );
    const outer = container.querySelector(".rideos-affix") as HTMLElement;
    const pos = { top: 200 };
    vi.spyOn(outer, "getBoundingClientRect").mockImplementation(() =>
      rectWithTop(pos.top, 200, 40),
    );

    fireEvent.scroll(scroller);
    expect(container.querySelector(".rideos-affix-fixed")).toBeNull();

    pos.top = 30;
    fireEvent.scroll(scroller);
    const fixed = container.querySelector(".rideos-affix-fixed") as HTMLElement;
    expect(fixed).toBeTruthy();
    expect(fixed.style.top).toBe("50px");
    expect(onChange).toHaveBeenLastCalledWith(true);
  });
});
