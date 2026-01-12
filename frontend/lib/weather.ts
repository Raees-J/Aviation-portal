/**
 * Weather utilities for fetching METAR data
 * FASH = Stellenbosch Aerodrome (ICAO Code)
 */

export interface MetarData {
  raw: string;
  station: string;
  time: string;
  wind: {
    direction: number;
    speed: number;
    unit: string;
  };
  visibility: string;
  clouds: string;
  temperature: number;
  dewpoint: number;
  altimeter: number;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
}

/**
 * Fetches METAR data for Stellenbosch (FASH)
 * In production, replace with actual API call (e.g., CheckWX, aviationweather.gov)
 */
export async function fetchMetar(icaoCode: string = 'FASH'): Promise<MetarData> {
  // TODO: Replace with real API call
  // Example: const response = await fetch(`https://api.checkwx.com/metar/${icaoCode}/decoded`, { headers: { 'X-API-Key': process.env.CHECKWX_API_KEY } });
  
  // Mock data for development
  return {
    raw: `${icaoCode} 101200Z 18008KT CAVOK 24/16 Q1013`,
    station: icaoCode,
    time: new Date().toISOString(),
    wind: {
      direction: 180,
      speed: 8,
      unit: 'KT'
    },
    visibility: 'CAVOK',
    clouds: 'CLR',
    temperature: 24,
    dewpoint: 16,
    altimeter: 1013,
    flightCategory: 'VFR'
  };
}

/**
 * Parses a raw METAR string into components
 */
export function parseMetarString(raw: string): Partial<MetarData> {
  const parts = raw.split(' ');
  return {
    raw,
    station: parts[0],
    time: parts[1],
  };
}

/**
 * Determines flight category based on visibility and ceiling
 */
export function getFlightCategory(visibility: number, ceiling: number): MetarData['flightCategory'] {
  if (visibility < 1 || ceiling < 500) return 'LIFR';
  if (visibility < 3 || ceiling < 1000) return 'IFR';
  if (visibility < 5 || ceiling < 3000) return 'MVFR';
  return 'VFR';
}
