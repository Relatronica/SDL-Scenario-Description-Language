/**
 * SDL Pulse — World Bank Data Adapter
 *
 * Fetches time-series data from the World Bank Indicators API v2.
 * Free, no API key required, excellent global coverage.
 *
 * URL patterns handled:
 *   - https://data.worldbank.org/indicator/SP.DYN.TFRT.IN
 *   - https://api.worldbank.org/v2/country/ITA/indicator/SP.DYN.TFRT.IN
 */

import type { DataAdapter, DataAdapterConfig, ObservedPoint } from '../types';

interface WBDataEntry {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  date: string;
  value: number | null;
}

const INDICATOR_RE = /indicator\/([A-Z0-9._]+)/i;

const GEO_TO_WB: Record<string, string> = {
  IT: 'ITA', DE: 'DEU', FR: 'FRA', ES: 'ESP', PL: 'POL',
  EU: 'EUU', EU27: 'EUU', SSF: 'SSF', WLD: 'WLD',
};

function extractIndicator(url: string): string | null {
  const m = url.match(INDICATOR_RE);
  return m ? m[1] : null;
}

function extractCountry(url: string, fallback: string = 'ITA'): string {
  const countryInPath = url.match(/country\/([A-Z]{2,3})\//i);
  if (countryInPath) return countryInPath[1];

  const geo = url.match(/[?&]geo=([A-Z0-9_]+)/i);
  if (geo) return GEO_TO_WB[geo[1].toUpperCase()] ?? geo[1];

  return fallback;
}

export const WorldBankAdapter: DataAdapter = {
  name: 'worldbank',

  canHandle(url: string): boolean {
    return (
      url.includes('worldbank.org') ||
      url.includes('data.worldbank.org')
    );
  },

  async fetch(config: DataAdapterConfig): Promise<ObservedPoint[]> {
    const indicator = extractIndicator(config.sourceUrl);
    if (!indicator) return [];

    const country = extractCountry(config.sourceUrl);
    const apiUrl =
      `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}` +
      `?format=json&per_page=100&date=2000:2025`;

    const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return [];

    const json = await resp.json();
    if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
      return [];
    }

    const entries: WBDataEntry[] = json[1];
    const points: ObservedPoint[] = [];

    for (const entry of entries) {
      if (entry.value == null) continue;
      const year = parseInt(entry.date, 10);
      if (isNaN(year)) continue;

      points.push({
        date: new Date(year, 0, 1),
        value: entry.value,
        source: `World Bank ${indicator}`,
      });
    }

    return points.sort((a, b) => a.date.getTime() - b.date.getTime());
  },
};
