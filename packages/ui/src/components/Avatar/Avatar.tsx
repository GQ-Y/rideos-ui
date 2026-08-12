import type { ReactNode } from "react";
import { UserOutlined } from "@ant-design/icons";
import { cx } from "../../utils/cx";

export interface AvatarProps {
  /** 图片地址 */
  src?: string;
  /** 文字头像(取前两个字符) */
  text?: string;
  /** 自定义图标/内容 */
  icon?: ReactNode;
  /** 尺寸(px),默认 32 */
  size?: number;
  /** 形状,默认圆形 */
  shape?: "circle" | "square";
  alt?: string;
  className?: string;
}

/**
 * 头像:图片 / 文字 / 图标三种形态
 */
export function Avatar({
  src,
  text,
  icon,
  size = 32,
  shape = "circle",
  alt,
  className,
}: AvatarProps) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };
  return (
    <span className={cx("rideos-avatar", `shape-${shape}`, className)} style={style}>
      {src ? (
        <img src={src} alt={alt ?? "头像"} />
      ) : text ? (
        <span className="rideos-avatar-text">{text.slice(0, 2)}</span>
      ) : (
        (icon ?? <UserOutlined />)
      )}
    </span>
  );
}
