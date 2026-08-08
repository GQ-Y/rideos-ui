import PropTypes from "prop-types";
import { Button } from "../Button";
import { StatusBadge } from "../StatusBadge";
import { Tabs } from "../Tabs";

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
  aside,
}) {
  return (
    <div className="rideos-detail-layout">
      <header className="rideos-detail-head">
        <div className="rideos-detail-head-main">
          {onBack && <Button onClick={onBack}>返回列表</Button>}
          <h2>{title}</h2>
          {status && <StatusBadge value={status} />}
        </div>
        <div className="rideos-detail-head-actions">
          {actions}
          {dangerActions}
        </div>
      </header>
      {summary.length > 0 && (
        <div className="rideos-detail-summary">
          {summary.map((item) => (
            <div key={item.key || item.label}>
              <small>{item.label}</small>
              <strong>{item.value ?? "—"}</strong>
            </div>
          ))}
        </div>
      )}
      <div className={aside ? "rideos-detail-body with-aside" : "rideos-detail-body"}>
        <div className="rideos-detail-main">
          {tabs?.length > 0 && (
            <Tabs items={tabs} activeKey={activeTab} onChange={onTabChange} />
          )}
          <div className="rideos-detail-content">{children}</div>
        </div>
        {aside && <aside className="rideos-detail-aside">{aside}</aside>}
      </div>
    </div>
  );
}

DetailLayout.propTypes = {
  onBack: PropTypes.func,
  title: PropTypes.node.isRequired,
  status: PropTypes.node,
  summary: PropTypes.array,
  actions: PropTypes.node,
  dangerActions: PropTypes.node,
  tabs: PropTypes.array,
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  children: PropTypes.node,
  aside: PropTypes.node,
};
