import { NextResponse } from "next/server";
import { getGameCatalogPort } from "@/server/game-catalog/factory";
import { GameCatalogConfigError } from "@/server/game-catalog/errors";

function parsePlatformIds(platformsParam: string | null): number[] | undefined {
  if (!platformsParam) return undefined;
  const ids = platformsParam
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
  return ids.length > 0 ? ids : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const platformIds = parsePlatformIds(searchParams.get("platforms"));

  if (q.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters." },
      { status: 400 },
    );
  }

  try {
    const port = getGameCatalogPort();
    const games = await port.searchGames({ query: q, platformIds, limit: 20 });
    return NextResponse.json({
      query: q,
      provider: port.providerId,
      games,
    });
  } catch (err) {
    if (err instanceof GameCatalogConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to search games";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
