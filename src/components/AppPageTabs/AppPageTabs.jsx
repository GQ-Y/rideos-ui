import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  CloseOutlined,
  LeftOutlined,
  PushpinFilled,
  PushpinOutlined,
  RightOutlined,
  VerticalAlignTopOutlined,
} from "@ant-design/icons";
import { cx } from "../../utils/cx";

const MENU_WIDTH = 168;
const MENU_HEIGHT = 168;

/**
 * 内容页多页签导航
 * 右键：关闭当前 / 关闭其他 / 置顶 / 固定|取消固定
 */
export function AppPageTabs({
  tabs,
  activePath,
  onActivate,
  onClose,
  onCloseOthers,
  onPinTop,
  onToggleAffix,
}) {
  const viewportRef = useRef(null);
  const activeRef = useRef(null);
  const menuRef = useRef(null);
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activePath, tabs.length]);

  useEffect(() => {
    if (!menu) return undefined;
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setMenu(null);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setMenu(null);
    }
    function handleScroll() {
      setMenu(null);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleScroll);
    viewportRef.current?.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleScroll);
      viewportRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [menu]);

  function scrollTabs(direction) {
    viewportRef.current?.scrollBy({
      left: direction * Math.max(240, viewportRef.current.clientWidth * 0.55),
      behavior: "smooth",
    });
  }

  function handleWheel(event) {
    if (!viewportRef.current || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    viewportRef.current.scrollLeft += event.deltaY;
  }

  function openContextMenu(event, tab) {
    event.preventDefault();
    event.stopPropagation();
    const x = Math.min(event.clientX, window.innerWidth - MENU_WIDTH - 8);
    const y = Math.min(event.clientY, window.innerHeight - MENU_HEIGHT - 8);
    setMenu({ x, y, tab });
  }

  function runAction(action) {
    if (!menu?.tab) return;
    const tab = menu.tab;
    setMenu(null);
    if (action === "close") onClose?.(tab);
    if (action === "closeOthers") onCloseOthers?.(tab);
    if (action === "pinTop") onPinTop?.(tab);
    if (action === "toggleAffix") onToggleAffix?.(tab);
  }

  const menuTab = menu?.tab;
  const canClose = Boolean(menuTab && !menuTab.pinned);
  const canCloseOthers = Boolean(menuTab && tabs.some((tab) => !tab.pinned && tab.path !== menuTab.path));
  const canPinTop = Boolean(menuTab && !menuTab.pinned);
  const canToggleAffix = Boolean(menuTab && !menuTab.pinned);

  return (
    <nav className="rideos-page-tabs" aria-label="已打开页面">
      <button type="button" className="rideos-page-tab-scroll" aria-label="向左查看标签" onClick={() => scrollTabs(-1)}>
        <LeftOutlined />
      </button>
      <div className="rideos-page-tab-viewport" ref={viewportRef} onWheel={handleWheel}>
        <div className="rideos-page-tab-list" role="tablist">
          {tabs.map((tab) => {
            const active = tab.path === activePath;
            const Icon = tab.icon;
            const locked = tab.pinned || tab.affixed;
            return (
              <div
                key={tab.path}
                ref={active ? activeRef : undefined}
                className={cx(
                  "rideos-page-tab",
                  active && "active",
                  tab.pinned && "pinned",
                  tab.affixed && "affixed",
                )}
                role="tab"
                aria-selected={active}
                onContextMenu={(event) => openContextMenu(event, tab)}
              >
                <button
                  type="button"
                  className="rideos-page-tab-main"
                  title={`${tab.domainLabel ? `${tab.domainLabel} · ` : ""}${tab.label}`}
                  onClick={() => onActivate(tab)}
                  onContextMenu={(event) => openContextMenu(event, tab)}
                >
                  {tab.affixed && <PushpinFilled className="rideos-page-tab-pin" aria-hidden="true" />}
                  {Icon && <Icon aria-hidden="true" />}
                  <span>{tab.label}</span>
                </button>
                {!locked && (
                  <button
                    type="button"
                    className="rideos-page-tab-close"
                    aria-label={`关闭${tab.label}`}
                    onClick={() => onClose(tab)}
                  >
                    <CloseOutlined />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <button type="button" className="rideos-page-tab-scroll" aria-label="向右查看标签" onClick={() => scrollTabs(1)}>
        <RightOutlined />
      </button>

      {menu && (
        <div
          ref={menuRef}
          className="rideos-page-tab-menu"
          style={{ left: menu.x, top: menu.y }}
          role="menu"
          aria-label="页签操作"
        >
          <button type="button" role="menuitem" disabled={!canClose} onClick={() => runAction("close")}>
            <CloseOutlined />
            <span>关闭当前</span>
          </button>
          <button type="button" role="menuitem" disabled={!canCloseOthers} onClick={() => runAction("closeOthers")}>
            <CloseOutlined />
            <span>关闭其他所有</span>
          </button>
          <div className="rideos-page-tab-menu-sep" />
          <button type="button" role="menuitem" disabled={!canPinTop} onClick={() => runAction("pinTop")}>
            <VerticalAlignTopOutlined />
            <span>置顶</span>
          </button>
          <button type="button" role="menuitem" disabled={!canToggleAffix} onClick={() => runAction("toggleAffix")}>
            {menuTab?.affixed ? <PushpinOutlined /> : <PushpinFilled />}
            <span>{menuTab?.affixed ? "取消固定" : "固定"}</span>
          </button>
        </div>
      )}
    </nav>
  );
}

AppPageTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    domainLabel: PropTypes.string,
    icon: PropTypes.elementType,
    pinned: PropTypes.bool,
    affixed: PropTypes.bool,
  })).isRequired,
  activePath: PropTypes.string.isRequired,
  onActivate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onCloseOthers: PropTypes.func,
  onPinTop: PropTypes.func,
  onToggleAffix: PropTypes.func,
};
