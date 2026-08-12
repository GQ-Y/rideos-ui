import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart } from "../BarChart";
import { LineChart } from "../LineChart";
import { PieChart } from "../PieChart";

const categories = ["一月", "二月", "三月", "四月"];
const series = [
  { name: "骑行", data: [120, 200, 150, 80] },
  { name: "换电", data: [60, 70, 90, 110] },
];

describe("LineChart", () => {
  it("按系列渲染折线路径", () => {
    const { container } = render(
      <LineChart categories={categories} series={series} width={600} height={280} />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll(".rideos-chart-line")).toHaveLength(2);
    expect(container.querySelectorAll(".rideos-chart-symbol")).toHaveLength(8);
  });

  it("area 模式渲染面积填充", () => {
    const { container } = render(
      <LineChart categories={categories} series={series} width={600} area smooth />,
    );
    expect(container.querySelectorAll(".rideos-chart-area")).toHaveLength(2);
  });

  it("图例点击隐藏系列", () => {
    const { container, getByText } = render(
      <LineChart categories={categories} series={series} width={600} />,
    );
    fireEvent.click(getByText("换电"));
    expect(container.querySelectorAll(".rideos-chart-line")).toHaveLength(1);
  });

  it("空数据渲染占位", () => {
    const { getByText } = render(<LineChart categories={[]} series={[]} width={600} />);
    expect(getByText("暂无数据")).toBeInTheDocument();
  });
});

describe("BarChart", () => {
  it("分组柱数量 = 类目 x 系列", () => {
    const { container } = render(
      <BarChart categories={categories} series={series} width={600} />,
    );
    expect(container.querySelectorAll(".rideos-chart-bar")).toHaveLength(8);
  });

  it("堆叠模式渲染全部数据段", () => {
    const { container } = render(
      <BarChart categories={categories} series={series} width={600} stacked />,
    );
    expect(container.querySelectorAll(".rideos-chart-bar")).toHaveLength(8);
  });
});

describe("PieChart", () => {
  const data = [
    { name: "快车", value: 45 },
    { name: "专车", value: 30 },
    { name: "出租车", value: 25 },
  ];

  it("渲染全部切片", () => {
    const { container } = render(<PieChart data={data} width={400} height={280} />);
    expect(container.querySelectorAll(".rideos-chart-pie-slice")).toHaveLength(3);
  });

  it("donut 模式显示中心总计", () => {
    const { getByText } = render(<PieChart data={data} width={400} donut />);
    expect(getByText("100")).toBeInTheDocument();
    expect(getByText("总计")).toBeInTheDocument();
  });

  it("图例点击隐藏数据项", () => {
    const { container, getByText } = render(<PieChart data={data} width={400} />);
    fireEvent.click(getByText("出租车"));
    expect(container.querySelectorAll(".rideos-chart-pie-slice")).toHaveLength(2);
  });
});
