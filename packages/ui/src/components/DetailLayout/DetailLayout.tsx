import type { ComponentType, CSSProperties, Key, ReactNode } from "react";
import { ArrowLeftOutlined, RightOutlined } from "@ant-design/icons";
import { StatusBadge } from "../StatusBadge";
import { Tabs } from "../Tabs";
import type { TabsItem } from "../Tabs";

export interface DetailLayoutSummaryItem {
  key?: string;
  label: ReactNode;
  value?: ReactNode;
}

/** 右侧栏结构化链接项 */
export interface DetailLayoutAsideLink {
  key?: string;
  label: ReactNode;
  /** 次要说明 */
  desc?: ReactNode;
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>;
  onClick?: () => void;
}

export interface DetailLayoutProps {
  onBack?: () => void;
  title: ReactNode;
  status?: ReactNode;
  summary?: DetailLayoutSummaryItem[];
  actions?: ReactNode;
  dangerActions?: ReactNode;
  tabs?: TabsItem[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  children?: ReactNode;
  /** 右侧栏标题(配合 asideLinks),默认「相关链接」 */
  asideTitle?: ReactNode;
  /** 右侧栏结构化链接列表 */
  asideLinks?: DetailLayoutAsideLink[];
  /** 右侧栏自定义内容(渲染在链接列表之后,可单独使用) */
  aside?: ReactNode;
}

export function DetailLayout({
  onBack,
  title,
  status,
  summary = [],
  actions,
  dangerActions,
  tabs,
  activeTab,
  onTabChange,
  children,
  asideTitle = "相关链接",
  asideLinks,
  aside,
}: DetailLayoutProps) {
  const hasAside = Boolean(aside || (asideLinks && asideLinks.length > 0));
  return (
    <div className="rideos-detail-layout">
      <header className="rideos-detail-head">
        <div className="rideos-detail-head-main">
          {onBack && (
            <>
              <button
                type="button"
                className="rideos-detail-back"
                aria-label="返回列表"
                title="返回列表"
                onClick={onBack}
              >
                <ArrowLeftOutlined />
              </button>
              <i className="rideos-detail-head-divider" aria-hidden="true" />
            </>
          )}
          <h2>{title}</h2>
          {status && <StatusBadge value={status} />}
        </div>
        <div className="rideos-detail-head-actions">
          {actions}
          {actions && dangerActions ? (
            <i className="rideos-detail-head-divider" aria-hidden="true" />
          ) : null}
          {dangerActions}
        </div>
      </header>
      {summary.length > 0 && (
        <div className="rideos-detail-summary">
          {summary.map((item) => (
            <div key={(item.key || item.label) as Key}>
              <small>{item.label}</small>
              <strong>{item.value ?? "—"}</strong>
            </div>
          ))}
        </div>
      )}
      <div className={hasAside ? "rideos-detail-body with-aside" : "rideos-detail-body"}>
        <div className="rideos-detail-main">
          {tabs && tabs.length > 0 && (
            <Tabs items={tabs} activeKey={activeTab} onChange={onTabChange} />
          )}
          <div className="rideos-detail-content">{children}</div>
        </div>
        {hasAside && (
          <aside className="rideos-detail-aside">
            {asideLinks && asideLinks.length > 0 && (
              <>
                <h4>{asideTitle}</h4>
                <div className="rideos-detail-aside-links">
                  {asideLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <button
                        type="button"
                        key={link.key ?? index}
                        className="rideos-detail-aside-link"
                        onClick={link.onClick}
                      >
                        {Icon && (
                          <span className="rideos-detail-aside-link-icon" aria-hidden="true">
                            <Icon />
                          </span>
                        )}
                        <span className="rideos-detail-aside-link-main">
                          <strong>{link.label}</strong>
                          {link.desc && <small>{link.desc}</small>}
                        </span>
                        <RightOutlined className="rideos-detail-aside-link-arrow" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {aside}
          </aside>
        )}
      </div>
    </div>
  );
}
