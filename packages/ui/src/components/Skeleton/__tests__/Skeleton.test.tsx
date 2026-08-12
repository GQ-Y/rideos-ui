import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "../Skeleton";

describe("Skeleton", () => {
  it("加载中渲染标题与指定行数", () => {
    const { container } = render(<Skeleton avatar rows={4} />);
    expect(container.querySelector(".rideos-skeleton-avatar")).toBeTruthy();
    expect(container.querySelector(".rideos-skeleton-title")).toBeTruthy();
    expect(container.querySelectorAll(".rideos-skeleton-row")).toHaveLength(4);
  });

  it("loading=false 渲染真实内容", () => {
    const { container } = render(
      <Skeleton loading={false}>
        <p>真实内容</p>
      </Skeleton>,
    );
    expect(screen.getByText("真实内容")).toBeInTheDocument();
    expect(container.querySelector(".rideos-skeleton")).toBeNull();
  });
});
