import { NextResponse } from "next/server";
import { getGameCatalogPort } from "@/server/game-catalog/factory";
import { GameCatalogConfigError } from "@/server/game-catalog/errors";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const platformsParam = searchParams.get("platforms");

  if (!month || !MONTH_RE.test(month)) {
    return NextResponse.json(
      { error: "Invalid or missing month. Use YYYY-MM." },
      { status: 400 },
    );
  }

  const platformIds = platformsParam
    ? platformsParam
        .split(",")
        .map((s) => Number.parseInt(s.trim(), 10))
        .filter((n) => !Number.isNaN(n))
    : undefined;

  try {
    const port = getGameCatalogPort();
    const games = await port.listReleasesByMonth({ month, platformIds });
    return NextResponse.json({
      month,
      provider: port.providerId,
      games,
    });
  } catch (err) {
    if (err instanceof GameCatalogConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to load game releases";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
