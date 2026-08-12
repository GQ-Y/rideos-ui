/** 图表分类色板:走 @rideos/ui token,未引入 token 时使用回退色 */
export const CHART_COLORS = [
  "var(--rideos-chart-1, #009a7a)",
  "var(--rideos-chart-2, #3b82f6)",
  "var(--rideos-chart-3, #ffa51e)",
  "var(--rideos-chart-4, #fe5042)",
  "var(--rideos-chart-5, #8b5cf6)",
  "var(--rideos-chart-6, #14b8a6)",
  "var(--rideos-chart-7, #f472b6)",
  "var(--rideos-chart-8, #64748b)",
];

export function seriesColor(index: number, custom?: string): string {
  return custom ?? CHART_COLORS[index % CHART_COLORS.length];
}
