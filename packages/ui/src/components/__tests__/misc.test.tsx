import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker } from "../ColorPicker";
import { ConfigProvider, useConfig } from "../ConfigProvider";
import { Icon } from "../Icon";
import { ImportExport } from "../ImportExport";
import { Mention } from "../Mention";
import { PermissionGuard, PermissionProvider, usePermission } from "../PermissionGuard";
import { generateQRMatrix } from "../QRCode/encoder";
import { QRCode } from "../QRCode";
import { SearchSelect } from "../SearchSelect";
import { Tour } from "../Tour";

describe("QRCode 编码器", () => {
  it("生成合法尺寸的矩阵且确定性一致", () => {
    const a = generateQRMatrix("https://rideos.example.com/login", "M");
    const b = generateQRMatrix("https://rideos.example.com/login", "M");
    expect(a).not.toBeNull();
    expect(a!.size).toBe(a!.version * 4 + 17);
    expect(a!.modules.length).toBe(a!.size);
    expect(JSON.stringify(a!.modules)).toBe(JSON.stringify(b!.modules));
  });

  it("左上角为标准查找图形(7x7 边框全暗)", () => {
    const result = generateQRMatrix("hello", "M")!;
    for (let i = 0; i < 7; i += 1) {
      expect(result.modules[0][i]).toBe(true);
      expect(result.modules[6][i]).toBe(true);
      expect(result.modules[i][0]).toBe(true);
      expect(result.modules[i][6]).toBe(true);
    }
    expect(result.modules[1][1]).toBe(false);
    expect(result.modules[2][2]).toBe(true);
  });

  it("内容随长度升级版本;超长返回 null", () => {
    const small = generateQRMatrix("a", "M")!;
    const large = generateQRMatrix("x".repeat(200), "M")!;
    expect(large.version).toBeGreaterThan(small.version);
    expect(generateQRMatrix("x".repeat(5000), "M")).toBeNull();
  });

  it("组件渲染 SVG,超长渲染占位", () => {
    const { rerender } = render(<QRCode value="https://example.com" />);
    expect(screen.getByRole("img", { name: "二维码" })).toBeInTheDocument();
    rerender(<QRCode value={"x".repeat(5000)} />);
    expect(screen.getByText("内容过长")).toBeInTheDocument();
  });

  it("过期遮罩与刷新回调", () => {
    const onRefresh = vi.fn();
    render(<QRCode value="abc" expired onRefresh={onRefresh} />);
    fireEvent.click(screen.getByText("点击刷新"));
    expect(onRefresh).toHaveBeenCalled();
  });
});

describe("ColorPicker", () => {
  it("点开面板并选择预设色", () => {
    const onChange = vi.fn();
    render(<ColorPicker onChange={onChange} aria-label="颜色" />);
    fireEvent.click(screen.getByRole("button", { name: "颜色" }));
    fireEvent.click(screen.getByRole("button", { name: "选择 #3b82f6" }));
    expect(onChange).toHaveBeenCalledWith("#3b82f6");
  });

  it("HEX 输入回车提交", () => {
    const onChange = vi.fn();
    render(<ColorPicker onChange={onChange} aria-label="颜色" />);
    fireEvent.click(screen.getByRole("button", { name: "颜色" }));
    const input = screen.getByLabelText("十六进制颜色");
    fireEvent.change(input, { target: { value: "#112233" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("#112233");
  });
});

describe("Mention", () => {
  const USERS = [
    { value: "wangjianguo", label: "王建国", desc: "华东运营" },
    { value: "lihaifeng", label: "李海峰", desc: "华北运营" },
  ];

  it("输入 @ 触发候选并插入", async () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    render(<Mention options={USERS} onChange={onChange} onSelect={onSelect} aria-label="备注" />);
    const textarea = screen.getByLabelText("备注") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "@wang" } });
    textarea.setSelectionRange(5, 5);
    fireEvent.click(textarea);
    expect(await screen.findByText("王建国")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText("王建国"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "wangjianguo" }));
    expect(onChange).toHaveBeenLastCalledWith("@wangjianguo ");
  });
});

