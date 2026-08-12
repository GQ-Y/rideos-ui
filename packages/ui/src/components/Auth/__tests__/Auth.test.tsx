import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthLayout } from "../AuthLayout";
import { LoginForm } from "../LoginForm";
import { RegisterForm } from "../RegisterForm";
import { ResetPasswordForm } from "../ResetPasswordForm";
import { SsoAuthorizePanel, SsoLoginPanel } from "../SsoPanels";

describe("AuthLayout", () => {
  it("渲染品牌区与内容", () => {
    render(
      <AuthLayout slogan="测试标语" footer="© 2026">
        <p>面板内容</p>
      </AuthLayout>,
    );
    expect(screen.getByText("测试标语")).toBeInTheDocument();
    expect(screen.getByText("面板内容")).toBeInTheDocument();
    expect(screen.getByText("© 2026")).toBeInTheDocument();
  });
});

describe("LoginForm", () => {
  it("账号模式:空提交显示校验错误,不触发 onLogin", () => {
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);
    fireEvent.click(screen.getByRole("button", { name: "登 录" }));
    expect(screen.getByText("请输入账号")).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("账号模式:填写后提交回传值", () => {
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText("账号"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("密码"), { target: { value: "pass1234" } });
    fireEvent.click(screen.getByRole("button", { name: "登 录" }));
    expect(onLogin).toHaveBeenCalledWith({
      type: "account",
      username: "admin",
      password: "pass1234",
      remember: true,
    });
  });

  it("切换验证码登录并校验手机号", () => {
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);
    fireEvent.click(screen.getByText("验证码登录"));
    fireEvent.change(screen.getByLabelText("手机号"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "登 录" }));
    expect(screen.getByText("请输入正确的手机号")).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("SSO 入口点击回调", () => {
    const onSsoLogin = vi.fn();
    render(
      <LoginForm ssoProviders={[{ key: "sso", label: "统一认证" }]} onSsoLogin={onSsoLogin} />,
    );
    fireEvent.click(screen.getByText("统一认证"));
    expect(onSsoLogin).toHaveBeenCalledWith("sso");
  });
});

describe("RegisterForm", () => {
  it("密码不一致与未勾选协议时报错", () => {
    const onRegister = vi.fn();
    render(<RegisterForm onRegister={onRegister} />);
    fireEvent.change(screen.getByLabelText("用户名"), { target: { value: "user" } });
    fireEvent.change(screen.getByLabelText("手机号"), { target: { value: "13800001111" } });
    fireEvent.change(screen.getByLabelText("验证码"), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText("设置密码"), { target: { value: "password1" } });
    fireEvent.change(screen.getByLabelText("确认密码"), { target: { value: "password2" } });
    fireEvent.click(screen.getByRole("button", { name: "注 册" }));
    expect(screen.getByText("两次输入的密码不一致")).toBeInTheDocument();
    expect(screen.getByText("请先阅读并同意协议")).toBeInTheDocument();
    expect(onRegister).not.toHaveBeenCalled();
  });

  it("完整填写并勾选协议后提交", () => {
    const onRegister = vi.fn();
    render(<RegisterForm onRegister={onRegister} />);
    fireEvent.change(screen.getByLabelText("用户名"), { target: { value: "user" } });
    fireEvent.change(screen.getByLabelText("手机号"), { target: { value: "13800001111" } });
    fireEvent.change(screen.getByLabelText("验证码"), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText("设置密码"), { target: { value: "password1" } });
    fireEvent.change(screen.getByLabelText("确认密码"), { target: { value: "password1" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "注 册" }));
    expect(onRegister).toHaveBeenCalledWith({
      username: "user",
      mobile: "13800001111",
      code: "123456",
      password: "password1",
    });
  });
});

describe("ResetPasswordForm", () => {
  it("三步流程直至成功页", async () => {
    const onSubmit = vi.fn();
    render(<ResetPasswordForm onSubmit={onSubmit} onBackToLogin={() => {}} />);
    fireEvent.change(screen.getByLabelText("注册手机号"), { target: { value: "13800001111" } });
    fireEvent.change(screen.getByLabelText("验证码"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "下一步" }));
    fireEvent.change(screen.getByLabelText("新密码"), { target: { value: "newpass123" } });
    fireEvent.change(screen.getByLabelText("确认新密码"), { target: { value: "newpass123" } });
    fireEvent.click(screen.getByRole("button", { name: "确认修改" }));
    expect(onSubmit).toHaveBeenCalledWith({
      mobile: "13800001111",
      code: "123456",
      password: "newpass123",
    });
    expect(await screen.findByText("密码重置成功")).toBeInTheDocument();
  });
});

describe("SSO 面板", () => {
  it("SsoLoginPanel 主入口与身份源回调", () => {
    const onPrimary = vi.fn();
    const onProvider = vi.fn();
    render(
      <SsoLoginPanel
        onPrimaryLogin={onPrimary}
        providers={[{ key: "wecom", label: "企业微信" }]}
        onProviderLogin={onProvider}
      />,
    );
    fireEvent.click(screen.getByText("使用集团统一身份认证登录"));
    expect(onPrimary).toHaveBeenCalled();
    fireEvent.click(screen.getByText("企业微信"));
    expect(onProvider).toHaveBeenCalledWith("wecom");
  });

  it("SsoAuthorizePanel 渲染权限并处理同意/拒绝", () => {
    const onApprove = vi.fn();
    const onDeny = vi.fn();
    render(
      <SsoAuthorizePanel
        clientName="调度大屏"
        user={{ name: "平台管理员" }}
        scopes={[{ key: "p", label: "读取基本信息" }]}
        onApprove={onApprove}
        onDeny={onDeny}
      />,
    );
    expect(screen.getByText("读取基本信息")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "同意授权" }));
    expect(onApprove).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "拒绝" }));
    expect(onDeny).toHaveBeenCalled();
  });
});
