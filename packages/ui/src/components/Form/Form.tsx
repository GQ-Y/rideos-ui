import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactElement, ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { cx } from "../../utils/cx";
import { FormField } from "../FormField";

export type FormValues = Record<string, unknown>;

/** 校验规则 */
export interface FormRule {
  /** 必填(空串/null/undefined/空数组视为空) */
  required?: boolean;
  /** 正则校验(仅字符串值) */
  pattern?: RegExp;
  /** 最小:字符串为长度,数字为数值 */
  min?: number;
  /** 最大:字符串为长度,数字为数值 */
  max?: number;
  /** 校验失败提示 */
  message?: string;
  /** 自定义校验:返回错误文案(支持异步),通过返回 undefined */
  validator?: (value: unknown, values: FormValues) => string | undefined | Promise<string | undefined>;
}

export interface FormInstance {
  getValues: () => FormValues;
  getValue: (name: string) => unknown;
  setValue: (name: string, value: unknown) => void;
  setValues: (patch: FormValues) => void;
  /** 校验全部(或指定字段),返回是否通过与错误明细 */
  validate: (names?: string[]) => Promise<{ valid: boolean; errors: Record<string, string> }>;
  /** 重置为 initialValues 并清空错误 */
  reset: () => void;
}

interface FormHooks extends FormInstance {
  __placeholder?: never;
}

interface ConnectableForm extends FormInstance {
  __connect: (hooks: FormHooks | null) => void;
}

const noopAsync = async () => ({ valid: true, errors: {} });

function createConnectableForm(): ConnectableForm {
  let hooks: FormHooks | null = null;
  return {
    __connect: (next) => {
      hooks = next;
    },
    getValues: () => hooks?.getValues() ?? {},
    getValue: (name) => hooks?.getValue(name),
    setValue: (name, value) => hooks?.setValue(name, value),
    setValues: (patch) => hooks?.setValues(patch),
    validate: (names) => hooks?.validate(names) ?? noopAsync(),
    reset: () => hooks?.reset(),
  };
}

/** 创建可在组件外操作表单的实例(配合 <Form form={form}>) */
export function useForm(): FormInstance {
  const [instance] = useState<ConnectableForm>(createConnectableForm);
  return instance;
}

interface FormContextValue {
  values: FormValues;
  errors: Record<string, string>;
  layout: "vertical" | "horizontal";
  disabled: boolean;
  setFieldValue: (name: string, value: unknown) => void;
  registerRules: (name: string, rules: FormRule[] | undefined, required: boolean | undefined) => void;
  validateField: (name: string) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

async function runRules(
  value: unknown,
  rules: FormRule[],
  values: FormValues,
): Promise<string | undefined> {
  for (const rule of rules) {
    if (rule.required && isEmpty(value)) {
      return rule.message ?? "该项为必填项";
    }
    if (isEmpty(value)) continue;
    if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
      return rule.message ?? "格式不正确";
    }
    if (rule.min != null) {
      if (typeof value === "string" && value.length < rule.min)
        return rule.message ?? `至少 ${rule.min} 个字符`;
      if (typeof value === "number" && value < rule.min)
        return rule.message ?? `不能小于 ${rule.min}`;
    }
    if (rule.max != null) {
      if (typeof value === "string" && value.length > rule.max)
        return rule.message ?? `最多 ${rule.max} 个字符`;
      if (typeof value === "number" && value > rule.max)
        return rule.message ?? `不能大于 ${rule.max}`;
    }
    if (rule.validator) {
      const result = await rule.validator(value, values);
      if (result) return result;
    }
  }
  return undefined;
}

export interface FormProps {
  /** useForm() 实例(需要外部操作时传入) */
  form?: FormInstance;
  initialValues?: FormValues;
  /** 标签布局:vertical 上下(默认)/ horizontal 左右 */
  layout?: "vertical" | "horizontal";
  disabled?: boolean;
  /** 校验通过后提交 */
  onFinish?: (values: FormValues) => void;
  /** 校验失败 */
  onFinishFailed?: (errors: Record<string, string>) => void;
  children?: ReactNode;
  className?: string;
}

/**
 * 表单:值托管 + 规则校验(required/pattern/min-max/自定义异步 validator)
 * 配合 FormItem 使用;提交按钮用 <Button type="submit">。
 */
