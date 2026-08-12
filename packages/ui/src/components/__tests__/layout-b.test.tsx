import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackTop } from "../BackTop";
import { Carousel } from "../Carousel";
import { Image } from "../Image";
import { Rate } from "../Rate";
import { Slider } from "../Slider";

function mockRect(el: HTMLElement, rect: { left: number; width: number }) {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    x: rect.left,
    y: 0,
    left: rect.left,
    top: 0,
    right: rect.left + rect.width,
    bottom: 6,
    width: rect.width,
    height: 6,
    toJSON: () => ({}),
  } as DOMRect);
}

describe("Image", () => {
  it("渲染图片与 objectFit 填充方式", () => {
    render(
      <Image src="/car.png" alt="车辆" fit="contain" width={200} height={120} preview={false} />,
    );
    const img = screen.getByRole("img", { name: "车辆" });
    expect(img).toHaveAttribute("src", "/car.png");
    expect((img as HTMLElement).style.objectFit).toBe("contain");
  });

  it("加载失败显示占位内容", () => {
    const { container } = render(
      <Image src="/broken.png" alt="车辆" fallback={<span>加载失败</span>} />,
    );
    fireEvent.error(container.querySelector(".rideos-image-img") as HTMLElement);
    expect(screen.getByText("加载失败")).toBeInTheDocument();
    expect(container.querySelector(".rideos-image-img")).toBeNull();
  });

  it("点击打开全屏预览,Esc 与点击遮罩关闭", () => {
    const { container } = render(<Image src="/car.png" alt="车辆" />);
    expect(document.querySelector(".rideos-image-preview")).toBeNull();

    fireEvent.click(container.querySelector(".rideos-image-img") as HTMLElement);
    expect(document.querySelector(".rideos-image-preview")).toBeTruthy();
    /* 点击大图本身不关闭 */
    fireEvent.click(document.querySelector(".rideos-image-preview-img") as HTMLElement);
    expect(document.querySelector(".rideos-image-preview")).toBeTruthy();
    /* Esc 关闭 */
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.querySelector(".rideos-image-preview")).toBeNull();

    /* 再次打开后点击遮罩关闭 */
    fireEvent.click(container.querySelector(".rideos-image-img") as HTMLElement);
    fireEvent.click(document.querySelector(".rideos-image-preview") as HTMLElement);
    expect(document.querySelector(".rideos-image-preview")).toBeNull();
  });
});

describe("Carousel", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("箭头与圆点切换,首尾循环", () => {
    const { container } = render(
      <Carousel autoPlay={false}>
        <div>第一屏</div>
        <div>第二屏</div>
        <div>第三屏</div>
      </Carousel>,
    );
    const track = container.querySelector(".rideos-carousel-track") as HTMLElement;
    expect(track.style.transform).toBe("translateX(0%)");

    fireEvent.click(screen.getByRole("button", { name: "下一张" }));
    expect(track.style.transform).toBe("translateX(-100%)");

    fireEvent.click(screen.getByRole("button", { name: "上一张" }));
    fireEvent.click(screen.getByRole("button", { name: "上一张" }));
    expect(track.style.transform).toBe("translateX(-200%)");

    fireEvent.click(screen.getByRole("tab", { name: "切换到第 2 张" }));
    expect(track.style.transform).toBe("translateX(-100%)");
    expect(container.querySelectorAll(".rideos-carousel-dot")[1].classList.contains("is-active")).toBe(
      true,
    );
  });

  it("自动循环播放,悬停暂停", () => {
    vi.useFakeTimers();
    const { container } = render(
      <Carousel interval={4000} arrows={false} dots={false}>
        <div>第一屏</div>
        <div>第二屏</div>
      </Carousel>,
    );
    const track = container.querySelector(".rideos-carousel-track") as HTMLElement;

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(track.style.transform).toBe("translateX(-100%)");

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(track.style.transform).toBe("translateX(0%)");

    fireEvent.mouseEnter(container.querySelector(".rideos-carousel") as HTMLElement);
    act(() => {
      vi.advanceTimersByTime(12000);
    });
    expect(track.style.transform).toBe("translateX(0%)");

    fireEvent.mouseLeave(container.querySelector(".rideos-carousel") as HTMLElement);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(track.style.transform).toBe("translateX(-100%)");
  });
});

