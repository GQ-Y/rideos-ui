import type { CSSProperties, ReactNode } from "react";

/** 一条数据系列;data 与 categories 按下标对齐,null 表示缺数(折线断开) */
export interface ChartSeries {
  name: string;
  data: Array<number | null>;
  /** 自定义颜色,缺省按图表色板轮转 */
  color?: string;
}

/** 直角坐标系图表(折线/柱状)的公共 Props */
export interface CartesianChartProps {
  /** X 轴类目标签 */
  categories: string[];
  /** 数据系列 */
  series: ChartSeries[];
  /** 固定宽度;不传则自适应容器宽度 */
  width?: number;
  /** 总高度(含图例),默认 280 */
  height?: number;
  /** 是否显示图例(可点击开关系列),默认 true */
  legend?: boolean;
  /** 是否显示悬浮提示,默认 true */
  tooltip?: boolean;
  /** 是否显示横向网格线,默认 true */
  grid?: boolean;
  /** Y 轴从 0 开始,默认 true */
  beginAtZero?: boolean;
  /** 数值格式化(Y 轴刻度与 tooltip 共用) */
  valueFormatter?: (value: number) => string;
  /** 数据为空时的占位内容 */
  emptyText?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** 饼图数据项 */
export interface PieDatum {
  name: string;
  value: number;
  color?: string;
}
