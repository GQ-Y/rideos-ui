import { createContext, useContext, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

export type RowAlign = "top" | "middle" | "bottom" | "stretch";
export type RowJustify =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly";

export interface RowProps {
  /** 栅格间隔(px):单值为水平间隔,数组为 [水平, 垂直] */
  gutter?: number | [number, number];
  /** 垂直对齐 */
  align?: RowAlign;
  /** 水平排列 */
  justify?: RowJustify;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface ColProps {
  /** 占位格数(1-24),默认 24 */
  span?: number;
  /** 左侧偏移格数 */
  offset?: number;
  /** flex 布局属性(设置后覆盖 span 宽度) */
  flex?: CSSProperties["flex"];
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const GRID_COLUMNS = 24;

/** Row 向 Col 传递 gutter 的上下文 */
const RowContext = createContext<{ gutter: [number, number] }>({ gutter: [0, 0] });

function normalizeGutter(gutter?: number | [number, number]): [number, number] {
  if (gutter === undefined) return [0, 0];
  if (Array.isArray(gutter)) return [gutter[0] ?? 0, gutter[1] ?? 0];
  return [gutter, 0];
}

/**
 * 栅格行:24 栅格系统的水平容器,gutter 通过负 margin + Col padding 实现
 */
export function Row({ gutter, align, justify, children, className, style }: RowProps) {
  const [horizontal, vertical] = normalizeGutter(gutter);
  const context = useMemo<{ gutter: [number, number] }>(
    () => ({ gutter: [horizontal, vertical] }),
    [horizontal, vertical],
  );

  const gutterStyle: CSSProperties = {};
  if (horizontal > 0) {
    gutterStyle.marginLeft = -horizontal / 2;
    gutterStyle.marginRight = -horizontal / 2;
  }
  if (vertical > 0) {
    gutterStyle.marginTop = -vertical / 2;
    gutterStyle.marginBottom = -vertical / 2;
  }

  return (
    <RowContext.Provider value={context}>
      <div
        className={cx(
          "rideos-row",
          align && `align-${align}`,
          justify && `justify-${justify}`,
          className,
        )}
        style={{ ...gutterStyle, ...style }}
      >
        {children}
      </div>
    </RowContext.Provider>
  );
}

/**
 * 栅格列:按 span/24 计算宽度,支持 offset 偏移与 flex 自定义伸缩
 */
export function Col({ span = GRID_COLUMNS, offset, flex, children, className, style }: ColProps) {
  const { gutter } = useContext(RowContext);
  const [horizontal, vertical] = gutter;
  const clamped = Math.min(GRID_COLUMNS, Math.max(1, span));

  const colStyle: CSSProperties = {};
  if (flex !== undefined) {
    colStyle.flex = flex;
  } else {
    colStyle.width = `${(clamped / GRID_COLUMNS) * 100}%`;
  }
  if (offset) {
    colStyle.marginLeft = `${(offset / GRID_COLUMNS) * 100}%`;
  }
  if (horizontal > 0) {
    colStyle.paddingLeft = horizontal / 2;
    colStyle.paddingRight = horizontal / 2;
  }
  if (vertical > 0) {
    colStyle.paddingTop = vertical / 2;
    colStyle.paddingBottom = vertical / 2;
  }

  return (
    <div className={cx("rideos-col", className)} style={{ ...colStyle, ...style }}>
      {children}
    </div>
  );
}
