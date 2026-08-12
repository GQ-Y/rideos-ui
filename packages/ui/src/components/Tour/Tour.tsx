import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx";
import { Button } from "../Button";

export interface TourStep {
  /** 目标元素(选择器或取元素函数);缺省为居中提示 */
  target?: string | (() => HTMLElement | null);
  title: ReactNode;
  description?: ReactNode;
}

export interface TourProps {
  steps: TourStep[];
  /** 受控开启 */
  open: boolean;
  onClose?: () => void;
  /** 走完全部步骤 */
  onFinish?: () => void;
  /** 受控当前步骤(可选) */
  current?: number;
  onChange?: (current: number) => void;
  className?: string;
}

function resolveTarget(step: TourStep | undefined): HTMLElement | null {
  if (!step?.target) return null;
  if (typeof step.target === "string") {
    return document.querySelector<HTMLElement>(step.target);
  }
  return step.target();
}

const SPOT_PADDING = 6;

/**
 * 漫游式引导:高亮页面元素并分步说明(聚光灯遮罩 + 引导卡片)
 */
export function Tour({
  steps,
  open,
  onClose,
  onFinish,
  current: currentProp,
  onChange,
  className,
}: TourProps) {
  const [innerCurrent, setInnerCurrent] = useState(0);
  const current = currentProp ?? innerCurrent;
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = steps[current];

  /* 定位目标并滚动到可视区;窗口变化时跟随 */
  useEffect(() => {
    if (!open || !step) return undefined;
    const update = () => {
      const target = resolveTarget(step);
      if (target) {
        target.scrollIntoView?.({ block: "nearest" });
        setRect(target.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, step]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !step || typeof document === "undefined") return null;

  function go(next: number) {
    if (next >= steps.length) {
      onFinish?.();
      onClose?.();
      if (currentProp === undefined) setInnerCurrent(0);
      return;
    }
    if (currentProp === undefined) setInnerCurrent(Math.max(0, next));
    onChange?.(Math.max(0, next));
  }

  /* 聚光灯:一个透明洞 + 巨大 box-shadow 遮罩 */
  const spot: CSSProperties = rect
    ? {
        left: rect.left - SPOT_PADDING,
        top: rect.top - SPOT_PADDING,
        width: rect.width + SPOT_PADDING * 2,
        height: rect.height + SPOT_PADDING * 2,
      }
    : { left: "50%", top: "40%", width: 0, height: 0 };

  /* 卡片位置:目标下方,不够放则上方;无目标居中 */
  let cardStyle: CSSProperties;
  if (rect) {
    const below = rect.bottom + SPOT_PADDING + 12;
    const openUp = below + 180 > window.innerHeight;
    cardStyle = {
      left: Math.min(Math.max(16, rect.left), window.innerWidth - 336),
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + SPOT_PADDING + 12 }
        : { top: below }),
    };
  } else {
    cardStyle = { left: "50%", top: "40%", transform: "translate(-50%, -50%)" };
  }

  return createPortal(
    <div className={cx("rideos-tour", className)} role="dialog" aria-label="功能引导">
      <div className="rideos-tour-spot" style={spot} />
      <div className="rideos-tour-card" style={cardStyle}>
        <strong className="rideos-tour-title">{step.title}</strong>
        {step.description && <p className="rideos-tour-desc">{step.description}</p>}
        <div className="rideos-tour-foot">
          <span className="rideos-tour-progress">
            {current + 1} / {steps.length}
          </span>
          <span className="rideos-tour-actions">
            <button type="button" className="rideos-tour-skip" onClick={onClose}>
              跳过
            </button>
            {current > 0 && <Button onClick={() => go(current - 1)}>上一步</Button>}
            <Button variant="primary" onClick={() => go(current + 1)}>
              {current === steps.length - 1 ? "完成" : "下一步"}
            </Button>
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
