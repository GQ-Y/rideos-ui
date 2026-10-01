import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
  FileOutlined,
  InboxOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { cx } from "../../utils/cx";
import { Button } from "../Button";
import { Progress } from "../Progress";

export type UploadStatus = "uploading" | "done" | "error";

export interface UploadFile {
  uid: string;
  name: string;
  size?: number;
  status: UploadStatus;
  /** 0-100 */
  percent?: number;
  /** 失败原因 */
  message?: string;
  /** 原始文件对象 */
  raw?: File;
}

export interface UploadRequestOptions {
  file: File;
  onProgress: (percent: number) => void;
  onSuccess: () => void;
  onError: (message?: string) => void;
}

export interface UploadProps {
  /** 受控文件列表 */
  fileList?: UploadFile[];
  defaultFileList?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  /** 自定义上传实现;缺省直接标记完成(演示/本地场景) */
  customRequest?: (options: UploadRequestOptions) => void;
  /** 选择前钩子:返回 false 跳过该文件 */
  beforeUpload?: (file: File) => boolean;
  onRemove?: (file: UploadFile) => void;
  accept?: string;
  multiple?: boolean;
  /** 最大文件数,超出忽略 */
  maxCount?: number;
  disabled?: boolean;
  /** 拖拽上传区样式 */
  drag?: boolean;
  /** 触发器内容(非 drag 模式),默认按钮 */
  children?: ReactNode;
  className?: string;
}

let uidSeed = 0;
const nextUid = () => `upload-${Date.now()}-${(uidSeed += 1)}`;

function formatSize(size?: number) {
  if (size == null) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * 上传:按钮/拖拽两种触发,文件列表带进度与状态
 * 通过 customRequest 对接任意上传接口(onProgress/onSuccess/onError)。
 */
export function Upload({
  fileList: fileListProp,
  defaultFileList = [],
  onChange,
  customRequest,
  beforeUpload,
  onRemove,
  accept,
  multiple = false,
  maxCount,
  disabled = false,
  drag = false,
  children,
  className,
}: UploadProps) {
  const [innerList, setInnerList] = useState<UploadFile[]>(defaultFileList);
  const fileList = fileListProp ?? innerList;
  const listRef = useRef(fileList);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    listRef.current = fileList;
  }, [fileList]);

  function update(next: UploadFile[]) {
    /* 同步 ref,保证同一事件内连续 update(如添加后立刻收到进度)基于最新列表 */
    listRef.current = next;
    if (fileListProp === undefined) setInnerList(next);
    onChange?.(next);
  }

  function patchFile(uid: string, patch: Partial<UploadFile>) {
    update(listRef.current.map((item) => (item.uid === uid ? { ...item, ...patch } : item)));
  }

  function startUpload(raw: File) {
    const item: UploadFile = {
      uid: nextUid(),
      name: raw.name,
      size: raw.size,
      status: "uploading",
      percent: 0,
      raw,
    };
    update([...listRef.current, item]);
    if (customRequest) {
      customRequest({
        file: raw,
        onProgress: (percent) => patchFile(item.uid, { percent, status: "uploading" }),
        onSuccess: () => patchFile(item.uid, { status: "done", percent: 100 }),
        onError: (msg) => patchFile(item.uid, { status: "error", message: msg }),
      });
    } else {
      patchFile(item.uid, { status: "done", percent: 100 });
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || disabled) return;
    const incoming = [...files];
    for (const raw of incoming) {
      if (maxCount != null && listRef.current.length >= maxCount) break;
      if (beforeUpload && beforeUpload(raw) === false) continue;
      startUpload(raw);
    }
  }

  function remove(file: UploadFile) {
    if (disabled || file.status === "uploading") return;
    update(listRef.current.filter((item) => item.uid !== file.uid));
    onRemove?.(file);
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      className="rideos-upload-input"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      onChange={(event) => {
        handleFiles(event.target.files);
        event.target.value = "";
      }}
    />
  );

  return (
    <div className={cx("rideos-upload", disabled && "is-disabled", className)}>
      {drag ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          className={cx("rideos-upload-drag", dragOver && "is-over")}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            handleFiles(event.dataTransfer.files);
          }}
        >
          {input}
          <InboxOutlined className="rideos-upload-drag-icon" aria-hidden="true" />
          <p className="rideos-upload-drag-text">点击或拖拽文件到此区域上传</p>
          <p className="rideos-upload-drag-hint">
            {accept ? `支持 ${accept}` : "支持任意格式"}
            {maxCount ? ` · 最多 ${maxCount} 个` : ""}
          </p>
        </div>
      ) : (
        <span className="rideos-upload-trigger" onClick={() => inputRef.current?.click()}>
          {input}
          {children ?? (
            <Button disabled={disabled}>
              <UploadOutlined /> 选择文件
            </Button>
          )}
        </span>
      )}

      {fileList.length > 0 && (
        <div className="rideos-upload-list">
          {fileList.map((file) => (
            <div key={file.uid} className={cx("rideos-upload-item", `status-${file.status}`)}>
              <FileOutlined className="rideos-upload-item-icon" aria-hidden="true" />
              <div className="rideos-upload-item-main">
                <div className="rideos-upload-item-row">
                  <span className="rideos-upload-item-name">{file.name}</span>
                  <span className="rideos-upload-item-meta">
                    {file.status === "done" && <CheckCircleFilled className="is-done" />}
                    {file.status === "error" && <CloseCircleFilled className="is-error" />}
                    <span>{formatSize(file.size)}</span>
                  </span>
                </div>
                {file.status === "uploading" && (
                  <Progress percent={file.percent ?? 0} strokeWidth={4} showInfo={false} />
                )}
                {file.status === "error" && file.message && (
                  <small className="rideos-upload-item-error">{file.message}</small>
                )}
              </div>
              <button
                type="button"
                className="rideos-upload-item-remove"
                aria-label={`删除 ${file.name}`}
                disabled={disabled || file.status === "uploading"}
                onClick={() => remove(file)}
              >
                <DeleteOutlined />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
