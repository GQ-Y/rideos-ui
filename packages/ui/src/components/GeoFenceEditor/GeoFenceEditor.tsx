import { useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Button } from "../Button";
import { FormField } from "../FormField";
import { Input } from "../Input";
import { InputNumber } from "../InputNumber";
import { Select } from "../Select";
import { StatusBadge } from "../StatusBadge";
import { Textarea } from "../Textarea";
import { cx } from "../../utils/cx";

/** 编辑器本地像素坐标点 [x, y] */
export type GeoFencePoint = [number, number];

/** 围栏类型:服务区 / 禁停区 / 接驳点 */
export type GeoFenceType = "SERVICE" | "FORBIDDEN" | "HUB";

/** 多边形围栏几何(服务区/禁停区) */
export interface GeoFencePolygonGeometry {
  type?: "Polygon";
  /** 环坐标数组,第一个环为外环 */
  coordinates?: GeoFencePoint[][];
}

/** 接驳点几何 */
export interface GeoFenceHubGeometry {
  /** 圆心 */
  center: GeoFencePoint;
  /** 半径(米) */
  radiusM?: number;
}

/** 围栏公共字段 */
export interface GeoFenceBase {
  id: string;
  name: string;
  /** 所属县域 */
  regionId?: string;
  enabled?: boolean;
  remark?: string;
}

/** 多边形围栏(服务区/禁停区) */
export interface GeoFencePolygon extends GeoFenceBase {
  type: "SERVICE" | "FORBIDDEN";
  geometry?: GeoFencePolygonGeometry;
}

/** 接驳点围栏 */
export interface GeoFenceHub extends GeoFenceBase {
  type: "HUB";
  geometry: GeoFenceHubGeometry;
}

/** 电子围栏 */
export type GeoFence = GeoFencePolygon | GeoFenceHub;

export interface GeoFenceEditorProps {
  /** 初始围栏列表 */
  fences?: GeoFence[];
  /** 当前县域名称 */
  regionLabel?: string;
  /** 围栏列表变更回调 */
  onChange?: (fences: GeoFence[]) => void;
}

type GeoFenceTool = "select" | "polygon" | "hub";

type GeoFencePatch = Partial<GeoFenceBase> & {
  type?: GeoFenceType;
  geometry?: GeoFencePolygonGeometry | GeoFenceHubGeometry;
};

const TYPE_LABEL: Record<GeoFenceType, string> = {
  SERVICE: "服务区",
  FORBIDDEN: "禁停区",
  HUB: "接驳点",
};

function toSvgPoints(points: GeoFencePoint[]) {
  return points.map((point) => `${point[0]},${point[1]}`).join(" ");
}

function closeRing(points: GeoFencePoint[]) {
  if (points.length < 3) return points;
  const [fx, fy] = points[0];
  const [lx, ly] = points[points.length - 1];
  if (fx === lx && fy === ly) return points;
  return [...points, points[0]];
}

/**
 * 电子围栏编辑器：左列表 + 中画布绘制 + 右属性
 * 坐标系为编辑器本地像素坐标（Mock/演示）；接入真实地图时替换 canvas 层即可。
 */
