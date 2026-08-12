import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface AnchorItem {
  key: string;
  /** 目标锚点,如 "#section-1" */
  href: string;
  /** 链接文案 */
  title: ReactNode;
}

export interface AnchorProps {
  /** 锚点列表 */
  items: AnchorItem[];
  /** 高亮判定与滚动定位的距顶偏移(px),默认 0 */
  offsetTop?: number;
  /** 滚动容器,默认整页(window / documentElement) */
  container?: () => HTMLElement;
  /** 高亮锚点变化时触发 */
  onChange?: (activeKey: string) => void;
  className?: string;
}

/** 从 href(如 "#section-1")解析目标元素 */
function resolveTarget(href: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const id = href.startsWith("#") ? href.slice(1) : href;
  return document.getElementById(id);
}

/**
 * 锚点:滚动监听高亮当前区块,点击平滑滚动到目标
 * 高亮规则:各目标 rect.top - offsetTop 不超过容器顶部的最后一个;
 * 左侧竖线轨道 + 品牌色游标跟随高亮项。
 */
export function Anchor({ items, offsetTop = 0, container, onChange, className }: AnchorProps) {
  const [activeKey, setActiveKey] = useState("");
  const [inkStyle, setInkStyle] = useState<CSSProperties>({ top: 0, height: 0, opacity: 0 });
  const navRef = useRef<HTMLElement>(null);
  /* 滚动监听高频触发,用 ref 去重,只在高亮真正变化时更新与回调 */
  const activeRef = useRef("");

  function setActive(key: string) {
    if (activeRef.current === key) return;
    activeRef.current = key;
    setActiveKey(key);
    onChange?.(key);
  }

  useEffect(() => {
    const el = container?.();
    const listenTarget: HTMLElement | Window = el ?? window;

    const handleScroll = () => {
      const baseTop = el ? el.getBoundingClientRect().top : 0;
      let current = "";
      for (const item of items) {
        const target = resolveTarget(item.href);
        if (!target) continue;
        if (target.getBoundingClientRect().top - baseTop - offsetTop <= 1) current = item.key;
      }
      setActive(current);
    };

    handleScroll();
    listenTarget.addEventListener("scroll", handleScroll);
    return () => listenTarget.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, offsetTop, container, onChange]);

  /* 高亮变化后量取对应链接位置,驱动游标移动 */
  useEffect(() => {
    const link = navRef.current?.querySelector<HTMLElement>(".rideos-anchor-item.is-active");
    if (!link) {
      setInkStyle({ top: 0, height: 0, opacity: 0 });
      return;
    }
    setInkStyle({ top: link.offsetTop, height: link.offsetHeight, opacity: 1 });
  }, [activeKey]);

  function handleClick(event: ReactMouseEvent<HTMLAnchorElement>, item: AnchorItem) {
    event.preventDefault();
    setActive(item.key);
    const target = resolveTarget(item.href);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const el = container?.();
    if (el) {
      const top = el.scrollTop + rect.top - el.getBoundingClientRect().top - offsetTop;
      el.scrollTo({ top, behavior: "smooth" });
    } else {
      const scrolled = window.scrollY || document.documentElement.scrollTop || 0;
      window.scrollTo({ top: scrolled + rect.top - offsetTop, behavior: "smooth" });
    }
  }

  return (
    <nav ref={navRef} className={cx("rideos-anchor", className)}>
      <span className="rideos-anchor-ink" style={inkStyle} aria-hidden="true" />
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          className={cx("rideos-anchor-item", item.key === activeKey && "is-active")}
          onClick={(event) => handleClick(event, item)}
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
}
