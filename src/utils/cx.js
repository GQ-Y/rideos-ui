/** 合并 className，过滤假值 */
export function cx(...parts) {
  return parts.flat().filter(Boolean).join(" ");
}
