import {
  containsCjk,
  pickChineseFromSlashName,
} from "./display-name-locale";
import { searchSteamStore } from "./steam-store-search";

/**
 * 在 RAWG 英文名基础上解析中文展示名：
 * 1. 名称内嵌中文（斜杠分段）
 * 2. Steam 商店搜索：简中与英文首条结果 appId 一致且简中名含汉字
 */
export async function resolveChineseDisplayName(
  rawName: string,
): Promise<{ displayName: string; nameOriginal?: string }> {
  const fromSlash = pickChineseFromSlashName(rawName);
  if (containsCjk(fromSlash) && fromSlash !== rawName.trim()) {
    return { displayName: fromSlash, nameOriginal: rawName.trim() };
  }
  if (containsCjk(fromSlash)) {
    return { displayName: fromSlash };
  }

  const query = rawName.trim();
  if (!query) return { displayName: rawName };

  try {
    const [cnHits, enHits] = await Promise.all([
      searchSteamStore(query, "schinese"),
      searchSteamStore(query, "english"),
    ]);
    const cnTop = cnHits.find((h) => h.type === "app");
    const enTop = enHits.find((h) => h.type === "app");
    if (
      cnTop &&
      enTop &&
      cnTop.id === enTop.id &&
      containsCjk(cnTop.name)
    ) {
      return {
        displayName: cnTop.name,
        nameOriginal: enTop.name,
      };
    }
  } catch {
    /* 忽略 Steam 查询失败，保留 RAWG 名称 */
  }

  return { displayName: rawName };
}

const BATCH_SIZE = 5;

export async function applyChineseDisplayNames<
  T extends { name: string; nameOriginal?: string },
>(items: T[]): Promise<T[]> {
  const result: T[] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const localized = await Promise.all(
      batch.map(async (item) => {
        if (containsCjk(item.name)) return item;
        const { displayName, nameOriginal } =
          await resolveChineseDisplayName(item.name);
        if (displayName === item.name && !nameOriginal) return item;
        return {
          ...item,
          name: displayName,
          nameOriginal: nameOriginal ?? item.name,
        };
      }),
    );
    result.push(...localized);
  }
  return result;
}
