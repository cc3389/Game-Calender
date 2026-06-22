/** 日历条目的发售阶段（与数据源标签映射后的领域概念） */
export type ReleaseEdition = "full" | "early_access";

export function releaseEditionLabel(edition: ReleaseEdition): string {
  return edition === "early_access" ? "抢先体验" : "正式版";
}
