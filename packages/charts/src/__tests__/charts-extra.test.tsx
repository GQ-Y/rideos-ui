import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GaugeChart } from "../GaugeChart";
import { RadarChart } from "../RadarChart";
import { ScatterChart } from "../ScatterChart";
import type { ScatterSeries } from "../ScatterChart";

describe("RadarChart", () => {
  const indicators = [
    { name: "速度", max: 100 },
    { name: "续航", max: 100 },
    { name: "安全", max: 100 },
    { name: "舒适", max: 100 },
    { name: "性价比", max: 100 },
  ];
  const series = [
    { name: "车型 A", data: [80, 90, 70, 85, 60] },
    { name: "车型 B", data: [60, 70, 88, 75, 90] },
  ];

  it("按系列渲染闭合多边形、轴线与网格环", () => {
    const { container } = render(
      <RadarChart indicators={indicators} series={series} width={400} height={280} />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll(".rideos-chart-radar-series")).toHaveLength(2);
    expect(container.querySelectorAll(".rideos-chart-radar-axis")).toHaveLength(5);
    expect(container.querySelectorAll("polygon.rideos-chart-grid-line")).toHaveLength(4);
  });

  it("图例点击隐藏系列", () => {
    const { container, getByText } = render(
      <RadarChart indicators={indicators} series={series} width={400} />,
    );
    fireEvent.click(getByText("车型 B"));
    expect(container.querySelectorAll(".rideos-chart-radar-series")).toHaveLength(1);
  });

  it("空数据渲染占位", () => {
    const { getByText } = render(<RadarChart indicators={indicators} series={[]} width={400} />);
    expect(getByText("暂无数据")).toBeInTheDocument();
  });
});

describe("GaugeChart", () => {
  it("渲染指针、中心数值与 min/max 刻度", () => {
    const { container, getByText } = render(<GaugeChart value={72} width={300} height={240} />);
    expect(container.querySelector(".rideos-chart-gauge-pointer")).toBeInTheDocument();
    expect(container.querySelectorAll(".rideos-chart-gauge-track")).toHaveLength(1);
    expect(getByText("72")).toBeInTheDocument();
    expect(getByText("0")).toBeInTheDocument();
    expect(getByText("100")).toBeInTheDocument();
  });

  it("分段配色按 value 比例裁剪数值弧", () => {
    const { container, getByText } = render(
      <GaugeChart
        value={90}
        width={300}
        title="健康度"
        segments={[{ to: 30 }, { to: 60 }, { to: 100 }]}
      />,
    );
    expect(container.querySelectorAll(".rideos-chart-gauge-arc")).toHaveLength(3);
    expect(getByText("健康度")).toBeInTheDocument();
  });

  it("value 超出量程时指针钳制且数值原样显示", () => {
    const { container, getByText } = render(
      <GaugeChart value={130} width={300} segments={[{ to: 60 }]} />,
    );
    /* clamp 到 max=100:0-60 分段色 + 60-100 补位色,共 2 段数值弧 */
    expect(container.querySelectorAll(".rideos-chart-gauge-arc")).toHaveLength(2);
    expect(getByText("130")).toBeInTheDocument();
  });
});

describe("ScatterChart", () => {
  const scatterSeries: ScatterSeries[] = [
    {
      name: "早高峰",
      data: [
        [1, 12],
        [2, 18],
        [3, 15],
      ],
    },
    {
      name: "晚高峰",
      data: [
        [1.5, 20],
        [2.5, 26],
      ],
    },
  ];

  it("渲染全部散点", () => {
    const { container } = render(
      <ScatterChart series={scatterSeries} width={600} height={280} />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll(".rideos-chart-scatter-dot")).toHaveLength(5);
  });

  it("图例点击隐藏系列", () => {
    const { container, getByText } = render(<ScatterChart series={scatterSeries} width={600} />);
    fireEvent.click(getByText("晚高峰"));
    expect(container.querySelectorAll(".rideos-chart-scatter-dot")).toHaveLength(3);
  });

  it("空数据渲染占位", () => {
    const { getByText } = render(<ScatterChart series={[]} width={600} />);
    expect(getByText("暂无数据")).toBeInTheDocument();
  });
});