describe("Slider", () => {
  it("点击与拖拽轨道更新数值,拖动时气泡显示", () => {
    const onChange = vi.fn();
    const { container } = render(<Slider defaultValue={0} onChange={onChange} showValue />);
    mockRect(container.querySelector(".rideos-slider-rail") as HTMLElement, {
      left: 0,
      width: 100,
    });

    fireEvent.mouseDown(container.querySelector(".rideos-slider") as HTMLElement, { clientX: 30 });
    expect(onChange).toHaveBeenCalledWith(30);
    expect(container.querySelector(".rideos-slider-bubble")).toHaveTextContent("30");

    fireEvent.mouseMove(document, { clientX: 62 });
    expect(onChange).toHaveBeenLastCalledWith(62);

    fireEvent.mouseUp(document);
    expect(container.querySelector(".rideos-slider-bubble")).toBeNull();
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "62");
  });

  it("键盘左右方向键按 step 步进", () => {
    const onChange = vi.fn();
    render(<Slider defaultValue={50} step={10} onChange={onChange} />);
    const handle = screen.getByRole("slider");
    expect(handle).toHaveAttribute("aria-valuemin", "0");
    expect(handle).toHaveAttribute("aria-valuemax", "100");

    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(60);

    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith(40);
    expect(handle).toHaveAttribute("aria-valuenow", "40");
  });

  it("disabled 不响应拖拽与键盘", () => {
    const onChange = vi.fn();
    const { container } = render(<Slider defaultValue={20} disabled onChange={onChange} />);
    mockRect(container.querySelector(".rideos-slider-rail") as HTMLElement, {
      left: 0,
      width: 100,
    });
    fireEvent.mouseDown(container.querySelector(".rideos-slider") as HTMLElement, { clientX: 80 });
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "20");
  });
});

describe("Rate", () => {
  it("整星点击选中", () => {
    const onChange = vi.fn();
    const { container } = render(<Rate defaultValue={2} onChange={onChange} />);
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(container.querySelectorAll(".rideos-rate-star.is-full")).toHaveLength(2);

    fireEvent.click(screen.getByRole("radio", { name: "4 星" }));
    expect(onChange).toHaveBeenCalledWith(4);
    expect(container.querySelectorAll(".rideos-rate-star.is-full")).toHaveLength(4);
  });

  it("allowHalf 按半星区域选择", () => {
    const onChange = vi.fn();
    const { container } = render(<Rate allowHalf onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "3.5 星" }));
    expect(onChange).toHaveBeenCalledWith(3.5);
    expect(container.querySelectorAll(".rideos-rate-star.is-full")).toHaveLength(3);
    expect(container.querySelectorAll(".rideos-rate-star.is-half")).toHaveLength(1);
  });

  it("悬停预览,禁用后不响应", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<Rate defaultValue={1} onChange={onChange} />);
    fireEvent.mouseEnter(screen.getByRole("radio", { name: "5 星" }));
    expect(container.querySelectorAll(".rideos-rate-star.is-full")).toHaveLength(5);
    fireEvent.mouseLeave(container.querySelector(".rideos-rate") as HTMLElement);
    expect(container.querySelectorAll(".rideos-rate-star.is-full")).toHaveLength(1);

    rerender(<Rate defaultValue={1} disabled onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "5 星" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("BackTop", () => {
  it("滚动超过阈值显示,回落后隐藏", () => {
    const scroller = document.createElement("div");
    let scrollTop = 0;
    Object.defineProperty(scroller, "scrollTop", {
      configurable: true,
      get: () => scrollTop,
    });
    const target = () => scroller;
    render(<BackTop target={target} visibilityHeight={400} />);
    expect(screen.queryByRole("button", { name: "回到顶部" })).toBeNull();

    scrollTop = 800;
    fireEvent.scroll(scroller);
    expect(screen.getByRole("button", { name: "回到顶部" })).toBeInTheDocument();

    scrollTop = 100;
    fireEvent.scroll(scroller);
    expect(screen.queryByRole("button", { name: "回到顶部" })).toBeNull();
  });

  it("点击平滑滚回顶部", () => {
    const scroller = document.createElement("div");
    Object.defineProperty(scroller, "scrollTop", { configurable: true, get: () => 999 });
    scroller.scrollTo = vi.fn();
    const target = () => scroller;
    render(<BackTop target={target} />);

    fireEvent.click(screen.getByRole("button", { name: "回到顶部" }));
    expect(scroller.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("支持自定义内容", () => {
    const scroller = document.createElement("div");
    Object.defineProperty(scroller, "scrollTop", { configurable: true, get: () => 999 });
    const target = () => scroller;
    render(
      <BackTop target={target} visibilityHeight={400}>
        <span>顶部</span>
      </BackTop>,
    );
    expect(screen.getByText("顶部")).toBeInTheDocument();
  });
});
