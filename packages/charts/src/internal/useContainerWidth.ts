import { useEffect, useRef, useState } from "react";

/** 监听容器宽度(ResizeObserver);传入固定宽度时直接使用 */
export function useContainerWidth<T extends HTMLElement>(fixedWidth?: number) {
  const ref = useRef<T | null>(null);
  const [measured, setMeasured] = useState(0);

  useEffect(() => {
    if (fixedWidth != null) return;
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => setMeasured(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fixedWidth]);

  return { ref, width: fixedWidth ?? measured };
}
