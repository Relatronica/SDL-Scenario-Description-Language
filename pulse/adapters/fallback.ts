/**
 * SDL Pulse — Fallback Data Adapter
 *
 * Provides bundled historical data for known URL patterns when
 * live API calls are unavailable or no dedicated adapter exists.
 *
 * All values are sourced from publicly available reports:
 *   - EU ETS prices: EMBER / ICAP annual reports
 *   - IRENA renewable capacity: IRENA Renewable Capacity Statistics
 *   - ISPRA/EEA GHG: ISPRA National Inventory Report & EEA
 *   - ACEA EV share: ACEA Electric Vehicles report
 *   - FDA approvals: FDA CDER annual NME/BLA counts
 *   - Pharma R&D: EFPIA/Evaluate Pharma
 *   - Data-center energy: IEA Data Centres & Networks report
 *   - Mediterranean climate: Copernicus/ERA5 reanalysis summaries
 *   - CCTV density: Comparitech / SurfShark CCTV reports
 *   - EDPB enforcement: EDPB annual activity reports
 *   - WHO genomic surveillance: GISAID/WHO reports
 *   - AMR mortality: Lancet 2022 Global Burden of AMR
 *   - IHR compliance: WHO SPAR/JEE databases
 */

import type { DataAdapter, DataAdapterConfig, ObservedPoint } from '../types';

interface FallbackEntry {
  urlPattern: RegExp;
  source: string;
  data: Array<{ year: number; value: number; provisional?: boolean }>;
}

