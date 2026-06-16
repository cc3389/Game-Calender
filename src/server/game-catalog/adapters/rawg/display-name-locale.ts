const CJK_RE = /[\u4e00-\u9fff]/;

export function containsCjk(text: string): boolean {
  return CJK_RE.test(text);
}

/** RAWG 部分条目为 "English / 日本語 / 中文" 形式 */
export function pickChineseFromSlashName(raw: string): string {
  if (!containsCjk(raw)) return raw;
  const parts = raw.split("/").map((p) => p.trim());
  const cjkPart = parts.find((p) => containsCjk(p));
  return cjkPart ?? raw;
}

export function shouldLocalizeNamesToZh(): boolean {
  const raw = process.env.GAME_NAME_LOCALE?.toLowerCase();
  if (raw === "en") return false;
  return true;
}
