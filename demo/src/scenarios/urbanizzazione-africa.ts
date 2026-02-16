/**
 * Scenario: Urbanizzazione Africana e Leapfrog 2025-2055
 * Categoria: Economia / Società
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'pop_growth',
    label: 'Crescita demografica',
    description: 'Tasso annuo di crescita della popolazione in Africa sub-sahariana',
    unit: '%', min: 1.0, max: 3.5, step: 0.1, default: 2.4,
    source: 'UN World Population Prospects 2024, Sub-Saharan Africa',
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    id: 'climate_finance',
    label: 'Finanza climatica',
    description: 'Flussi annui di finanza climatica verso l\'Africa in miliardi USD',
    unit: 'miliardi $', min: 3, max: 50, step: 1, default: 15,
    source: 'UNFCCC climate finance flows to Africa, 2024',
    format: (v) => `${v} mld $`,
  },
  {
    id: 'governance',
    label: 'Qualità governance',
    description: 'Indice di qualità della governance africana (0=fallimento, 100=eccellente)',
    unit: 'indice', min: 15, max: 80, step: 5, default: 42,
    source: 'Mo Ibrahim Index of African Governance, 2024',
    format: (v) => `${v}/100`,
  },
  {
    id: 'infra_spend',
    label: 'Spesa infrastrutture',
    description: 'Spesa in infrastrutture come percentuale del PIL',
    unit: '% PIL', min: 1, max: 10, step: 0.5, default: 3.5,
    source: 'African Development Bank Infrastructure Index',
    format: (v) => `${v.toFixed(1)}% PIL`,
  },
];

const YEARS = [2025, 2030, 2035, 2040, 2045, 2050, 2055];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'urban_population', baseValues: [590, 730, 880, 1050, 1220, 1400, 1560],
    sensitivities: { pop_growth: 0.6, climate_finance: 0.0, governance: 0.05, infra_spend: 0.0 } },
  { name: 'mobile_money', baseValues: [220, 400, 640, 850, 1050, 1200, 1350],
    sensitivities: { pop_growth: 0.15, climate_finance: 0.05, governance: 0.4, infra_spend: 0.15 } },
  { name: 'solar_offgrid', baseValues: [6, 20, 52, 95, 140, 185, 220],
    sensitivities: { pop_growth: 0.05, climate_finance: 0.55, governance: 0.15, infra_spend: 0.2 } },
  { name: 'gdp_per_capita', baseValues: [3800, 4400, 5200, 6300, 7600, 9200, 11000],
    sensitivities: { pop_growth: -0.15, climate_finance: 0.15, governance: 0.45, infra_spend: 0.25 } },
  { name: 'electrification', baseValues: [50, 60, 73, 82, 88, 93, 96],
    sensitivities: { pop_growth: -0.1, climate_finance: 0.25, governance: 0.15, infra_spend: 0.35 } },
  { name: 'infra_gap', baseValues: [78, 72, 64, 55, 46, 38, 31],
    sensitivities: { pop_growth: 0.15, climate_finance: -0.15, governance: -0.25, infra_spend: -0.45 } },
];

function scale(spec: VarSpec, vals: Record<string, number>): number[] {
  const defs: Record<string, number> = {};
  for (const s of SLIDERS) defs[s.id] = s.default;
  return spec.baseValues.map((base, i) => {
    const d = 0.3 + 0.7 * (i / (spec.baseValues.length - 1));
    let mod = 0;
    for (const [id, sens] of Object.entries(spec.sensitivities)) {
      const def = defs[id]; if (def === 0) continue;
      mod += sens * ((vals[id] ?? def) - def) / def * d;
    }
    return Math.max(0, Math.round(base * (1 + mod) * 100) / 100);
  });
}

const fmt = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(1);

function generateSDL(vals: Record<string, number>): string {
  const v: Record<string, number[]> = {};
  for (const spec of VARS) v[spec.name] = scale(spec, vals);

  return `
scenario "Urbanizzazione Africana e Leapfrog 2025-2055" {
  timeframe: 2025 -> 2055
  resolution: yearly
  confidence: 0.35
  author: "Relatronica — Citizen Lab"
  description: "L'onda di urbanizzazione africana e il potenziale di leapfrog tecnologico in finanza, energia e connettività"
  tags: ["africa", "urbanizzazione", "leapfrog", "fintech", "solare"]

  assumption pop_growth { value: ${((vals.pop_growth ?? 2.4) / 100).toFixed(3)}  source: "UN WPP 2024"  confidence: 0.7  uncertainty: normal(±12%) }
  assumption climate_finance { value: ${(vals.climate_finance ?? 15) * 1e9}  source: "UNFCCC 2024"  confidence: 0.3  uncertainty: lognormal(2.7, 0.5) }
  assumption governance { value: ${((vals.governance ?? 42) / 100).toFixed(2)}  source: "Mo Ibrahim Index 2024"  confidence: 0.5  uncertainty: beta(4, 5) }
  assumption infra_spend { value: ${((vals.infra_spend ?? 3.5) / 100).toFixed(3)}  source: "AfDB Infrastructure Index"  confidence: 0.4  uncertainty: normal(±20%) }

  variable urban_population {
    description: "Popolazione urbana Africa sub-sahariana"
    unit: "milioni"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.urban_population[i])}`).join('\n    ')}
    depends_on: pop_growth
    uncertainty: normal(±8%)
    interpolation: spline
  }

  variable mobile_money {
    description: "Account mobile money attivi"
    unit: "milioni"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.mobile_money[i])}`).join('\n    ')}
    depends_on: pop_growth, governance
    uncertainty: normal(±18%)
    interpolation: spline
  }

  variable solar_offgrid {
    description: "Capacità solare off-grid installata"
    unit: "GW"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.solar_offgrid[i])}`).join('\n    ')}
    depends_on: climate_finance
    uncertainty: normal(±22%)
    interpolation: spline
  }

  variable gdp_per_capita {
    description: "PIL pro capite medio (PPP)"
    unit: "USD"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.gdp_per_capita[i])}`).join('\n    ')}
    depends_on: urban_population, mobile_money, governance
    uncertainty: normal(±15%)
    interpolation: spline
  }

  variable electrification {
    description: "Tasso di elettrificazione"
    unit: "percentuale"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.electrification[i])}`).join('\n    ')}
    depends_on: solar_offgrid, infra_spend
    uncertainty: normal(±10%)
    interpolation: spline
  }

  variable infra_gap {
    description: "Gap infrastrutturale (100=massimo deficit)"
    unit: "indice"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.infra_gap[i])}`).join('\n    ')}
    depends_on: infra_spend
    uncertainty: normal(±15%)
    interpolation: spline
  }

  impact indice_leapfrog {
    description: "Progresso leapfrog digitale (fintech + energia + connettività)"
    unit: "indice"
    derives_from: mobile_money, electrification
    formula: (mobile_money / 1500 * 50) + (electrification * 0.5)
  }

  impact convergenza_economica {
    description: "PIL pro capite come % della media mondiale"
    unit: "percentuale"
    derives_from: gdp_per_capita
    formula: gdp_per_capita / 18000 * 100
  }

  branch "Leapfrog digitale" when mobile_money > 800 and electrification > 75 {
    probability: 0.28
    variable gdp_per_capita { 2040: ${fmt(v.gdp_per_capita[3] * 1.2)}  2045: ${fmt(v.gdp_per_capita[4] * 1.3)}  2050: ${fmt(v.gdp_per_capita[5] * 1.36)}  uncertainty: normal(±18%) }
  }

  branch "Trappola urbana" when infra_gap > 65 and urban_population > 1000 {
    probability: 0.25
    variable gdp_per_capita { 2040: ${fmt(v.gdp_per_capita[3] * 0.83)}  2045: ${fmt(v.gdp_per_capita[4] * 0.76)}  2050: ${fmt(v.gdp_per_capita[5] * 0.71)}  uncertainty: normal(±20%) }
  }

  branch "Svolta governance" when governance > 0.6 {
    probability: 0.18
    variable gdp_per_capita { 2035: ${fmt(v.gdp_per_capita[2] * 1.15)}  2040: ${fmt(v.gdp_per_capita[3] * 1.27)}  2050: ${fmt(v.gdp_per_capita[5] * 1.47)}  uncertainty: normal(±15%) }
  }

  simulate { runs: 2000  method: latin_hypercube  seed: 2050  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.01 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'urbanizzazione-africa',
    title: 'Urbanizzazione Africana',
    subtitle: 'Megacities, leapfrog e crescita 2025-2055',
    description: 'L\'Africa avrà 1.4 miliardi di abitanti urbani nel 2050. Salterà le fasi tradizionali di sviluppo con mobile money, solare off-grid e connettività? Oppure resterà intrappolata in megacities senza infrastrutture?',
    category: 'economia',
    tags: ['Africa', 'urbanizzazione', 'mobile money', 'solare', 'leapfrog'],
    icon: '🌍',
    color: '#f59e0b',
    period: '2025 — 2055',
    difficulty: 'intermedio',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'urban_population', label: 'Popolazione urbana', description: 'Popolazione urbana in Africa sub-sahariana', unit: 'milioni', color: '#3b82f6', type: 'variable', icon: '🏙' },
    { id: 'mobile_money', label: 'Mobile money', description: 'Account mobile money attivi', unit: 'milioni', color: '#10b981', type: 'variable', icon: '📱' },
    { id: 'solar_offgrid', label: 'Solare off-grid', description: 'Capacità solare off-grid installata', unit: 'GW', color: '#f59e0b', type: 'variable', icon: '☀' },
    { id: 'gdp_per_capita', label: 'PIL pro capite', description: 'PIL pro capite medio a parità di potere d\'acquisto', unit: 'USD', color: '#8b5cf6', type: 'variable', icon: '💰' },
    { id: 'electrification', label: 'Elettrificazione', description: 'Percentuale di popolazione con accesso all\'elettricità', unit: '%', color: '#10b981', type: 'variable', icon: '⚡' },
    { id: 'indice_leapfrog', label: 'Indice leapfrog', description: 'Progresso composito del leapfrog tecnologico', unit: 'indice', color: '#3b82f6', type: 'impact', icon: '🚀' },
    { id: 'infra_gap', label: 'Gap infrastrutturale', description: 'Indice di deficit infrastrutturale (100=massimo)', unit: 'indice', color: '#ef4444', type: 'variable', icon: '🏗' },
  ],
  generateSDL,
};

export default scenario;
