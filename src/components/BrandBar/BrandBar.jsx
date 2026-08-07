import PropTypes from "prop-types";
import { ExpandOutlined, UserOutlined } from "@ant-design/icons";

/** 顶部信息栏：品牌、角色视角、字号、全屏、用户 */
export function BrandBar({
  title = "RideOS 管理后台",
  userLabel = "管理员",
  fontLarge = false,
  onToggleFont,
  onHome,
  onFullscreen,
  roleOptions,
  roleValue,
  onRoleChange,
  actions,
}) {
  return (
    <header className="rideos-brand-bar">
      <button type="button" className="rideos-brand-home" onClick={onHome} aria-label="返回首页">
        <span className="rideos-brand-logo" aria-hidden="true">R</span>
        <span className="rideos-brand-divider" />
        <h1>{title}</h1>
      </button>
      <div className="rideos-brand-actions">
        {roleOptions?.length > 0 && (
          <select
            className="rideos-role-switch"
            aria-label="当前角色视角"
            value={roleValue}
            onChange={(event) => onRoleChange?.(event.target.value)}
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        )}
        {actions}
        <button type="button" className="font-switch" aria-label="切换字号" onClick={onToggleFont}>
          <span className={!fontLarge ? "selected" : ""}>小</span>
          <span className={fontLarge ? "selected" : ""}>大</span>
        </button>
        <button type="button" className="icon-action" aria-label="全屏" onClick={onFullscreen}>
          <ExpandOutlined />
        </button>
        <button type="button" className="user-chip" aria-label="用户菜单">
          <UserOutlined />
          <span>{userLabel}</span>
        </button>
      </div>
    </header>
  );
}

BrandBar.propTypes = {
  title: PropTypes.string,
  userLabel: PropTypes.string,
  fontLarge: PropTypes.bool,
  onToggleFont: PropTypes.func,
  onHome: PropTypes.func,
  onFullscreen: PropTypes.func,
  roleOptions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })),
  roleValue: PropTypes.string,
  onRoleChange: PropTypes.func,
  actions: PropTypes.node,
};
