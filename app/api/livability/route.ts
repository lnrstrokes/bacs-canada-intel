import { NextRequest, NextResponse } from 'next/server';
import { PROVINCE_CITY } from '@/lib/cities';

// ─────────────────────────────────────────────────────────────
//  LIVABILITY SIGNAL — real OSM-sourced data via Geoapify Places API
//
//  Switched from raw unauthenticated Overpass to Geoapify: same
//  underlying OpenStreetMap data, but authenticated, documented,
//  and far more predictable to code against without a way to
//  test-run this before deploy.
//
//  Requires GEOAPIFY_API_KEY as a Vercel environment variable —
//  never hardcode the key here. Free tier: 3,000 credits/day.
//  Sign up: https://www.geoapify.com/
//
//  Category strings follow Geoapify's documented "domain.subtype"
//  pattern. If counts look consistently wrong after deploying,
//  spot-check the exact category names against Geoapify's Places
//  API Playground (apidocs.geoapify.com/playground/places) — an
//  unrecognized category silently returns zero results rather than
//  an error, which would look identical to real data.
//
//  Counts are a proxy for amenity DENSITY near the city center —
//  not a full livability score. Radius is fixed at 8km, which
//  covers a city's core but not its full metro area.
// ─────────────────────────────────────────────────────────────

const GEOAPIFY_URL = 'https://api.geoapify.com/v2/places';
const RADIUS_M = 8000;
const TIMEOUT_MS = 12000;

const CATEGORIES = [
  { key: 'hospitals', category: 'healthcare.hospital' },
  { key: 'schools', category: 'education.school' },
  { key: 'pharmacies', category: 'healthcare.pharmacy' },
  { key: 'busStops', category: 'public_transport.bus' },
  { key: 'transitStations', category: 'public_transport.train' },
] as const;

async function countCategory(category: string, lat: number, lon: number, apiKey: string, signal: AbortSignal): Promise<number> {
  const url = `${GEOAPIFY_URL}?categories=${encodeURIComponent(category)}&filter=circle:${lon},${lat},${RADIUS_M}&limit=100&apiKey=${apiKey}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geoapify category "${category}" returned status ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.features) ? data.features.length : 0;
}

export async function GET(req: NextRequest) {
  const province = req.nextUrl.searchParams.get('province') || '';
  const coord = PROVINCE_CITY[province];
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!coord) {
    return NextResponse.json(
      { verified: false, reason: `No city coordinate on file for "${province}" yet.` },
      { status: 200 },
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { verified: false, reason: 'Livability data isn\'t configured yet — GEOAPIFY_API_KEY is missing from the server environment.' },
      { status: 200 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const results = await Promise.all(
      CATEGORIES.map((c) => countCategory(c.category, coord.lat, coord.lon, apiKey, controller.signal)),
    );
    clearTimeout(timeout);

    const counts: Record<string, number> = {};
    CATEGORIES.forEach((c, i) => {
      counts[c.key] = results[i];
    });

    return NextResponse.json({
      verified: true,
      province,
      city: coord.city,
      radiusKm: RADIUS_M / 1000,
      counts,
      source: 'Geoapify Places API (OpenStreetMap data)',
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    clearTimeout(timeout);
    return NextResponse.json(
      { verified: false, reason: 'Live amenity data is temporarily unavailable. This does not affect your readiness score or CRS estimate — only this supplementary livability signal.' },
      { status: 200 },
    );
  }
}