const FALLBACK_DATA: FallbackEntry[] = [

  // ── ENERGY ──

  {
    urlPattern: /carbon-pricing|eu-ets|eu_ets/i,
    source: 'EU ETS (EMBER/ICAP)',
    data: [
      { year: 2012, value: 7 },  { year: 2013, value: 4 },
      { year: 2014, value: 6 },  { year: 2015, value: 8 },
      { year: 2016, value: 5 },  { year: 2017, value: 6 },
      { year: 2018, value: 16 }, { year: 2019, value: 25 },
      { year: 2020, value: 25 }, { year: 2021, value: 53 },
      { year: 2022, value: 81 }, { year: 2023, value: 85 },
      { year: 2024, value: 68, provisional: true },
      { year: 2025, value: 72, provisional: true },
    ],
  },
  {
    urlPattern: /irena.*capacity.*italy|nrg_ind_ren.*italy/i,
    source: 'IRENA / Eurostat (Renewable share IT)',
    data: [
      { year: 2010, value: 13.0 }, { year: 2011, value: 12.9 },
      { year: 2012, value: 15.4 }, { year: 2013, value: 16.7 },
      { year: 2014, value: 17.1 }, { year: 2015, value: 17.5 },
      { year: 2016, value: 17.4 }, { year: 2017, value: 18.3 },
      { year: 2018, value: 17.8 }, { year: 2019, value: 18.2 },
      { year: 2020, value: 20.4 }, { year: 2021, value: 19.0 },
      { year: 2022, value: 19.1 }, { year: 2023, value: 20.8, provisional: true },
    ],
  },
  {
    urlPattern: /eea.*ghg.*italy|eea.*unfccc|ispra/i,
    source: 'ISPRA/EEA (GHG Italy)',
    data: [
      { year: 2010, value: 417 }, { year: 2011, value: 405 },
      { year: 2012, value: 383 }, { year: 2013, value: 360 },
      { year: 2014, value: 344 }, { year: 2015, value: 348 },
      { year: 2016, value: 339 }, { year: 2017, value: 339 },
      { year: 2018, value: 335 }, { year: 2019, value: 328 },
      { year: 2020, value: 286 }, { year: 2021, value: 315 },
      { year: 2022, value: 316 }, { year: 2023, value: 306, provisional: true },
    ],
  },
  {
    urlPattern: /datacenter-energy|data-centres.*energy|iea.*data.cent/i,
    source: 'IEA Data Centres & Networks',
    data: [
      { year: 2018, value: 210 }, { year: 2019, value: 220 },
      { year: 2020, value: 240 }, { year: 2021, value: 260 },
      { year: 2022, value: 340 }, { year: 2023, value: 415 },
      { year: 2024, value: 510, provisional: true },
      { year: 2025, value: 650, provisional: true },
    ],
  },
  {
    urlPattern: /pue|power.usage.effectiveness/i,
    source: 'Uptime Institute PUE Survey',
    data: [
      { year: 2016, value: 1.58 }, { year: 2017, value: 1.58 },
      { year: 2018, value: 1.58 }, { year: 2019, value: 1.67 },
      { year: 2020, value: 1.58 }, { year: 2021, value: 1.57 },
      { year: 2022, value: 1.55 }, { year: 2023, value: 1.58 },
    ],
  },
  {
    urlPattern: /carbon.intensity|ember.*gco2/i,
    source: 'Ember Global Electricity Review',
    data: [
      { year: 2016, value: 491 }, { year: 2017, value: 489 },
      { year: 2018, value: 484 }, { year: 2019, value: 475 },
      { year: 2020, value: 459 }, { year: 2021, value: 463 },
      { year: 2022, value: 461 }, { year: 2023, value: 455 },
      { year: 2024, value: 440, provisional: true },
    ],
  },

  // ── TRANSPORT ──

  {
    urlPattern: /ev-share|electric.vehicle.*registrat|acea.*ev/i,
    source: 'ACEA (EV share EU)',
    data: [
      { year: 2017, value: 1.5 }, { year: 2018, value: 2.0 },
      { year: 2019, value: 3.0 }, { year: 2020, value: 10.5 },
      { year: 2021, value: 17.8 }, { year: 2022, value: 21.6 },
      { year: 2023, value: 23.0 }, { year: 2024, value: 24.3, provisional: true },
    ],
  },
  {
    urlPattern: /eurobarometer.*trust.*autonomous|autonomous.*driving.*trust/i,
    source: 'Eurobarometer Special surveys',
    data: [
      { year: 2017, value: 0.41 }, { year: 2019, value: 0.47 },
      { year: 2021, value: 0.44 }, { year: 2023, value: 0.48 },
    ],
  },

  // ── HEALTH ──

  {
    urlPattern: /fda.*approv|fda.*novel/i,
    source: 'FDA CDER (Novel Drug Approvals)',
    data: [
      { year: 2016, value: 22 }, { year: 2017, value: 46 },
      { year: 2018, value: 59 }, { year: 2019, value: 48 },
      { year: 2020, value: 53 }, { year: 2021, value: 50 },
      { year: 2022, value: 37 }, { year: 2023, value: 55 },
      { year: 2024, value: 50, provisional: true },
    ],
  },
  {
    urlPattern: /pharma.*rd.*spend|efpia.*rd|evaluate.*rd/i,
    source: 'EFPIA / Evaluate Pharma',
    data: [
      { year: 2016, value: 157 }, { year: 2017, value: 165 },
      { year: 2018, value: 179 }, { year: 2019, value: 194 },
      { year: 2020, value: 198 }, { year: 2021, value: 214 },
      { year: 2022, value: 244 }, { year: 2023, value: 252 },
      { year: 2024, value: 265, provisional: true },
    ],
  },
  {
    urlPattern: /who.*genomic.*surveil/i,
    source: 'WHO/GISAID Genomic Surveillance',
    data: [
      { year: 2019, value: 5 },  { year: 2020, value: 12 },
      { year: 2021, value: 28 }, { year: 2022, value: 35 },
      { year: 2023, value: 38 }, { year: 2024, value: 41, provisional: true },
    ],
  },
  {
    urlPattern: /amr.*mortality|amr.*death/i,
    source: 'Lancet/WHO Global AMR Report',
    data: [
      { year: 2019, value: 1.27 }, { year: 2020, value: 1.30 },
      { year: 2021, value: 1.33 }, { year: 2022, value: 1.37 },
      { year: 2023, value: 1.40, provisional: true },
    ],
  },
  {
    urlPattern: /ihr.*monitor|ihr.*compliance|spar/i,
    source: 'WHO IHR/SPAR Assessments',
    data: [
      { year: 2018, value: 0.52 }, { year: 2019, value: 0.55 },
      { year: 2020, value: 0.57 }, { year: 2021, value: 0.60 },
      { year: 2022, value: 0.62 }, { year: 2023, value: 0.64 },
    ],
  },

  // ── CLIMATE ──

  {
    urlPattern: /mediterranean.*precipitation|copernicus.*precip/i,
    source: 'Copernicus ERA5 (Mediterranean precipitation)',
    data: [
      { year: 2015, value: 95 },  { year: 2016, value: 92 },
      { year: 2017, value: 78 },  { year: 2018, value: 88 },
      { year: 2019, value: 82 },  { year: 2020, value: 90 },
      { year: 2021, value: 74 },  { year: 2022, value: 71 },
      { year: 2023, value: 85 },  { year: 2024, value: 76, provisional: true },
    ],
  },
  {
    urlPattern: /mediterranean.*temperature|copernicus.*temp/i,
    source: 'Copernicus ERA5 (Mediterranean temperature)',
    data: [
      { year: 2015, value: 0.85 }, { year: 2016, value: 0.92 },
      { year: 2017, value: 0.98 }, { year: 2018, value: 1.05 },
      { year: 2019, value: 1.12 }, { year: 2020, value: 1.20 },
      { year: 2021, value: 1.08 }, { year: 2022, value: 1.32 },
      { year: 2023, value: 1.48 }, { year: 2024, value: 1.55, provisional: true },
    ],
  },

  // ── GOVERNANCE ──

  {
    urlPattern: /edpb.*enforcement|dpa.*enforcement/i,
    source: 'EDPB Annual Reports',
    data: [
      { year: 2019, value: 0.35 }, { year: 2020, value: 0.45 },
      { year: 2021, value: 0.55 }, { year: 2022, value: 0.62 },
      { year: 2023, value: 0.70 }, { year: 2024, value: 0.74, provisional: true },
    ],
  },
  {
    urlPattern: /cctv.*statist|cctv.*density|cameras.*per.*1000/i,
    source: 'Comparitech/SurfShark CCTV Reports',
    data: [
      { year: 2019, value: 9.5 },  { year: 2020, value: 10.2 },
      { year: 2021, value: 11.8 }, { year: 2022, value: 13.1 },
      { year: 2023, value: 14.5 },
    ],
  },

  // ── LABOUR ──

  {
    urlPattern: /lfsi_emp_a|employment.*rate.*ital/i,
    source: 'ISTAT / Eurostat lfsi_emp_a (Employment rate IT)',
    data: [
      { year: 2010, value: 56.9 }, { year: 2011, value: 56.9 },
      { year: 2012, value: 56.8 }, { year: 2013, value: 55.6 },
      { year: 2014, value: 55.7 }, { year: 2015, value: 56.3 },
      { year: 2016, value: 57.2 }, { year: 2017, value: 58.0 },
      { year: 2018, value: 58.5 }, { year: 2019, value: 59.0 },
      { year: 2020, value: 57.5 }, { year: 2021, value: 58.2 },
      { year: 2022, value: 60.1 }, { year: 2023, value: 61.5 },
      { year: 2024, value: 62.3, provisional: true },
    ],
  },

  // ── DIGITAL ECONOMY ──

  {
    urlPattern: /isoc_cicce_use|cloud.*computing.*enterprise/i,
    source: 'Eurostat isoc_cicce_use (Cloud computing EU enterprises)',
    data: [
      { year: 2016, value: 21 }, { year: 2017, value: 22 },
      { year: 2018, value: 24 }, { year: 2019, value: 26 },
      { year: 2020, value: 36 }, { year: 2021, value: 41 },
      { year: 2022, value: 45 }, { year: 2023, value: 45.2 },
      { year: 2024, value: 47, provisional: true },
    ],
  },
  {
    urlPattern: /isoc_ci_in_h|digital.*skills.*index/i,
    source: 'Eurostat isoc_ci_in_h / DESI (Digital skills EU)',
    data: [
      { year: 2015, value: 44 }, { year: 2016, value: 45 },
      { year: 2017, value: 47 }, { year: 2018, value: 49 },
      { year: 2019, value: 52 }, { year: 2020, value: 54 },
      { year: 2021, value: 54 }, { year: 2022, value: 55 },
      { year: 2023, value: 56 },
      { year: 2024, value: 58, provisional: true },
    ],
  },

  // ── ENERGY BALANCE ──

  {
    urlPattern: /nrg_bal_c|primary.*energy.*mtoe/i,
    source: 'Eurostat nrg_bal_c (Primary energy EU Mtoe)',
    data: [
      { year: 2010, value: 1660 }, { year: 2011, value: 1596 },
      { year: 2012, value: 1584 }, { year: 2013, value: 1569 },
      { year: 2014, value: 1507 }, { year: 2015, value: 1530 },
      { year: 2016, value: 1543 }, { year: 2017, value: 1562 },
      { year: 2018, value: 1552 }, { year: 2019, value: 1523 },
      { year: 2020, value: 1384 }, { year: 2021, value: 1479 },
      { year: 2022, value: 1411 }, { year: 2023, value: 1380, provisional: true },
    ],
  },

  // ── MILITARY / DEFENSE ──

  {
    urlPattern: /MS\.MIL\.XPND|military.*expenditure.*gdp/i,
    source: 'World Bank / SIPRI (Military expenditure % GDP, EU avg)',
    data: [
      { year: 2010, value: 1.56 }, { year: 2011, value: 1.51 },
      { year: 2012, value: 1.47 }, { year: 2013, value: 1.43 },
      { year: 2014, value: 1.41 }, { year: 2015, value: 1.40 },
      { year: 2016, value: 1.41 }, { year: 2017, value: 1.43 },
      { year: 2018, value: 1.44 }, { year: 2019, value: 1.46 },
      { year: 2020, value: 1.52 }, { year: 2021, value: 1.50 },
      { year: 2022, value: 1.65 }, { year: 2023, value: 1.77 },
      { year: 2024, value: 1.88, provisional: true },
    ],
  },

  // ── HEALTH EXPENDITURE ──

  {
    urlPattern: /SH\.XPD\.CHEX|health.*expenditure.*gdp/i,
    source: 'World Bank / WHO (Health expenditure % GDP)',
    data: [
      { year: 2010, value: 8.8 }, { year: 2011, value: 8.8 },
      { year: 2012, value: 8.9 }, { year: 2013, value: 9.0 },
      { year: 2014, value: 9.1 }, { year: 2015, value: 9.2 },
      { year: 2016, value: 9.3 }, { year: 2017, value: 9.2 },
      { year: 2018, value: 9.2 }, { year: 2019, value: 9.3 },
      { year: 2020, value: 10.5 }, { year: 2021, value: 10.3 },
      { year: 2022, value: 9.8 }, { year: 2023, value: 9.6, provisional: true },
    ],
  },

  // ── AFRICA DEMOGRAPHICS ──

  {
    urlPattern: /SP\.POP\.TOTL|worldbank.*population.*total/i,
    source: 'World Bank SP.POP.TOTL (Sub-Saharan Africa population)',
    data: [
      { year: 2010, value: 1.04 }, { year: 2011, value: 1.07 },
      { year: 2012, value: 1.10 }, { year: 2013, value: 1.14 },
      { year: 2014, value: 1.17 }, { year: 2015, value: 1.20 },
      { year: 2016, value: 1.24 }, { year: 2017, value: 1.27 },
      { year: 2018, value: 1.31 }, { year: 2019, value: 1.34 },
      { year: 2020, value: 1.37 }, { year: 2021, value: 1.40 },
      { year: 2022, value: 1.43 }, { year: 2023, value: 1.46 },
      { year: 2024, value: 1.49, provisional: true },
    ],
  },
  {
    urlPattern: /SP\.URB\.TOTL\.IN\.ZS|urbanization.*rate/i,
    source: 'World Bank SP.URB.TOTL.IN.ZS (Africa urbanization rate)',
    data: [
      { year: 2010, value: 38.9 }, { year: 2011, value: 39.3 },
      { year: 2012, value: 39.6 }, { year: 2013, value: 40.0 },
      { year: 2014, value: 40.4 }, { year: 2015, value: 40.7 },
      { year: 2016, value: 41.1 }, { year: 2017, value: 41.4 },
      { year: 2018, value: 41.8 }, { year: 2019, value: 42.2 },
      { year: 2020, value: 42.5 }, { year: 2021, value: 42.8 },
      { year: 2022, value: 43.1 }, { year: 2023, value: 43.5 },
      { year: 2024, value: 43.8, provisional: true },
    ],
  },
];

export const FallbackAdapter: DataAdapter = {
  name: 'fallback',

  canHandle(url: string): boolean {
    return FALLBACK_DATA.some(entry => entry.urlPattern.test(url));
  },

  async fetch(config: DataAdapterConfig): Promise<ObservedPoint[]> {
    const entry = FALLBACK_DATA.find(e => e.urlPattern.test(config.sourceUrl));
    if (!entry) return [];

    return entry.data.map(d => ({
      date: new Date(d.year, 0, 1),
      value: d.value,
      source: entry.source,
      provisional: d.provisional,
    }));
  },
};

/**
 * Register additional fallback data at runtime.
 * Useful for scenarios that need custom historical datasets.
 */
export function registerFallbackData(
  urlPattern: RegExp,
  source: string,
  data: Array<{ year: number; value: number; provisional?: boolean }>,
): void {
  FALLBACK_DATA.push({ urlPattern, source, data });
}
