import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { CloseOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

/** 内容页多页签导航 */
export function AppPageTabs({ tabs, activePath, onActivate, onClose }) {
  const viewportRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activePath, tabs.length]);

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
            return (
              <div
                key={tab.path}
                ref={active ? activeRef : undefined}
                className={cx("rideos-page-tab", active && "active", tab.pinned && "pinned")}
                role="tab"
                aria-selected={active}
              >
                <button
                  type="button"
                  className="rideos-page-tab-main"
                  title={`${tab.domainLabel ? `${tab.domainLabel} · ` : ""}${tab.label}`}
                  onClick={() => onActivate(tab)}
                >
                  {Icon && <Icon aria-hidden="true" />}
                  <span>{tab.label}</span>
                </button>
                {!tab.pinned && (
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
  })).isRequired,
  activePath: PropTypes.string.isRequired,
  onActivate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
