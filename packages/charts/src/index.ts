/**
 * @rideos-ai/charts — RideOS 图表组件库(纯 SVG,零第三方依赖)
 * 使用前请引入样式:import "@rideos-ai/charts/styles.css"
 */
export { LineChart } from "./LineChart";
export type { LineChartProps } from "./LineChart";
export { BarChart } from "./BarChart";
export type { BarChartProps } from "./BarChart";
export { PieChart } from "./PieChart";
export type { PieChartProps } from "./PieChart";
export * from "./RadarChart";
export * from "./GaugeChart";
export * from "./ScatterChart";
export type { CartesianChartProps, ChartSeries, PieDatum } from "./types";
export { CHART_COLORS } from "./internal/palette";
