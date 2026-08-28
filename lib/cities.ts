// City-center coordinates used as the query point for OSM livability
// signals. One representative major city per province — this is a
// proxy for the province, not the whole province's geography, so
// treat results as "what the biggest hub looks like," not a
// province-wide average.
//
// Scoped to exactly the provinces that appear in lib/provinces.ts —
// extend both files together.

export interface CityCoord {
  city: string;
  lat: number;
  lon: number;
}

export const PROVINCE_CITY: Record<string, CityCoord> = {
  'Ontario': { city: 'Toronto', lat: 43.6532, lon: -79.3832 },
  'British Columbia': { city: 'Vancouver', lat: 49.2827, lon: -123.1207 },
  'Alberta': { city: 'Calgary', lat: 51.0447, lon: -114.0719 },
  'Saskatchewan': { city: 'Saskatoon', lat: 52.1332, lon: -106.6700 },
  'Nova Scotia': { city: 'Halifax', lat: 44.6488, lon: -63.5752 },
};