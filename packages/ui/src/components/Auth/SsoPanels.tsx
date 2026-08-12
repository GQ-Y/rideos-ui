import type { ReactNode } from "react";
import { CheckCircleFilled, SafetyCertificateOutlined, SwapOutlined } from "@ant-design/icons";
import { Button } from "../Button";
import type { SsoProvider } from "./LoginForm";

export interface SsoLoginPanelProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** 主入口按钮文案 */
  primaryText?: ReactNode;
  /** 点击主入口(跳转 IdP) */
  onPrimaryLogin?: () => void;
  /** 其他身份源入口 */
  providers?: SsoProvider[];
  onProviderLogin?: (key: string) => void;
  /** 切换到账号密码登录 */
  onAccountLogin?: () => void;
  loading?: boolean;
}

/**
 * SSO 独立登录页面板:企业统一身份认证入口
 */
export function SsoLoginPanel({
  title = "统一身份认证",
  subtitle = "使用集团统一账号,一次登录访问全部应用",
  primaryText = "使用集团统一身份认证登录",
  onPrimaryLogin,
  providers,
  onProviderLogin,
  onAccountLogin,
  loading = false,
}: SsoLoginPanelProps) {
  return (
    <div className="rideos-auth-panel">
      <div className="rideos-auth-sso-badge" aria-hidden="true">
        <SafetyCertificateOutlined />
      </div>
      <h2 className="rideos-auth-title rideos-auth-title-center">{title}</h2>
      <p className="rideos-auth-subtitle rideos-auth-subtitle-center">{subtitle}</p>

      <Button
        variant="primary"
        className="rideos-auth-submit"
        disabled={loading}
        onClick={onPrimaryLogin}
      >
        {loading ? "跳转认证中心..." : primaryText}
      </Button>

      {providers && providers.length > 0 && (
        <>
          <div className="rideos-auth-divider">
            <span>其他身份源</span>
          </div>
          <div className="rideos-auth-providers">
            {providers.map((provider) => (
              <button
                type="button"
                key={provider.key}
                className="rideos-auth-provider"
                onClick={() => onProviderLogin?.(provider.key)}
              >
                {provider.icon}
                <span>{provider.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {onAccountLogin && (
        <p className="rideos-auth-switch">
          <button type="button" className="rideos-auth-link" onClick={onAccountLogin}>
            使用账号密码登录
          </button>
        </p>
      )}
    </div>
  );
}

/** 授权范围项 */
export interface SsoScope {
  key: string;
  label: ReactNode;
  desc?: ReactNode;
}

export interface SsoAuthorizePanelProps {
  /** 请求授权的应用名 */
  clientName: ReactNode;
  /** 应用 Logo(缺省取首字符) */
  clientLogo?: ReactNode;
  /** 平台名(授权方),默认 RideOS */
  platformName?: ReactNode;
  platformLogo?: ReactNode;
  /** 当前登录身份 */
  user?: { name: ReactNode; org?: ReactNode };
  /** 申请的权限范围 */
  scopes: SsoScope[];
  onApprove?: () => void;
  onDeny?: () => void;
  loading?: boolean;
  /** 底部提示(如授权有效期) */
  hint?: ReactNode;
}

/**
 * SSO 授权确认页面板:第三方应用请求授权(OAuth 同意页)
 */
export function SsoAuthorizePanel({
  clientName,
  clientLogo,
  platformName = "RideOS",
  platformLogo,
  user,
  scopes,
  onApprove,
  onDeny,
  loading = false,
  hint,
}: SsoAuthorizePanelProps) {
  return (
    <div className="rideos-auth-panel">
      <div className="rideos-auth-grant-apps" aria-hidden="true">
        <span className="rideos-auth-grant-app">
          {clientLogo ?? <i>{String(clientName).slice(0, 1)}</i>}
        </span>
        <SwapOutlined className="rideos-auth-grant-swap" />
        <span className="rideos-auth-grant-app is-platform">
          {platformLogo ?? <i>R</i>}
        </span>
      </div>

      <h2 className="rideos-auth-title rideos-auth-title-center">
        {clientName} 请求访问你的 {platformName} 账号
      </h2>
      {user && (
        <p className="rideos-auth-subtitle rideos-auth-subtitle-center">
          当前身份:{user.name}
          {user.org ? <>({user.org})</> : null}
        </p>
      )}

      <div className="rideos-auth-scopes">
        <small>授权后,该应用将获得以下权限:</small>
        {scopes.map((scope) => (
          <div key={scope.key} className="rideos-auth-scope">
            <CheckCircleFilled aria-hidden="true" />
            <span className="rideos-auth-scope-main">
              <strong>{scope.label}</strong>
              {scope.desc && <small>{scope.desc}</small>}
            </span>
          </div>
        ))}
      </div>

      <div className="rideos-auth-grant-actions">
        <Button className="rideos-auth-deny" disabled={loading} onClick={onDeny}>
          拒绝
        </Button>
        <Button
          variant="primary"
          className="rideos-auth-approve"
          disabled={loading}
          onClick={onApprove}
        >
          {loading ? "授权中..." : "同意授权"}
        </Button>
      </div>

      {hint && <p className="rideos-auth-grant-hint">{hint}</p>}
    </div>
  );
}
