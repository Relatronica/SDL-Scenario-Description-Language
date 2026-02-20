/**
 * SDL Pulse — Eurostat Data Adapter
 *
 * Fetches time-series data from the Eurostat JSON Statistics API.
 * Handles multiple URL formats (databrowser, API, simplified) and
 * applies dataset-specific query parameters automatically.
 *
 * URL patterns handled:
 *   - https://ec.europa.eu/eurostat/databrowser/view/demo_frate
 *   - https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_frate
 *   - https://ec.europa.eu/eurostat/api/demo_frate (legacy/simplified)
 */

import type { DataAdapter, DataAdapterConfig, ObservedPoint } from '../types';

interface EurostatResponse {
  value: Record<string, number>;
  dimension: {
    time: { category: { index: Record<string, number> } };
  };
}

/**
 * Dataset-specific query parameters needed by the Eurostat API.
 * Without these the API may return a 400 (too many dimensions).
 */
const DATASET_PARAMS: Record<string, string> = {
  demo_frate:    'indic_de=TOTFERRT&freq=A',
  demo_pjan:     'age=TOTAL&sex=T&freq=A',
  demo_pjanind:  'indic_de=DEPRATIO1&freq=A',
  nrg_ind_ren:   'freq=A&unit=PC&nrg_bal=REN',
  env_air_gge:   'airpol=GHG&src_crf=TOTX4_MEMO&unit=MIO_T&freq=A',
  nrg_bal_c:     'freq=A&unit=KTOE&nrg_bal=NRGSUP',
  nrg_pc_204:    'freq=S&product=6000&consom=4161903&tax=I_TAX&currency=EUR',
  lfsi_emp_a:    'indic_em=EMP_LFS&age=Y20-64&sex=T&unit=PC_POP&freq=A',
  une_rt_a:      'age=Y_GE15&sex=T&unit=PC_ACT&freq=A',
  nama_10_gdp:   'na_item=B1GQ&unit=CP_MEUR&freq=A',
  isoc_ci_ifp_iu: 'indic_is=I_IUBK&unit=PC_IND&freq=A',
  isoc_cicce_use: 'indic_is=E_CC&sizen_r2=10_C10_S951_XK&unit=PC_ENT&freq=A',
  isoc_ci_in_h:   'indic_is=I_DSK_AB&unit=PC_IND&freq=A',
};

const GEO_ALIASES: Record<string, string> = {
  italy: 'IT', france: 'FR', germany: 'DE', spain: 'ES', poland: 'PL',
  eu27: 'EU27_2020', eu28: 'EU28', eu: 'EU27_2020',
};

function extractDatasetCode(url: string): string | null {
  const patterns = [
    /databrowser\/view\/(\w+)/,
    /\/data\/(\w+)/,
    /eurostat\/api\/(\w+)/,
    /eurostat.*?\/view\/(\w+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractGeo(url: string, defaultGeo: string = 'IT'): string {
  const qp = url.match(/[?&]geo=([A-Z0-9_]+)/i);
  if (qp) return GEO_ALIASES[qp[1].toLowerCase()] ?? qp[1].toUpperCase();

  const pathSeg = url.match(/(?:\/|%)([a-z]{2,5})(?:[/?#]|$)/i);
  if (pathSeg) {
    const lower = pathSeg[1].toLowerCase();
    if (GEO_ALIASES[lower]) return GEO_ALIASES[lower];
  }

  return defaultGeo;
}

export const EurostatAdapter: DataAdapter = {
  name: 'eurostat',

  canHandle(url: string): boolean {
    return url.includes('eurostat') || url.includes('ec.europa.eu');
  },

  async fetch(config: DataAdapterConfig): Promise<ObservedPoint[]> {
    const datasetCode = extractDatasetCode(config.sourceUrl);
    if (!datasetCode) return [];

    const geo = extractGeo(config.sourceUrl);
    const extraParams = DATASET_PARAMS[datasetCode] ?? 'freq=A';
    const apiUrl =
      `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${datasetCode}` +
      `?geo=${geo}&${extraParams}`;

    const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return [];

    const data: EurostatResponse = await resp.json();
    const timeIndex = data.dimension?.time?.category?.index;
    if (!timeIndex || !data.value) return [];

    const needsKtoeToMtoe =
      config.field?.toLowerCase().includes('mtoe') &&
      extraParams.includes('unit=KTOE');

    const points: ObservedPoint[] = [];
    for (const [yearStr, idx] of Object.entries(timeIndex)) {
      const val = data.value[String(idx)];
      if (val != null) {
        const year = parseInt(yearStr, 10);
        points.push({
          date: new Date(year, 0, 1),
          value: needsKtoeToMtoe ? val / 1000 : val,
          source: `Eurostat ${datasetCode}`,
        });
      }
    }

    return points.sort((a, b) => a.date.getTime() - b.date.getTime());
  },
};
