import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AutoComplete } from "../AutoComplete";
import { Button } from "../Button";
import { Cascader } from "../Cascader";
import { Form, FormItem, useForm } from "../Form";
import { Input } from "../Input";
import { Menu } from "../Menu";
import { notification } from "../Notification";
import { TreeSelect } from "../TreeSelect";
import { Upload } from "../Upload";
import type { UploadRequestOptions } from "../Upload";

describe("Form", () => {
  it("必填校验失败时展示错误且不提交", async () => {
    const onFinish = vi.fn();
    render(
      <Form onFinish={onFinish}>
        <FormItem name="plate" label="车牌" required>
          <Input aria-label="车牌" />
        </FormItem>
        <Button type="submit">提交</Button>
      </Form>,
    );
    fireEvent.click(screen.getByText("提交"));
    expect(await screen.findByText("该项为必填项")).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("校验通过后回传 values,输入即清除错误", async () => {
    const onFinish = vi.fn();
    render(
      <Form onFinish={onFinish}>
        <FormItem
          name="phone"
          label="手机号"
          required
          rules={[{ pattern: /^1\d{10}$/, message: "手机号格式不正确" }]}
        >
          <Input aria-label="手机号" />
        </FormItem>
        <Button type="submit">提交</Button>
      </Form>,
    );
    fireEvent.change(screen.getByLabelText("手机号"), { target: { value: "123" } });
    fireEvent.click(screen.getByText("提交"));
    expect(await screen.findByText("手机号格式不正确")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("手机号"), { target: { value: "13800001111" } });
    expect(screen.queryByText("手机号格式不正确")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("提交"));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ phone: "13800001111" }));
  });

  it("useForm 支持外部读写与重置", async () => {
    function Demo() {
      const form = useForm();
      return (
        <Form form={form} initialValues={{ city: "上海" }}>
          <FormItem name="city" label="城市">
            <Input aria-label="城市" />
          </FormItem>
          <Button onClick={() => form.setValue("city", "杭州")}>改值</Button>
          <Button onClick={() => form.reset()}>重置</Button>
        </Form>
      );
    }
    render(<Demo />);
    const input = screen.getByLabelText("城市") as HTMLInputElement;
    expect(input.value).toBe("上海");
    fireEvent.click(screen.getByText("改值"));
    await waitFor(() => expect(input.value).toBe("杭州"));
    fireEvent.click(screen.getByText("重置"));
    await waitFor(() => expect(input.value).toBe("上海"));
  });
});

describe("Upload", () => {
  function pickFile(container: HTMLElement, name: string) {
    const input = container.querySelector(".rideos-upload-input") as HTMLInputElement;
    const file = new File(["hello"], name, { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });
  }

  it("默认直接完成并渲染文件列表", () => {
    const { container } = render(<Upload />);
    pickFile(container, "report.txt");
    expect(screen.getByText("report.txt")).toBeInTheDocument();
    expect(container.querySelector(".status-done")).toBeTruthy();
  });

  it("customRequest 驱动进度与失败", async () => {
    const request = (options: UploadRequestOptions) => {
      options.onProgress(40);
      options.onError("文件过大");
    };
    const { container } = render(<Upload customRequest={request} />);
    pickFile(container, "big.zip");
    expect(await screen.findByText("文件过大")).toBeInTheDocument();
    expect(container.querySelector(".status-error")).toBeTruthy();
  });

  it("删除文件", () => {
    const onRemove = vi.fn();
    const { container } = render(<Upload onRemove={onRemove} />);
    pickFile(container, "a.txt");
    fireEvent.click(screen.getByRole("button", { name: "删除 a.txt" }));
    expect(onRemove).toHaveBeenCalled();
    expect(screen.queryByText("a.txt")).not.toBeInTheDocument();
  });
});

describe("notification", () => {
  it("命令式弹出角落通知并可关闭", async () => {
    notification.success({ title: "导出完成", description: "文件已生成", duration: 0 });
    expect(await screen.findByText("导出完成")).toBeInTheDocument();
    expect(screen.getByText("文件已生成")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "关闭通知" })[0]);
    await waitFor(() => expect(screen.queryByText("导出完成")).not.toBeInTheDocument());
  });
});

describe("Menu", () => {
  const ITEMS = [
    { key: "home", label: "工作台" },
    {
      key: "vehicle",
      label: "车辆",
      children: [
        { key: "list", label: "台账" },
        { key: "model", label: "车型" },
      ],
    },
  ];

  it("垂直模式:展开子菜单并选中", () => {
    const onSelect = vi.fn();
    render(<Menu items={ITEMS} onSelect={onSelect} />);
    expect(screen.queryByText("台账")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("车辆"));
    fireEvent.click(screen.getByText("台账"));
    expect(onSelect).toHaveBeenCalledWith("list", expect.objectContaining({ key: "list" }));
  });

  it("水平模式:悬浮弹出子菜单", () => {
    render(<Menu items={ITEMS} mode="horizontal" />);
    fireEvent.mouseEnter(screen.getByText("车辆").closest(".rideos-menu-hitem-wrap")!);
    expect(screen.getByText("车型")).toBeInTheDocument();
  });
});

describe("AutoComplete", () => {
  it("输入过滤并选择候选", () => {
    const onChange = vi.fn();
    render(
      <AutoComplete
        options={["上海虹桥", "上海浦东", "杭州东"]}
        onChange={onChange}
        aria-label="站点"
      />,
    );
    fireEvent.change(screen.getByLabelText("站点"), { target: { value: "上海" } });
    expect(screen.getByText("上海虹桥")).toBeInTheDocument();
    expect(screen.queryByText("杭州东")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("上海浦东"));
    expect(onChange).toHaveBeenLastCalledWith("上海浦东");
  });
});

describe("Cascader", () => {
  const OPTIONS = [
    {
      label: "华东",
      value: "east",
      children: [
        { label: "上海", value: "sh" },
        { label: "杭州", value: "hz" },
      ],
    },
    { label: "华北", value: "north", children: [{ label: "北京", value: "bj" }] },
  ];

  it("逐列展开并点选叶子提交路径", () => {
    const onChange = vi.fn();
    render(<Cascader options={OPTIONS} onChange={onChange} aria-label="区域" />);
    fireEvent.click(screen.getByRole("combobox", { name: "区域" }));
    fireEvent.click(screen.getByText("华东"));
    fireEvent.click(screen.getByText("杭州"));
    expect(onChange).toHaveBeenCalledWith(
      ["east", "hz"],
      expect.arrayContaining([expect.objectContaining({ value: "hz" })]),
    );
    /* 已选路径回显 */
    expect(screen.getByRole("combobox", { name: "区域" }).textContent).toContain("杭州");
  });
});

describe("TreeSelect", () => {
  const DATA = [
    {
      key: "hq",
      title: "总部",
      children: [{ key: "ops", title: "运营部" }],
    },
  ];

  it("面板选择节点并回显", () => {
    const onChange = vi.fn();
    render(<TreeSelect treeData={DATA} onChange={onChange} aria-label="部门" />);
    fireEvent.click(screen.getByRole("combobox", { name: "部门" }));
    fireEvent.click(screen.getByText("运营部"));
    expect(onChange).toHaveBeenCalledWith("ops", expect.objectContaining({ key: "ops" }));
    expect(screen.getByText("运营部")).toBeInTheDocument();
  });
});