export function Form({
  form,
  initialValues = {},
  layout = "vertical",
  disabled = false,
  onFinish,
  onFinishFailed,
  children,
  className,
}: FormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const rulesRef = useRef<Map<string, FormRule[]>>(new Map());
  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  function setFieldValue(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function validate(names?: string[]) {
    const targets = names ?? [...rulesRef.current.keys()];
    const nextErrors: Record<string, string> = {};
    for (const name of targets) {
      const rules = rulesRef.current.get(name);
      if (!rules || rules.length === 0) continue;
      const error = await runRules(valuesRef.current[name], rules, valuesRef.current);
      if (error) nextErrors[name] = error;
    }
    setErrors((prev) => {
      const merged = { ...prev };
      targets.forEach((name) => delete merged[name]);
      return { ...merged, ...nextErrors };
    });
    return { valid: Object.keys(nextErrors).length === 0, errors: nextErrors };
  }

  const hooksRef = useRef<FormHooks>({
    getValues: () => valuesRef.current,
    getValue: (name) => valuesRef.current[name],
    setValue: setFieldValue,
    setValues: (patch) => setValues((prev) => ({ ...prev, ...patch })),
    validate,
    reset: () => {
      setValues(initialValues);
      setErrors({});
    },
  });

  useEffect(() => {
    const connectable = form as ConnectableForm | undefined;
    connectable?.__connect?.(hooksRef.current);
    return () => connectable?.__connect?.(null);
  }, [form]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await validate();
    if (result.valid) onFinish?.(valuesRef.current);
    else onFinishFailed?.(result.errors);
  }

  const context = useMemo<FormContextValue>(
    () => ({
      values,
      errors,
      layout,
      disabled,
      setFieldValue,
      registerRules: (name, rules, required) => {
        const merged = [...(rules ?? [])];
        if (required && !merged.some((rule) => rule.required)) {
          merged.unshift({ required: true });
        }
        rulesRef.current.set(name, merged);
      },
      validateField: (name) => {
        void validate([name]);
      },
    }),
    [values, errors, layout, disabled],
  );

  return (
    <FormContext.Provider value={context}>
      <form
        className={cx("rideos-form", `layout-${layout}`, className)}
        onSubmit={handleSubmit}
        noValidate
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

export interface FormItemProps {
  /** 字段名;不传则仅作布局 */
  name?: string;
  label?: ReactNode;
  /** 必填标记(自动附加 required 规则) */
  required?: boolean;
  rules?: FormRule[];
  hint?: ReactNode;
  /** 受控值注入的属性名,默认 value(Switch/Checkbox 用 checked) */
  valuePropName?: string;
  /** 失焦时校验该字段,默认 true */
  validateOnBlur?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * 表单项:连接 Form 上下文,把 value/onChange 注入子控件并展示校验错误
 * 子控件需满足约定:onChange 第一个参数即为新值(库内控件均符合)。
 */
export function FormItem({
  name,
  label,
  required,
  rules,
  hint,
  valuePropName = "value",
  validateOnBlur = true,
  children,
  className,
}: FormItemProps) {
  const context = useContext(FormContext);

  if (!context || !name) {
    return (
      <FormField label={label} required={required} hint={hint} className={className}>
        {children}
      </FormField>
    );
  }

  context.registerRules(name, rules, required);
  const error = context.errors[name];

  let control = children;
  if (isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const injected: Record<string, unknown> = {
      [valuePropName]: context.values[name] ?? (valuePropName === "checked" ? false : ""),
      onChange: (next: unknown, ...rest: unknown[]) => {
        context.setFieldValue(name, next);
        const original = child.props.onChange;
        if (typeof original === "function") original(next, ...rest);
      },
    };
    if (context.disabled) injected.disabled = true;
    if (validateOnBlur) {
      injected.onBlur = (...args: unknown[]) => {
        context.validateField(name);
        const original = child.props.onBlur;
        if (typeof original === "function") original(...args);
      };
    }
    control = cloneElement(child, injected);
  }

  return (
    <FormField label={label} required={required} hint={hint} error={error} className={className}>
      {control}
    </FormField>
  );
}
