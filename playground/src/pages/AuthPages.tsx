import {
  DingdingOutlined,
  SafetyCertificateOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import {
  AuthLayout,
  Button,
  LoginForm,
  PageCard,
  PageHeader,
  RegisterForm,
  ResetPasswordForm,
  SsoAuthorizePanel,
  SsoLoginPanel,
} from "@rideos/ui";

const AUTH_PAGES: Array<{ path: string; title: string; desc: string }> = [
  { path: "/auth/login", title: "登录页", desc: "账号密码 / 手机验证码双模式 + 第三方登录入口" },
  { path: "/auth/register", title: "注册页", desc: "验证码注册 + 密码强度与协议勾选校验" },
  { path: "/auth/reset", title: "找回密码", desc: "验证身份 → 设置新密码 → 完成,三步流程" },
  { path: "/auth/sso", title: "SSO 单点登录", desc: "集团统一身份认证独立入口 + 多身份源" },
  { path: "/auth/authorize", title: "SSO 授权确认", desc: "OAuth 风格的第三方应用授权同意页" },
];

/** 组件示例内的认证页导航 */
export function AuthLauncherPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <>
      <PageHeader
        breadcrumb={["组件示例", "登录 / 认证页"]}
        title="认证页组件 AuthLayout 套件"
        description="AuthLayout + LoginForm / RegisterForm / ResetPasswordForm / SsoLoginPanel / SsoAuthorizePanel;以下页面为全屏独立路由(脱离后台壳层),点击进入体验。"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {AUTH_PAGES.map((page) => (
          <PageCard key={page.path}>
            <h3 style={{ margin: "0 0 6px", fontSize: 15 }}>{page.title}</h3>
            <p style={{ margin: "0 0 12px", color: "#8f959e", fontSize: 12, minHeight: 36 }}>
              {page.desc}
            </p>
            <Button variant="primary" onClick={() => onNavigate(page.path)}>
              进入页面
            </Button>
          </PageCard>
        ))}
      </div>
    </>
  );
}

const SSO_PROVIDERS = [
  { key: "sso", label: "统一认证", icon: <SafetyCertificateOutlined /> },
  { key: "wecom", label: "企业微信", icon: <WechatOutlined /> },
  { key: "dingtalk", label: "钉钉", icon: <DingdingOutlined /> },
];

const AUTH_FOOTER = "© 2026 RideOS · 集团数字化出行平台";

/** 独立认证路由(全屏,无后台壳层) */
export function AuthStandalone({
  pathname,
  onNavigate,
  flash,
}: {
  pathname: string;
  onNavigate: (path: string) => void;
  flash: (message: string) => void;
}) {
  function sendCode() {
    flash("验证码已发送(演示码:123456)");
  }

  let panel;
  switch (pathname) {
    case "/auth/register":
      panel = (
        <RegisterForm
          subtitle="注册 RideOS 平台账号"
          onSendCode={sendCode}
          onRegister={(values) => {
            flash(`注册成功:${values.username},请登录`);
            onNavigate("/auth/login");
          }}
          onBackToLogin={() => onNavigate("/auth/login")}
        />
      );
      break;
    case "/auth/reset":
      panel = (
        <ResetPasswordForm
          onSendCode={sendCode}
          onSubmit={() => flash("密码已重置(演示)")}
          onBackToLogin={() => onNavigate("/auth/login")}
        />
      );
      break;
    case "/auth/sso":
      panel = (
        <SsoLoginPanel
          onPrimaryLogin={() => {
            flash("跳转统一认证中心...(演示:进入授权页)");
            onNavigate("/auth/authorize");
          }}
          providers={SSO_PROVIDERS.slice(1)}
          onProviderLogin={(key) => flash(`使用 ${key} 身份源登录(演示)`)}
          onAccountLogin={() => onNavigate("/auth/login")}
        />
      );
      break;
    case "/auth/authorize":
      panel = (
        <SsoAuthorizePanel
          clientName="运力调度大屏"
          user={{ name: "平台管理员", org: "RideOS 集团" }}
          scopes={[
            { key: "profile", label: "读取你的基本信息", desc: "姓名、部门、工号" },
            { key: "org", label: "读取组织架构", desc: "仅限所在事业部" },
            { key: "data", label: "访问运营数据(只读)", desc: "订单、车辆实时状态" },
          ]}
          onApprove={() => {
            flash("授权成功,正在返回应用(演示)");
            onNavigate("/home");
          }}
          onDeny={() => onNavigate("/auth/login")}
          hint="授权有效期 30 天,可在「账号设置 - 授权管理」中随时撤销"
        />
      );
      break;
    default:
      panel = (
        <LoginForm
          subtitle="登录 RideOS 运营平台"
          onSendCode={sendCode}
          onLogin={(values) => {
            flash(`登录成功,欢迎 ${values.username ?? values.mobile}(演示)`);
            onNavigate("/home");
          }}
          onForgotPassword={() => onNavigate("/auth/reset")}
          onRegister={() => onNavigate("/auth/register")}
          ssoProviders={SSO_PROVIDERS}
          onSsoLogin={(key) =>
            key === "sso" ? onNavigate("/auth/sso") : flash(`使用 ${key} 登录(演示)`)
          }
        />
      );
  }

  return (
    <>
      <AuthLayout footer={AUTH_FOOTER}>{panel}</AuthLayout>
      <button
        type="button"
        className="rideos-topbar-pill"
        style={{ position: "fixed", top: 16, right: 16, zIndex: 10 }}
        onClick={() => onNavigate("/kit/auth")}
      >
        返回组件演示
      </button>
    </>
  );
}