describe("Tour", () => {
  it("分步引导:下一步/完成/跳过", () => {
    const onClose = vi.fn();
    const onFinish = vi.fn();
    render(
      <>
        <button type="button" id="tour-target">
          目标按钮
        </button>
        <Tour
          open
          steps={[
            { target: "#tour-target", title: "第一步", description: "这里是目标" },
            { title: "第二步" },
          ]}
          onClose={onClose}
          onFinish={onFinish}
        />
      </>,
    );
    expect(screen.getByText("第一步")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    fireEvent.click(screen.getByText("下一步"));
    expect(screen.getByText("第二步")).toBeInTheDocument();
    fireEvent.click(screen.getByText("完成"));
    expect(onFinish).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});

describe("ConfigProvider / Icon", () => {
  it("主题子树与 locale 透传", () => {
    function Probe() {
      const config = useConfig();
      return <span>{config.locale?.emptyText}</span>;
    }
    const { container } = render(
      <ConfigProvider theme="dark" locale={{ emptyText: "没有数据啦" }}>
        <Probe />
      </ConfigProvider>,
    );
    expect(container.querySelector('[data-rideos-theme="dark"]')).toBeTruthy();
    expect(screen.getByText("没有数据啦")).toBeInTheDocument();
  });

  it("Icon 支持 spin 与 aria", () => {
    const { container } = render(<Icon aria-label="加载" spin size={20} />);
    const icon = screen.getByRole("img", { name: "加载" });
    expect(icon).toHaveClass("is-spin");
    expect(container.querySelector(".rideos-icon")).toBeTruthy();
  });
});

describe("SearchSelect", () => {
  it("防抖触发 onSearch 并选择结果", async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    const onChange = vi.fn();
    const { rerender } = render(
      <SearchSelect onSearch={onSearch} options={[]} onChange={onChange} aria-label="司机" />,
    );
    fireEvent.change(screen.getByLabelText("司机"), { target: { value: "王" } });
    expect(onSearch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(320);
    expect(onSearch).toHaveBeenCalledWith("王");
    vi.useRealTimers();
    rerender(
      <SearchSelect
        onSearch={onSearch}
        options={[{ value: "d1", label: "王建国", desc: "沪AD·10086" }]}
        onChange={onChange}
        aria-label="司机"
      />,
    );
    fireEvent.click(await screen.findByText("王建国"));
    expect(onChange).toHaveBeenCalledWith("d1", expect.objectContaining({ value: "d1" }));
  });
});

describe("ImportExport", () => {
  it("导出回调与导入结果反馈", async () => {
    const onExport = vi.fn();
    const onImport = vi.fn().mockResolvedValue({ success: 8, failed: 2, errors: ["第 3 行手机号格式错误"] });
    const { container } = render(<ImportExport onExport={onExport} onImport={onImport} />);
    fireEvent.click(screen.getByText("导出"));
    expect(onExport).toHaveBeenCalled();
    fireEvent.click(screen.getByText("导入"));
    const input = container.ownerDocument.querySelector(".rideos-upload-input") as HTMLInputElement;
    const file = new File(["a,b"], "drivers.csv", { type: "text/csv" });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(onImport).toHaveBeenCalled());
    expect(await screen.findByText("导入完成:成功 8 条,失败 2 条")).toBeInTheDocument();
    expect(screen.getByText("第 3 行手机号格式错误")).toBeInTheDocument();
  });
});

describe("PermissionGuard", () => {
  it("有权限渲染,无权限走 fallback", () => {
    render(
      <PermissionProvider permissions={["vehicle:export"]}>
        <PermissionGuard permission="vehicle:export">
          <button type="button">导出车辆</button>
        </PermissionGuard>
        <PermissionGuard permission="vehicle:delete" fallback={<span>无删除权限</span>}>
          <button type="button">删除车辆</button>
        </PermissionGuard>
      </PermissionProvider>,
    );
    expect(screen.getByText("导出车辆")).toBeInTheDocument();
    expect(screen.queryByText("删除车辆")).not.toBeInTheDocument();
    expect(screen.getByText("无删除权限")).toBeInTheDocument();
  });

  it("usePermission any 语义", () => {
    function Probe() {
      const ok = usePermission(["a", "b"]);
      return <span>{ok ? "允许" : "拒绝"}</span>;
    }
    render(
      <PermissionProvider permissions={["b"]}>
        <Probe />
      </PermissionProvider>,
    );
    expect(screen.getByText("允许")).toBeInTheDocument();
  });
});
