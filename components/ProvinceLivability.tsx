"use client";

import { useEffect, useState } from "react";
import { Building2, GraduationCap, Bus, TrainFront, Pill } from "lucide-react";

interface LivabilityResponse {
  verified: boolean;
  province?: string;
  city?: string;
  radiusKm?: number;
  counts?: {
    hospitals: number;
    schools: number;
    pharmacies: number;
    busStops: number;
    transitStations: number;
  };
  source?: string;
  fetchedAt?: string;
  reason?: string;
}

/**
 * Displays real OSM (OpenStreetMap) amenity/transit density near the
 * matched province's major city. Fetched client-side per province so
 * the main report doesn't wait on an external API that isn't
 * guaranteed fast or up (Overpass is free but best-effort).
 */
export function ProvinceLivability({ province }: { province: string }) {
  const [data, setData] = useState<LivabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    fetch(`/api/livability?province=${encodeURIComponent(province)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData({ verified: false, reason: "Could not reach the livability service." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [province]);

  if (loading) {
    return <p className="mt-2 text-xs text-slate-500">Checking local amenity density (OpenStreetMap)…</p>;
  }

  if (!data || !data.verified || !data.counts) {
    return (
      <p className="mt-2 text-xs text-amber-400/80">
        {data?.reason || "Live amenity data unavailable right now — this doesn't affect your score."}
      </p>
    );
  }

  const { counts, city, radiusKm } = data;

  return (
    <div className="mt-3 border-t border-slate-800 pt-3">
      <p className="mb-2 text-xs text-slate-500">
        Amenity density within {radiusKm}km of {city} centre (live OpenStreetMap data):
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-300">
        <span className="inline-flex items-center gap-1">
          <Building2 size={13} className="text-emerald-400" /> {counts.hospitals} hospitals
        </span>
        <span className="inline-flex items-center gap-1">
          <GraduationCap size={13} className="text-emerald-400" /> {counts.schools} schools
        </span>
        <span className="inline-flex items-center gap-1">
          <Pill size={13} className="text-emerald-400" /> {counts.pharmacies} pharmacies
        </span>
        <span className="inline-flex items-center gap-1">
          <Bus size={13} className="text-emerald-400" /> {counts.busStops} bus stops
        </span>
        <span className="inline-flex items-center gap-1">
          <TrainFront size={13} className="text-emerald-400" /> {counts.transitStations} transit stations
        </span>
      </div>
      <p className="mt-1.5 text-[11px] text-slate-600">
        Source: OpenStreetMap data via Geoapify — a density signal for the city centre, not the whole province.
      </p>
    </div>
  );
}