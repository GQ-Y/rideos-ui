import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { RideosTheme } from "../../utils/theme";

export interface RideosConfig {
  /** 主题:作用于本 Provider 包裹的子树(data-rideos-theme) */
  theme?: RideosTheme;
  /** 组件缺省文案(空状态等) */
  locale?: {
    emptyText?: ReactNode;
  };
}

const ConfigContext = createContext<RideosConfig>({});

/** 读取全局配置(组件内部/业务侧均可使用) */
export function useConfig(): RideosConfig {
  return useContext(ConfigContext);
}

export interface ConfigProviderProps extends RideosConfig {
  children?: ReactNode;
}

/**
 * 全局配置:主题子树切换与缺省文案
 * 全局主题切换也可直接用 setRideosTheme(作用于 html)。
 */
export function ConfigProvider({ theme, locale, children }: ConfigProviderProps) {
  const parent = useConfig();
  const value = useMemo<RideosConfig>(
    () => ({
      theme: theme ?? parent.theme,
      locale: { ...parent.locale, ...locale },
    }),
    [theme, locale, parent],
  );

  const content = <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;

  if (theme) {
    return <div data-rideos-theme={theme === "green" ? undefined : theme}>{content}</div>;
  }
  return content;
}