export function GeoFenceEditor({
  fences: initialFences = [],
  regionLabel = "当前县域",
  onChange,
}: GeoFenceEditorProps) {
  const [fences, setFences] = useState<GeoFence[]>(initialFences);
  const [selectedId, setSelectedId] = useState(initialFences[0]?.id || "");
  const [tool, setTool] = useState<GeoFenceTool>("select");
  const [draft, setDraft] = useState<GeoFencePoint[]>([]);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const svgRef = useRef<SVGSVGElement | null>(null);

  const selected = useMemo(
    () => fences.find((item) => item.id === selectedId) || null,
    [fences, selectedId],
  );

  function commit(next: GeoFence[]) {
    setFences(next);
    onChange?.(next);
    setDirty(false);
  }

  function updateSelected(patch: GeoFencePatch) {
    if (!selected) return;
    setDirty(true);
    setFences((current) => current.map((item) => (
      item.id === selected.id ? ({ ...item, ...patch } as GeoFence) : item
    )));
  }

  function handleSvgClick(event: ReactMouseEvent<SVGSVGElement>) {
    if (tool !== "polygon" && tool !== "hub") return;
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);
    if (tool === "hub") {
      const id = `hub-${Date.now()}`;
      const fence: GeoFence = {
        id,
        name: `接驳点 ${fences.length + 1}`,
        regionId: regionLabel,
        type: "HUB",
        geometry: { center: [x, y], radiusM: 80 },
        enabled: true,
        remark: "",
      };
      const next = [...fences, fence];
      commit(next);
      setSelectedId(id);
      setTool("select");
      setMessage("已添加接驳点");
      return;
    }
    setDraft((current) => [...current, [x, y]]);
  }

  function finishPolygon() {
    if (draft.length < 3) {
      setMessage("多边形至少需要 3 个顶点");
      return;
    }
    const id = `poly-${Date.now()}`;
    const fence: GeoFence = {
      id,
      name: `服务区 ${fences.filter((item) => item.type === "SERVICE").length + 1}`,
      regionId: regionLabel,
      type: "SERVICE",
      geometry: { type: "Polygon", coordinates: [closeRing(draft)] },
      enabled: true,
      remark: "",
    };
    const next = [...fences, fence];
    commit(next);
    setSelectedId(id);
    setDraft([]);
    setTool("select");
    setMessage("围栏已创建");
  }

  function removeSelected() {
    if (!selected) return;
    const next = fences.filter((item) => item.id !== selected.id);
    commit(next);
    setSelectedId(next[0]?.id || "");
    setMessage("已删除围栏");
  }

  function saveSelected() {
    if (!selected) return;
    if (selected.type !== "HUB") {
      const ring = selected.geometry?.coordinates?.[0] || [];
      if (ring.length < 4) {
        setMessage("请完善多边形（至少 3 点并闭合）");
        return;
      }
    }
    commit(fences);
    setMessage("已保存（Mock）");
  }

  return (
    <div className="rideos-geofence">
      {message && <div className="rideos-toast">{message}</div>}
      <div className="rideos-geofence-toolbar">
        <span>{regionLabel}</span>
        <div className="rideos-geofence-tools">
          {([
            ["select", "选择"],
            ["polygon", "多边形"],
            ["hub", "接驳点"],
          ] as const).map(([key, label]) => (
            <Button key={key} variant={tool === key ? "primary" : "default"} onClick={() => setTool(key)}>
              {label}
            </Button>
          ))}
          {tool === "polygon" && (
            <>
              <Button onClick={finishPolygon}>完成绘制</Button>
              <Button onClick={() => setDraft([])}>清空顶点</Button>
            </>
          )}
          <Button onClick={removeSelected} disabled={!selected}>删除</Button>
        </div>
      </div>
      <div className="rideos-geofence-body">
        <aside className="rideos-geofence-list">
          <h4>围栏列表（{fences.length}）</h4>
          <div className="body">
            {fences.map((fence) => (
              <button
                type="button"
                key={fence.id}
                className={cx("rideos-geofence-item", selectedId === fence.id && "active")}
                onClick={() => setSelectedId(fence.id)}
              >
                <strong>{fence.name}</strong>
                <small>{TYPE_LABEL[fence.type] || fence.type}</small>
                <StatusBadge value={fence.enabled ? "启用" : "停用"} />
              </button>
            ))}
            {!fences.length && <div className="rideos-tree-empty">暂无围栏，请在地图绘制</div>}
          </div>
        </aside>

        <section className="rideos-geofence-canvas-wrap">
          <svg
            ref={svgRef}
            className="rideos-geofence-canvas"
            viewBox="0 0 720 420"
            onClick={handleSvgClick}
          >
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(0,154,122,0.12)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="720" height="420" fill="#f3faf7" />
            <rect width="720" height="420" fill="url(#grid)" />
            <text x="16" y="28" fill="#8f959e" fontSize="12">演示画布（县域底图坐标系可替换为真实 Geo）</text>
            {fences.map((fence) => {
              if (fence.type === "HUB") {
                const [hx, hy] = fence.geometry.center;
                const r = Math.max(12, (fence.geometry.radiusM || 80) / 5);
                return (
                  <g key={fence.id}>
                    <circle
                      cx={hx}
                      cy={hy}
                      r={r}
                      fill={selectedId === fence.id ? "rgba(0,154,122,0.25)" : "rgba(255,165,30,0.2)"}
                      stroke={selectedId === fence.id ? "#009A7A" : "#FFA51E"}
                      strokeWidth="2"
                    />
                    <circle cx={hx} cy={hy} r="3" fill="#009A7A" />
                  </g>
                );
              }
              const ring = fence.geometry?.coordinates?.[0] || [];
              return (
                <polygon
                  key={fence.id}
                  points={toSvgPoints(ring)}
                  fill={fence.type === "FORBIDDEN" ? "rgba(254,80,66,0.18)" : "rgba(0,154,122,0.18)"}
                  stroke={selectedId === fence.id ? "#067a57" : fence.type === "FORBIDDEN" ? "#FE5042" : "#009A7A"}
                  strokeWidth={selectedId === fence.id ? 2.5 : 1.5}
                />
              );
            })}
            {draft.length > 0 && (
              <>
                <polyline
                  points={toSvgPoints(draft)}
                  fill="none"
                  stroke="#009A7A"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                {draft.map((point, index) => (
                  <circle key={`${point[0]}-${index}`} cx={point[0]} cy={point[1]} r="4" fill="#009A7A" />
                ))}
              </>
            )}
          </svg>
        </section>

        <aside className="rideos-geofence-props">
          <h4>属性</h4>
          {selected ? (
            <div className="body">
              <FormField label="名称" required>
                <Input value={selected.name} onChange={(next) => updateSelected({ name: next })} />
              </FormField>
              <FormField label="类型" required>
                <Select
                  value={selected.type}
                  options={[
                    { label: "服务区", value: "SERVICE" },
                    { label: "禁停区", value: "FORBIDDEN" },
                    { label: "接驳点", value: "HUB" },
                  ]}
                  onChange={(next) => {
                    if (next != null) updateSelected({ type: next as GeoFenceType });
                  }}
                />
              </FormField>
              <FormField label="县域">
                <Input value={selected.regionId || regionLabel} readOnly />
              </FormField>
              <FormField label="启用">
                <Select
                  value={selected.enabled ? "1" : "0"}
                  options={[
                    { label: "启用", value: "1" },
                    { label: "停用", value: "0" },
                  ]}
                  onChange={(next) => updateSelected({ enabled: next === "1" })}
                />
              </FormField>
              {selected.type === "HUB" && (
                <FormField label="半径(米)">
                  <InputNumber
                    value={selected.geometry.radiusM ?? null}
                    min={0}
                    step={50}
                    onChange={(next) =>
                      updateSelected({
                        geometry: { ...selected.geometry, radiusM: next ?? 0 },
                      })
                    }
                  />
                </FormField>
              )}
              <FormField label="备注">
                <Textarea
                  rows={3}
                  value={selected.remark || ""}
                  onChange={(next) => updateSelected({ remark: next })}
                />
              </FormField>
              <div className="rideos-geofence-props-actions">
                <Button variant="primary" onClick={saveSelected} disabled={!dirty && tool === "select"}>
                  保存属性
                </Button>
              </div>
            </div>
          ) : (
            <div className="body" style={{ color: "#8f959e", fontSize: 13 }}>选择或绘制围栏后编辑属性</div>
          )}
        </aside>
      </div>
    </div>
  );
}
