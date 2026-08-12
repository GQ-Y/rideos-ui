import { useState } from "react";
import type { ReactNode } from "react";
import { LockOutlined, MobileOutlined, SafetyOutlined, UserOutlined } from "@ant-design/icons";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { FormField } from "../FormField";
import { Input } from "../Input";
import { Tabs } from "../Tabs";
import { AuthError, isValidMobile, SendCodeButton } from "./internal";

export type LoginMode = "account" | "mobile";

export interface LoginValues {
  type: LoginMode;
  username?: string;
  password?: string;
  mobile?: string;
  code?: string;
  remember: boolean;
}

/** 第三方/SSO 登录入口 */
export interface SsoProvider {
  key: string;
  label: string;
  icon?: ReactNode;
}

export interface LoginFormProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** 提交(内置校验通过后触发) */
  onLogin?: (values: LoginValues) => void;
  /** 提交按钮 loading */
  loading?: boolean;
  /** 服务端错误信息(顶部红条) */
  errorMessage?: ReactNode;
  /** 是否提供手机验证码登录页签,默认 true */
  enableMobileLogin?: boolean;
  onSendCode?: (mobile: string) => void | Promise<void>;
  onForgotPassword?: () => void;
  onRegister?: () => void;
  /** 第三方登录入口(SSO/企业微信等) */
  ssoProviders?: SsoProvider[];
  onSsoLogin?: (key: string) => void;
}

/**
 * 登录面板:账号密码 / 手机验证码 双模式 + 第三方登录入口
 * 放入 AuthLayout 使用;校验通过后回调 onLogin。
 */
export function LoginForm({
  title = "欢迎登录",
  subtitle,
  onLogin,
  loading = false,
  errorMessage,
  enableMobileLogin = true,
  onSendCode,
  onForgotPassword,
  onRegister,
  ssoProviders,
  onSsoLogin,
}: LoginFormProps) {
  const [mode, setMode] = useState<LoginMode>("account");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit() {
    const next: Record<string, string> = {};
    if (mode === "account") {
      if (!username.trim()) next.username = "请输入账号";
      if (!password) next.password = "请输入密码";
    } else {
      if (!isValidMobile(mobile)) next.mobile = "请输入正确的手机号";
      if (!code.trim()) next.code = "请输入验证码";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onLogin?.(
      mode === "account"
        ? { type: "account", username: username.trim(), password, remember }
        : { type: "mobile", mobile, code: code.trim(), remember },
    );
  }

  return (
    <div className="rideos-auth-panel">
      <h2 className="rideos-auth-title">{title}</h2>
      {subtitle && <p className="rideos-auth-subtitle">{subtitle}</p>}

      {enableMobileLogin && (
        <Tabs
          items={[
            { key: "account", label: "账号登录" },
            { key: "mobile", label: "验证码登录" },
          ]}
          activeKey={mode}
          onChange={(key) => {
            setMode(key as LoginMode);
            setErrors({});
          }}
        />
      )}

      <AuthError message={errorMessage} />

      {mode === "account" ? (
        <>
          <FormField error={errors.username}>
            <Input
              prefix={<UserOutlined />}
              placeholder="账号 / 手机号 / 邮箱"
              value={username}
              onChange={setUsername}
              onPressEnter={submit}
              allowClear
              aria-label="账号"
            />
          </FormField>
          <FormField error={errors.password}>
            <Input
              type="password"
              prefix={<LockOutlined />}
              placeholder="密码"
              value={password}
              onChange={setPassword}
              onPressEnter={submit}
              aria-label="密码"
            />
          </FormField>
        </>
      ) : (
        <>
          <FormField error={errors.mobile}>
            <Input
              prefix={<MobileOutlined />}
              placeholder="手机号"
              value={mobile}
              onChange={setMobile}
              maxLength={11}
              allowClear
              aria-label="手机号"
            />
          </FormField>
          <FormField error={errors.code}>
            <span className="rideos-auth-code-row">
              <Input
                prefix={<SafetyOutlined />}
                placeholder="验证码"
                value={code}
                onChange={setCode}
                maxLength={6}
                onPressEnter={submit}
                aria-label="验证码"
              />
              <SendCodeButton mobile={mobile} onSendCode={onSendCode} />
            </span>
          </FormField>
        </>
      )}

      <div className="rideos-auth-row">
        <Checkbox checked={remember} onChange={setRemember}>
          记住我
        </Checkbox>
        {onForgotPassword && (
          <button type="button" className="rideos-auth-link" onClick={onForgotPassword}>
            忘记密码?
          </button>
        )}
      </div>

      <Button
        variant="primary"
        className="rideos-auth-submit"
        disabled={loading}
        onClick={submit}
      >
        {loading ? "登录中..." : "登 录"}
      </Button>

      {onRegister && (
        <p className="rideos-auth-switch">
          还没有账号?
          <button type="button" className="rideos-auth-link" onClick={onRegister}>
            立即注册
          </button>
        </p>
      )}

      {ssoProviders && ssoProviders.length > 0 && (
        <>
          <div className="rideos-auth-divider">
            <span>其他登录方式</span>
          </div>
          <div className="rideos-auth-providers">
            {ssoProviders.map((provider) => (
              <button
                type="button"
                key={provider.key}
                className="rideos-auth-provider"
                onClick={() => onSsoLogin?.(provider.key)}
              >
                {provider.icon}
                <span>{provider.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
