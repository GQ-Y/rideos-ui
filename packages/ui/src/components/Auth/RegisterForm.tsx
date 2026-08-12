import { useState } from "react";
import type { ReactNode } from "react";
import { LockOutlined, MobileOutlined, SafetyOutlined, UserOutlined } from "@ant-design/icons";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { FormField } from "../FormField";
import { Input } from "../Input";
import { AuthError, isValidMobile, SendCodeButton } from "./internal";

export interface RegisterValues {
  username: string;
  mobile: string;
  code: string;
  password: string;
}

export interface RegisterFormProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  onRegister?: (values: RegisterValues) => void;
  loading?: boolean;
  errorMessage?: ReactNode;
  onSendCode?: (mobile: string) => void | Promise<void>;
  /** 返回登录 */
  onBackToLogin?: () => void;
  /** 协议区自定义(缺省文案「用户协议与隐私政策」) */
  agreement?: ReactNode;
}

/**
 * 注册面板:账号 + 手机验证码 + 密码,协议勾选后可提交
 */
export function RegisterForm({
  title = "注册账号",
  subtitle,
  onRegister,
  loading = false,
  errorMessage,
  onSendCode,
  onBackToLogin,
  agreement,
}: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit() {
    const next: Record<string, string> = {};
    if (!username.trim()) next.username = "请输入用户名";
    if (!isValidMobile(mobile)) next.mobile = "请输入正确的手机号";
    if (!code.trim()) next.code = "请输入验证码";
    if (password.length < 8) next.password = "密码至少 8 位";
    if (confirm !== password) next.confirm = "两次输入的密码不一致";
    if (!agreed) next.agreed = "请先阅读并同意协议";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onRegister?.({ username: username.trim(), mobile, code: code.trim(), password });
  }

  return (
    <div className="rideos-auth-panel">
      <h2 className="rideos-auth-title">{title}</h2>
      {subtitle && <p className="rideos-auth-subtitle">{subtitle}</p>}

      <AuthError message={errorMessage} />

      <FormField error={errors.username}>
        <Input
          prefix={<UserOutlined />}
          placeholder="用户名"
          value={username}
          onChange={setUsername}
          allowClear
          aria-label="用户名"
        />
      </FormField>
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
            aria-label="验证码"
          />
          <SendCodeButton mobile={mobile} onSendCode={onSendCode} />
        </span>
      </FormField>
      <FormField error={errors.password}>
        <Input
          type="password"
          prefix={<LockOutlined />}
          placeholder="设置密码(至少 8 位)"
          value={password}
          onChange={setPassword}
          aria-label="设置密码"
        />
      </FormField>
      <FormField error={errors.confirm}>
        <Input
          type="password"
          prefix={<LockOutlined />}
          placeholder="确认密码"
          value={confirm}
          onChange={setConfirm}
          onPressEnter={submit}
          aria-label="确认密码"
        />
      </FormField>

      <FormField error={errors.agreed}>
        <Checkbox checked={agreed} onChange={setAgreed}>
          {agreement ?? (
            <>
              我已阅读并同意
              <span className="rideos-auth-link-text">《用户协议》</span>与
              <span className="rideos-auth-link-text">《隐私政策》</span>
            </>
          )}
        </Checkbox>
      </FormField>

      <Button variant="primary" className="rideos-auth-submit" disabled={loading} onClick={submit}>
        {loading ? "注册中..." : "注 册"}
      </Button>

      {onBackToLogin && (
        <p className="rideos-auth-switch">
          已有账号?
          <button type="button" className="rideos-auth-link" onClick={onBackToLogin}>
            返回登录
          </button>
        </p>
      )}
    </div>
  );
}
