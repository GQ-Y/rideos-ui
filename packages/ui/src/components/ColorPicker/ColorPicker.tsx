import { useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx";
import { useDismiss, useFloatingPosition } from "../../utils/floating";
import { Input } from "../Input";

/* ---------------- HSV <-> HEX ---------------- */

interface HSV {
  h: number; // 0-360
  s: number; // 0-1
  v: number; // 0-1
}

function hsvToHex({ h, s, v }: HSV): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsv(hex: string): HSV | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const num = parseInt(match[1], 16);
  const r = ((num >> 16) & 0xff) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

const DEFAULT_PRESETS = [
  "#009a7a",
  "#0b3d2e",
  "#3b82f6",
  "#8b5cf6",
  "#f472b6",
  "#fe5042",
  "#ffa51e",
  "#4db054",
  "#14b8a6",
  "#64748b",
  "#1f2329",
  "#8f959e",
];

export interface ColorPickerProps {
  /** 受控值(#rrggbb) */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (color: string | null) => void;
  /** 预设色板 */
  presets?: string[];
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

/**
 * 颜色选择器:SV 面板 + 色相条 + HEX 输入 + 预设色板
 */
export function ColorPicker({
  value: valueProp,
  defaultValue = "#009a7a",
  onChange,
  presets = DEFAULT_PRESETS,
  disabled = false,
  allowClear = false,
  className,
  style,
  "aria-label": ariaLabel,
}: ColorPickerProps) {
  const [innerValue, setInnerValue] = useState<string | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : innerValue;
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(value ?? "#009a7a") ?? { h: 160, s: 1, v: 0.6 });
  const [hexDraft, setHexDraft] = useState("");

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const svRef = useRef<HTMLDivElement | null>(null);
  const hueRef = useRef<HTMLDivElement | null>(null);
  const popupStyle = useFloatingPosition(triggerRef, open, { placement: "bottom-start", offset: 4 });

  useDismiss(open, [triggerRef, popupRef], () => setOpen(false));

  function commit(next: string | null, syncHsv = true) {
    if (valueProp === undefined) setInnerValue(next);
    onChange?.(next);
    if (next && syncHsv) {
      const parsed = hexToHsv(next);
      if (parsed) setHsv(parsed);
    }
  }

  function commitHsv(next: HSV) {
    setHsv(next);
    commit(hsvToHex(next), false);
  }

  /** 通用拖拽:mousedown 时按当前元素矩形跟踪 document mousemove(事件期读取 ref) */
  function beginDrag(
    event: ReactMouseEvent<HTMLDivElement>,
    apply: (ratioX: number, ratioY: number) => void,
  ) {
    if (disabled) return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const update = (clientX: number, clientY: number) => {
      const rx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const ry = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
      apply(rx, ry);
    };
    update(event.clientX, event.clientY);
    const onMove = (e: MouseEvent) => update(e.clientX, e.clientY);
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  const currentHex = value ?? null;
  const panelHue = hsvToHex({ h: hsv.h, s: 1, v: 1 });

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        aria-label={ariaLabel ?? "选择颜色"}
        aria-expanded={open}
        className={cx("rideos-colorpicker-trigger", disabled && "is-disabled", className)}
        style={style}
        onClick={() => setOpen(!open)}
      >
        <span
          className={cx("rideos-colorpicker-swatch", !currentHex && "is-empty")}
          style={currentHex ? { background: currentHex } : undefined}
        />
        <span className="rideos-colorpicker-text">{currentHex ?? "未选择"}</span>
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div ref={popupRef} className="rideos-colorpicker-popup" style={popupStyle}>
              <div
                ref={svRef}
                className="rideos-colorpicker-sv"
                style={{ background: panelHue }}
                onMouseDown={(event) => beginDrag(event, (rx, ry) => commitHsv({ ...hsv, s: rx, v: 1 - ry }))}
                role="presentation"
              >
                <span
                  className="rideos-colorpicker-sv-handle"
                  style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
                />
              </div>
              <div
                ref={hueRef}
                className="rideos-colorpicker-hue"
                onMouseDown={(event) => beginDrag(event, (rx) => commitHsv({ ...hsv, h: rx * 359.99 }))}
                role="presentation"
              >
                <span className="rideos-colorpicker-hue-handle" style={{ left: `${(hsv.h / 360) * 100}%` }} />
              </div>
              <div className="rideos-colorpicker-hex">
                <span className="rideos-colorpicker-swatch" style={{ background: currentHex ?? "transparent" }} />
                <Input
                  value={hexDraft || (currentHex ?? "")}
                  placeholder="#009a7a"
                  aria-label="十六进制颜色"
                  onChange={(next) => setHexDraft(next)}
                  onPressEnter={() => {
                    const parsed = hexToHsv(hexDraft);
                    if (parsed) {
                      commit(hexDraft.startsWith("#") ? hexDraft.toLowerCase() : `#${hexDraft.toLowerCase()}`);
                    }
                    setHexDraft("");
                  }}
                  onBlur={() => setHexDraft("")}
                />
                {allowClear && (
                  <button
                    type="button"
                    className="rideos-colorpicker-clear"
                    onClick={() => {
                      commit(null);
                      setOpen(false);
                    }}
                  >
                    清空
                  </button>
                )}
              </div>
              <div className="rideos-colorpicker-presets">
                {presets.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    aria-label={`选择 ${preset}`}
                    className={cx(
                      "rideos-colorpicker-preset",
                      preset.toLowerCase() === currentHex?.toLowerCase() && "is-active",
                    )}
                    style={{ background: preset }}
                    onClick={() => commit(preset.toLowerCase())}
                  />
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
