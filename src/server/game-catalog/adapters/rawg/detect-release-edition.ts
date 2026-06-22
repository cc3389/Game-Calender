import type { ReleaseEdition } from "@/entities/game/release-edition";
import type { RawgGame } from "./rawg.schema";

const EA_TAG_SLUGS = new Set(["early-access", "rannii-dostup"]);

const EA_NAME_RE =
  /early\s*access|抢先体验|搶先體驗|早期访问|預覽版|preview\b/i;

export function detectReleaseEditionFromRawg(game: RawgGame): ReleaseEdition {
  const tags = game.tags ?? [];
  if (tags.some((t) => EA_TAG_SLUGS.has(t.slug))) {
    return "early_access";
  }
  if (EA_NAME_RE.test(game.name)) {
    return "early_access";
  }
  return "full";
}
