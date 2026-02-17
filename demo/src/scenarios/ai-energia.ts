/**
 * Scenario: AI e Consumo Energetico 2025-2040
 * Categoria: Tecnologia / Ambiente
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'compute_growth',
    label: 'Crescita domanda AI compute',
    description: 'Fattore annuo di crescita della domanda di calcolo per training e inferenza AI',
    unit: 'fattore', min: 1.5, max: 6.0, step: 0.1, default: 3.5,
    source: 'Epoch AI compute trends 2025; IEA World Energy Outlook',
    format: (v) => `${v.toFixed(1)}x/anno`,
  },
  {
    id: 'chip_efficiency',
    label: 'Efficienza chip (miglioramento annuo)',
    description: 'Percentuale annua di miglioramento dell\'efficienza energetica dei chip AI (GPU/TPU)',
    unit: '%', min: 5, max: 50, step: 1, default: 25,
    source: 'NVIDIA/AMD roadmap; Epoch AI hardware analysis',
    format: (v) => `${v}%/anno`,
  },
  {
    id: 'renewable_share_dc',
    label: 'Quota rinnovabili data center',
    description: 'Percentuale di energia da fonti rinnovabili usata dai data center globali',
    unit: '%', min: 20, max: 100, step: 5, default: 40,
    source: 'RE100 tracker; IEA Data Centres & Networks Report 2025',
    format: (v) => `${v}%`,
  },
  {
    id: 'carbon_price',
    label: 'Prezzo carbonio (su AI compute)',
    description: 'Eventuale tassa carbonio applicata al consumo energetico dei data center (€/MWh)',
    unit: '€/MWh', min: 0, max: 60, step: 5, default: 0,
    source: 'Ipotesi di policy — attualmente non esiste',
    format: (v) => v === 0 ? 'Nessuna' : `${v} €/MWh`,
  },
];

const YEARS = [2025, 2028, 2031, 2034, 2037, 2040];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'consumo_elettrico_ai', baseValues: [120, 250, 480, 750, 1050, 1400],
    sensitivities: { compute_growth: 0.55, chip_efficiency: -0.35, renewable_share_dc: 0.0, carbon_price: -0.15 } },
  { name: 'emissioni_co2_ai', baseValues: [50, 85, 135, 180, 210, 240],
    sensitivities: { compute_growth: 0.45, chip_efficiency: -0.2, renewable_share_dc: -0.5, carbon_price: -0.2 } },
  { name: 'quota_elettricita_globale', baseValues: [0.4, 0.8, 1.4, 2.2, 3.0, 4.0],
    sensitivities: { compute_growth: 0.6, chip_efficiency: -0.35, renewable_share_dc: 0.0, carbon_price: -0.1 } },
  { name: 'consumo_acqua_dc', baseValues: [26, 48, 80, 120, 160, 210],
    sensitivities: { compute_growth: 0.5, chip_efficiency: -0.15, renewable_share_dc: 0.0, carbon_price: -0.1 } },
  { name: 'costo_per_query', baseValues: [0.40, 0.28, 0.18, 0.12, 0.08, 0.05],
    sensitivities: { compute_growth: -0.1, chip_efficiency: -0.55, renewable_share_dc: 0.05, carbon_price: 0.3 } },
];

function scale(spec: VarSpec, vals: Record<string, number>): number[] {
  const defs: Record<string, number> = {};
  for (const s of SLIDERS) defs[s.id] = s.default;
  return spec.baseValues.map((base, i) => {
    const d = 0.3 + 0.7 * (i / (spec.baseValues.length - 1));
    let mod = 0;
    for (const [id, sens] of Object.entries(spec.sensitivities)) {
      const def = defs[id];
      if (def === 0) continue;
      mod += sens * ((vals[id] ?? def) - def) / def * d;
    }
    return Math.max(0, Math.round(base * (1 + mod) * 1000) / 1000);
  });
}

const fmt = (n: number) => Number.isInteger(n) ? n.toString() : n < 1 ? n.toFixed(3) : n.toFixed(2);

function generateSDL(vals: Record<string, number>): string {
  const v: Record<string, number[]> = {};
  for (const spec of VARS) v[spec.name] = scale(spec, vals);
  const computeGrowth = vals.compute_growth ?? 3.5;
  const chipEff = vals.chip_efficiency ?? 25;
  const renewableShare = vals.renewable_share_dc ?? 40;
  const carbonPrice = vals.carbon_price ?? 0;

  return `
scenario "AI e Consumo Energetico 2025-2040" {
  timeframe: 2025 -> 2040
  resolution: yearly
  confidence: 0.40
  author: "Relatronica — Citizen Lab"
  version: "1.0"
  description: "Impatto energetico dell'AI: consumo elettrico, emissioni, acqua e costo per query"
  tags: ["ai", "energia", "clima", "data-center", "sostenibilita"]

  assumption compute_growth { value: ${computeGrowth}  source: "Epoch AI 2025"  confidence: 0.5  uncertainty: lognormal(1.2, 0.3) }
  assumption chip_efficiency { value: ${(chipEff / 100).toFixed(2)}  source: "NVIDIA/AMD roadmap"  confidence: 0.5  uncertainty: normal(±30%) }
  assumption renewable_share_dc { value: ${(renewableShare / 100).toFixed(2)}  source: "RE100, IEA"  confidence: 0.5  uncertainty: beta(5, 3) }
  assumption carbon_price { value: ${carbonPrice}  source: "Ipotesi policy"  confidence: 0.3  uncertainty: normal(±50%) }

  variable consumo_elettrico_ai {
    description: "Consumo elettrico globale dell'AI"
    unit: "TWh"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.consumo_elettrico_ai[i])}`).join('\n    ')}
    depends_on: compute_growth, chip_efficiency
    uncertainty: lognormal(4.8, 0.3)
    interpolation: spline
  }

  variable emissioni_co2_ai {
    description: "Emissioni CO2 annue del settore AI globale"
    unit: "MtCO2"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.emissioni_co2_ai[i])}`).join('\n    ')}
    depends_on: consumo_elettrico_ai, renewable_share_dc
    uncertainty: normal(±20%)
    interpolation: spline
  }

  variable quota_elettricita_globale {
    description: "Quota AI sul consumo elettrico mondiale"
    unit: "percentuale"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.quota_elettricita_globale[i])}`).join('\n    ')}
    depends_on: consumo_elettrico_ai
    uncertainty: normal(±18%)
    interpolation: spline
  }

  variable consumo_acqua_dc {
    description: "Consumo idrico globale dei data center"
    unit: "miliardi di litri"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.consumo_acqua_dc[i])}`).join('\n    ')}
    depends_on: consumo_elettrico_ai
    uncertainty: normal(±22%)
    interpolation: spline
  }

  variable costo_per_query {
    description: "Costo energetico medio per query AI"
    unit: "centesimi USD"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.costo_per_query[i])}`).join('\n    ')}
    depends_on: chip_efficiency, consumo_elettrico_ai
    uncertainty: normal(±20%)
    interpolation: spline
  }

  impact gap_net_zero {
    description: "Gap tra obiettivo 100% rinnovabili e quota attuale AI"
    unit: "punti percentuali"
    derives_from: renewable_share_dc
    formula: 100 - renewable_share_dc * 100
  }

  branch "Svolta efficienza chip" when chip_efficiency > 0.4 {
    probability: 0.20
    variable consumo_elettrico_ai { 2034: ${fmt(v.consumo_elettrico_ai[3] * 0.65)}  2037: ${fmt(v.consumo_elettrico_ai[4] * 0.55)}  2040: ${fmt(v.consumo_elettrico_ai[5] * 0.5)}  uncertainty: normal(±18%) }
    variable costo_per_query { 2034: ${fmt(v.costo_per_query[3] * 0.5)}  2037: ${fmt(v.costo_per_query[4] * 0.35)}  2040: ${fmt(v.costo_per_query[5] * 0.25)}  uncertainty: normal(±25%) }
  }

  branch "Esplosione compute" when compute_growth > 5 {
    probability: 0.18
    variable consumo_elettrico_ai { 2034: ${fmt(v.consumo_elettrico_ai[3] * 1.6)}  2037: ${fmt(v.consumo_elettrico_ai[4] * 2.0)}  2040: ${fmt(v.consumo_elettrico_ai[5] * 2.5)}  uncertainty: lognormal(7, 0.4) }
    variable quota_elettricita_globale { 2034: ${fmt(v.quota_elettricita_globale[3] * 1.8)}  2037: ${fmt(v.quota_elettricita_globale[4] * 2.2)}  2040: ${fmt(v.quota_elettricita_globale[5] * 2.5)}  uncertainty: normal(±25%) }
  }

  branch "Carbon tax su AI" when carbon_price > 30 {
    probability: 0.15
    variable emissioni_co2_ai { 2034: ${fmt(v.emissioni_co2_ai[3] * 0.7)}  2037: ${fmt(v.emissioni_co2_ai[4] * 0.55)}  2040: ${fmt(v.emissioni_co2_ai[5] * 0.45)}  uncertainty: normal(±20%) }
  }

  simulate { runs: 2000  method: monte_carlo  seed: 42  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.01 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'ai-energia',
    title: 'AI e Consumo Energetico',
    subtitle: 'Data center, emissioni e tensione climatica 2025-2040',
    description: 'L\'AI consuma gia\' piu\' di molte nazioni. Come crescera\' il fabbisogno energetico dei data center? E quale sara\' l\'impatto su clima, acqua e costi? Esplora gli scenari.',
    category: 'tecnologia',
    tags: ['ai', 'energia', 'data center', 'CO₂', 'acqua'],
    icon: '🔌',
    color: '#f59e0b',
    period: '2025 — 2040',
    difficulty: 'intermedio',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'consumo_elettrico_ai', label: 'Consumo elettrico AI', description: 'Consumo totale di elettricita\' per workload AI nel mondo', unit: 'TWh', color: '#f59e0b', type: 'variable', icon: '⚡' },
    { id: 'emissioni_co2_ai', label: 'Emissioni CO₂', description: 'Emissioni annue di CO2 del settore AI globale', unit: 'MtCO₂', color: '#ef4444', type: 'variable', icon: '☁' },
    { id: 'gap_net_zero', label: 'Gap net-zero', description: 'Distanza dall\'obiettivo 100% rinnovabili nei data center', unit: 'pp', color: '#10b981', type: 'impact', icon: '🎯' },
    { id: 'consumo_acqua_dc', label: 'Consumo acqua', description: 'Miliardi di litri d\'acqua consumati dai data center', unit: 'mld litri', color: '#3b82f6', type: 'variable', icon: '💧' },
    { id: 'costo_per_query', label: 'Costo per query', description: 'Costo energetico medio per singola query AI', unit: 'cent $', color: '#8b5cf6', type: 'variable', icon: '💰' },
  ],
  generateSDL,
};

export default scenario;
