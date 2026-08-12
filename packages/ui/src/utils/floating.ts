import { useEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";

export type FloatingPlacement = "top" | "bottom" | "left" | "right" | "bottom-start" | "bottom-end";

interface FloatingOptions {
  placement?: FloatingPlacement;
  /** 与触发器的间距,默认 8 */
  offset?: number;
  /** 面板宽度跟随触发器 */
  matchWidth?: boolean;
}

/** 计算 fixed 定位样式(相对视口) */
export function computeFloatingStyle(
  trigger: HTMLElement,
  options: FloatingOptions = {},
): CSSProperties {
  const { placement = "bottom", offset = 8, matchWidth = false } = options;
  const rect = trigger.getBoundingClientRect();
  const style: CSSProperties = {};
  if (matchWidth) style.width = rect.width;

  switch (placement) {
    case "top":
      style.left = rect.left + rect.width / 2;
      style.bottom = window.innerHeight - rect.top + offset;
      style.transform = "translateX(-50%)";
      break;
    case "left":
      style.right = window.innerWidth - rect.left + offset;
      style.top = rect.top + rect.height / 2;
      style.transform = "translateY(-50%)";
      break;
    case "right":
      style.left = rect.right + offset;
      style.top = rect.top + rect.height / 2;
      style.transform = "translateY(-50%)";
      break;
    case "bottom-start":
      style.left = rect.left;
      style.top = rect.bottom + offset;
      break;
    case "bottom-end":
      style.left = rect.right;
      style.top = rect.bottom + offset;
      style.transform = "translateX(-100%)";
      break;
    default:
      /* bottom */
      style.left = rect.left + rect.width / 2;
      style.top = rect.bottom + offset;
      style.transform = "translateX(-50%)";
  }
  return style;
}

/**
 * 浮层定位 hook:open 期间跟随 resize/scroll 重算位置
 */
export function useFloatingPosition(
  triggerRef: RefObject<HTMLElement | null>,
  open: boolean,
  options: FloatingOptions = {},
) {
  const [style, setStyle] = useState<CSSProperties>({});
  const { placement, offset, matchWidth } = options;

  useEffect(() => {
    if (!open) return undefined;
    const update = () => {
      const trigger = triggerRef.current;
      if (trigger) setStyle(computeFloatingStyle(trigger, { placement, offset, matchWidth }));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, placement, offset, matchWidth, triggerRef]);

  return style;
}

/** 打开期间:点击浮层与触发器之外 / 按 Esc 时关闭 */
export function useDismiss(
  open: boolean,
  refs: Array<RefObject<HTMLElement | null>>,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onDismiss();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onDismiss]);
}
