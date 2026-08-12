import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "../Button";

/** 发送验证码倒计时 */
export function useCountdown(seconds = 60) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return undefined;
    const timer = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);
  return { left, start: () => setLeft(seconds) };
}

/** 手机号校验 */
export function isValidMobile(mobile: string) {
  return /^1\d{10}$/.test(mobile);
}

/** 表单顶部错误提示条 */
export function AuthError({ message }: { message?: ReactNode }) {
  if (!message) return null;
  return (
    <div className="rideos-auth-error" role="alert">
      {message}
    </div>
  );
}

/** 获取验证码按钮(含倒计时) */
export function SendCodeButton({
  mobile,
  onSendCode,
}: {
  mobile: string;
  onSendCode?: (mobile: string) => void | Promise<void>;
}) {
  const { left, start } = useCountdown(60);
  const disabled = left > 0 || !isValidMobile(mobile);

  async function handleSend() {
    if (disabled) return;
    start();
    await onSendCode?.(mobile);
  }

  return (
    <Button className="rideos-auth-code-btn" disabled={disabled} onClick={handleSend}>
      {left > 0 ? `${left}s 后重发` : "获取验证码"}
    </Button>
  );
}
