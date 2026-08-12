import type { ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface AuthLayoutProps {
  /** 品牌 Logo(左屏与卡片顶部),默认字母块 */
  logo?: ReactNode;
  /** 产品名,默认 RideOS */
  name?: ReactNode;
  /** 品牌屏主标语 */
  slogan?: ReactNode;
  /** 品牌屏副文案 */
  description?: ReactNode;
  /** 页脚(版权/备案) */
  footer?: ReactNode;
  /** 右侧内容(登录/注册等面板) */
  children?: ReactNode;
  className?: string;
}

/**
 * 认证页布局:左侧品牌屏(墨绿渐变)+ 右侧表单区
 * 窄屏(<960px)自动隐藏品牌屏,表单居中。
 * 登录/注册/找回密码/SSO 面板均放入本布局使用。
 */
export function AuthLayout({
  logo,
  name = "RideOS",
  slogan = "集团级出行运营平台",
  description = "车辆 · 司机 · 订单 · 结算,一站式数字化运营",
  footer,
  children,
  className,
}: AuthLayoutProps) {
  const logoNode = logo ?? <span className="rideos-auth-logo-block">R</span>;
  return (
    <div className={cx("rideos-auth-layout", className)}>
      <aside className="rideos-auth-brand">
        <div className="rideos-auth-brand-head">
          {logoNode}
          <strong>{name}</strong>
        </div>
        <div className="rideos-auth-brand-body">
          <h1>{slogan}</h1>
          {description && <p>{description}</p>}
        </div>
        <i className="rideos-auth-brand-deco deco-1" aria-hidden="true" />
        <i className="rideos-auth-brand-deco deco-2" aria-hidden="true" />
      </aside>
      <main className="rideos-auth-content">
        <div className="rideos-auth-card">{children}</div>
        {footer && <footer className="rideos-auth-footer">{footer}</footer>}
      </main>
    </div>
  );
}
