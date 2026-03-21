import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// API-Football league ID for Brasileirão Série A
const BRASILEIRAO_ID = 71;

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
  };
  league: {
    name: string;
    round: string;
  };
  teams: {
    home: { name: string };
    away: { name: string };
  };
}

function mapStatus(apiStatus: string): "scheduled" | "live" | "finished" {
  const liveStatuses = ["1H", "HT", "2H", "ET", "P", "LIVE"];
  const finishedStatuses = ["FT", "AET", "PEN"];
  if (liveStatuses.includes(apiStatus)) return "live";
  if (finishedStatuses.includes(apiStatus)) return "finished";
  return "scheduled";
}

export async function POST() {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API_FOOTBALL_KEY not configured. Set it in .env to sync matches from api-football.com" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const season = new Date().getFullYear();

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${BRASILEIRAO_ID}&season=${season}&next=30`,
      {
        headers: { "x-apisports-key": apiKey },
      }
    );

    const json = await res.json();
    const fixtures: ApiFixture[] = json.response ?? [];

    let upserted = 0;

    for (const f of fixtures) {
      const title = `${f.teams.home.name} vs ${f.teams.away.name}`;
      const externalId = `apifootball:${f.fixture.id}`;

      const { error } = await supabase.from("events").upsert(
        {
          sport: "football",
          league: `Brasileirão 2026 - ${f.league.round}`,
          title,
          home_team: f.teams.home.name,
          away_team: f.teams.away.name,
          start_time: f.fixture.date,
          status: mapStatus(f.fixture.status.short),
          external_id: externalId,
        },
        { onConflict: "external_id" }
      );

      if (!error) upserted++;
    }

    return NextResponse.json({
      message: `Synced ${upserted} matches from API-Football`,
      total: fixtures.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to sync: ${err.message}` },
      { status: 500 }
    );
  }
}
