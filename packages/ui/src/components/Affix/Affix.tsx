import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface AffixProps {
  /** 固定时距容器顶部的偏移(px),默认 0 */
  offsetTop?: number;
  /** 监听滚动的目标容器,默认整页(window) */
  target?: () => HTMLElement;
  /** 固定状态变化时触发 */
  onChange?: (affixed: boolean) => void;
  children?: ReactNode;
  className?: string;
}

interface AffixState {
  affixed: boolean;
  /** 固定时沿用的内容尺寸,占位与 fixed 层共用 */
  width: number;
  height: number;
  /** fixed 时的 top(容器顶部 + offsetTop) */
  fixedTop: number;
}

/**
 * 固钉:元素原位置滚过 offsetTop 后切换为 fixed 钉在顶部,回滚后还原
 * 固定期间渲染同尺寸占位元素,避免文档流塌陷。
 */
export function Affix({ offsetTop = 0, target, onChange, children, className }: AffixProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<AffixState>({
    affixed: false,
    width: 0,
    height: 0,
    fixedTop: 0,
  });
  /* 滚动监听高频触发,用 ref 去重,只在固定状态翻转时更新与回调 */
  const affixedRef = useRef(false);

  useEffect(() => {
    const el = target?.();
    const listenTarget: HTMLElement | Window = el ?? window;

    const check = () => {
      const outer = outerRef.current;
      if (!outer) return;
      const rect = outer.getBoundingClientRect();
      /* 元素不可见(无尺寸)时不判定,避免隐藏状态误固定 */
      if (rect.width === 0 && rect.height === 0) return;
      const baseTop = el ? el.getBoundingClientRect().top : 0;
      const nextAffixed = rect.top - baseTop < offsetTop;
      if (nextAffixed === affixedRef.current) return;
      affixedRef.current = nextAffixed;
      setState({
        affixed: nextAffixed,
        width: rect.width,
        height: rect.height,
        fixedTop: baseTop + offsetTop,
      });
      onChange?.(nextAffixed);
    };

    check();
    listenTarget.addEventListener("scroll", check);
    return () => listenTarget.removeEventListener("scroll", check);
  }, [target, offsetTop, onChange]);

  const fixedStyle: CSSProperties | undefined = state.affixed
    ? { top: state.fixedTop, width: state.width }
    : undefined;

  return (
    <div ref={outerRef} className={cx("rideos-affix", className)}>
      {state.affixed && (
        <div
          className="rideos-affix-placeholder"
          style={{ width: state.width, height: state.height }}
          aria-hidden="true"
        />
      )}
      <div className={state.affixed ? "rideos-affix-fixed" : undefined} style={fixedStyle}>
        {children}
      </div>
    </div>
  );
}
