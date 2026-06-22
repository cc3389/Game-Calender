import { NextResponse } from "next/server";
import { getGameCatalogPort } from "@/server/game-catalog/factory";
import { GameCatalogConfigError } from "@/server/game-catalog/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid game id" }, { status: 400 });
  }

  try {
    const port = getGameCatalogPort();
    const [detail, game] = await Promise.all([
      port.getGameDetail(id),
      port.getGameListItem(id),
    ]);
    return NextResponse.json({ provider: port.providerId, detail, game });
  } catch (err) {
    if (err instanceof GameCatalogConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to load game detail";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
