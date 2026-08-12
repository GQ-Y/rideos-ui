import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx";

export interface ImageProps {
  /** 图片地址 */
  src: string;
  /** 替代文本 */
  alt?: string;
  width?: number | string;
  height?: number | string;
  /** 填充方式(object-fit),默认 cover */
  fit?: CSSProperties["objectFit"];
  /** 点击打开全屏预览,默认 true */
  preview?: boolean;
  /** 加载失败时的占位内容(默认内置破图占位) */
  fallback?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function BrokenIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
      <path d="M21 5v11.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2Zm-3 6.42 3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-2.58l3 2.99 4-4 4 4 4-3.99ZM8.5 6.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M18.3 5.7a1 1 0 0 0-1.4-1.4L12 9.17 7.1 4.3a1 1 0 0 0-1.4 1.4L10.83 12 5.7 16.9a1 1 0 1 0 1.4 1.4L12 14.83l4.9 4.87a1 1 0 0 0 1.4-1.4L13.17 12l5.13-4.9Z" />
    </svg>
  );
}

/**
 * 图片:统一填充方式与失败占位,支持点击全屏预览(遮罩 portal 到 body,Esc / 点击遮罩关闭)
 */
export function Image({
  src,
  alt,
  width,
  height,
  fit = "cover",
  preview = true,
  fallback,
  className,
  style,
}: ImageProps) {
  /* 记录加载失败的 src:src 变化后自然回到未失败态,无需 effect 重置 */
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const failed = failedSrc === src;

  useEffect(() => {
    if (!previewOpen) return;
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setPreviewOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [previewOpen]);

  const clickable = preview && !failed;

  return (
    <span
      className={cx("rideos-image", clickable && "is-clickable", className)}
      style={{ width, height, ...style }}
    >
      {failed ? (
        <span className="rideos-image-fallback" role="img" aria-label={alt ?? "图片加载失败"}>
          {fallback ?? <BrokenIcon />}
        </span>
      ) : (
        <img
          className="rideos-image-img"
          src={src}
          alt={alt}
          style={{ objectFit: fit }}
          onError={() => setFailedSrc(src)}
          onClick={clickable ? () => setPreviewOpen(true) : undefined}
        />
      )}
      {previewOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="rideos-image-preview"
              role="dialog"
              aria-modal="true"
              aria-label={alt ?? "图片预览"}
              onClick={() => setPreviewOpen(false)}
            >
              <img
                className="rideos-image-preview-img"
                src={src}
                alt={alt}
                onClick={(event) => event.stopPropagation()}
              />
              <button
                type="button"
                className="rideos-image-preview-close"
                aria-label="关闭预览"
                onClick={() => setPreviewOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
