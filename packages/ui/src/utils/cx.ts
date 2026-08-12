export type ClassValue = string | number | null | undefined | false | ClassValue[];

/** 合并 className,过滤假值,支持嵌套数组 */
export function cx(...parts: ClassValue[]): string {
  const out: string[] = [];
  const walk = (value: ClassValue) => {
    if (!value && value !== 0) return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    out.push(String(value));
  };
  parts.forEach(walk);
  return out.join(" ");
}
