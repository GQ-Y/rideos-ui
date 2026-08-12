import { useState } from "react";
import type { ReactNode } from "react";
import {
  CheckCircleFilled,
  LockOutlined,
  MobileOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { Button } from "../Button";
import { FormField } from "../FormField";
import { Input } from "../Input";
import { AuthError, isValidMobile, SendCodeButton } from "./internal";

export interface ResetPasswordValues {
  mobile: string;
  code: string;
  password: string;
}

export interface ResetPasswordFormProps {
  title?: ReactNode;
  onSendCode?: (mobile: string) => void | Promise<void>;
  /** 最终提交(设置新密码);返回 Promise 时等待完成后进入成功页 */
  onSubmit?: (values: ResetPasswordValues) => void | Promise<void>;
  loading?: boolean;
  errorMessage?: ReactNode;
  onBackToLogin?: () => void;
}

const STEPS = ["验证身份", "设置新密码", "完成"];

/**
 * 找回密码面板:三步流程(验证身份 → 设置新密码 → 完成)
 */
export function ResetPasswordForm({
  title = "找回密码",
  onSendCode,
  onSubmit,
  loading = false,
  errorMessage,
  onBackToLogin,
}: ResetPasswordFormProps) {
  const [step, setStep] = useState(0);
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function verifyStep() {
    const next: Record<string, string> = {};
    if (!isValidMobile(mobile)) next.mobile = "请输入正确的手机号";
    if (!code.trim()) next.code = "请输入验证码";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStep(1);
  }

  async function submitStep() {
    const next: Record<string, string> = {};
    if (password.length < 8) next.password = "密码至少 8 位";
    if (confirm !== password) next.confirm = "两次输入的密码不一致";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    await onSubmit?.({ mobile, code: code.trim(), password });
    setStep(2);
  }

  return (
    <div className="rideos-auth-panel">
      <h2 className="rideos-auth-title">{title}</h2>

      <div className="rideos-auth-steps" role="list">
        {STEPS.map((label, index) => (
          <span
            key={label}
            role="listitem"
            className={cx(
              "rideos-auth-step",
              index === step && "is-active",
              index < step && "is-done",
            )}
          >
            <i>{index + 1}</i>
            {label}
          </span>
        ))}
      </div>

      <AuthError message={errorMessage} />

      {step === 0 && (
        <>
          <FormField error={errors.mobile}>
            <Input
              prefix={<MobileOutlined />}
              placeholder="注册手机号"
              value={mobile}
              onChange={setMobile}
              maxLength={11}
              allowClear
              aria-label="注册手机号"
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
                onPressEnter={verifyStep}
                aria-label="验证码"
              />
              <SendCodeButton mobile={mobile} onSendCode={onSendCode} />
            </span>
          </FormField>
          <Button variant="primary" className="rideos-auth-submit" onClick={verifyStep}>
            下一步
          </Button>
        </>
      )}

      {step === 1 && (
        <>
          <FormField error={errors.password}>
            <Input
              type="password"
              prefix={<LockOutlined />}
              placeholder="新密码(至少 8 位)"
              value={password}
              onChange={setPassword}
              aria-label="新密码"
            />
          </FormField>
          <FormField error={errors.confirm}>
            <Input
              type="password"
              prefix={<LockOutlined />}
              placeholder="确认新密码"
              value={confirm}
              onChange={setConfirm}
              onPressEnter={submitStep}
              aria-label="确认新密码"
            />
          </FormField>
          <Button
            variant="primary"
            className="rideos-auth-submit"
            disabled={loading}
            onClick={submitStep}
          >
            {loading ? "提交中..." : "确认修改"}
          </Button>
          <p className="rideos-auth-switch">
            <button type="button" className="rideos-auth-link" onClick={() => setStep(0)}>
              上一步
            </button>
          </p>
        </>
      )}

      {step === 2 && (
        <div className="rideos-auth-success">
          <CheckCircleFilled />
          <strong>密码重置成功</strong>
          <p>请使用新密码重新登录</p>
          {onBackToLogin && (
            <Button variant="primary" className="rideos-auth-submit" onClick={onBackToLogin}>
              返回登录
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
