/**
 * Scenario: Transizione Energetica Italia 2025-2040
 * Categoria: Ambiente / Economia
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'renewable_investment',
    label: 'Investimento in rinnovabili',
    description: 'Investimento annuo totale in fonti rinnovabili (solare, eolico, biomasse, idroelettrico)',
    unit: 'miliardi €', min: 5, max: 60, step: 1, default: 20,
    source: 'GSE Rapporto Statistico 2024; PNIEC 2024',
    format: (v) => `${v} mld €`,
  },
  {
    id: 'carbon_tax',
    label: 'Prezzo carbonio (ETS)',
    description: 'Prezzo per tonnellata di CO₂ nel sistema europeo di scambio emissioni',
    unit: '€/tCO₂', min: 30, max: 200, step: 5, default: 80,
    source: 'EU ETS prezzo medio 2024; proiezioni IEA',
    format: (v) => `${v} €/t`,
  },
  {
    id: 'efficiency_rate',
    label: 'Efficienza energetica edifici',
    description: 'Percentuale di edifici residenziali riqualificati energeticamente per anno',
    unit: '%', min: 1, max: 8, step: 0.5, default: 3,
    source: 'ENEA Rapporto Efficienza Energetica 2024; Superbonus dati',
    format: (v) => `${v}%/anno`,
  },
  {
    id: 'gas_dependency',
    label: 'Dipendenza dal gas naturale',
    description: 'Quota del gas naturale nel mix energetico nazionale. Oggi circa 40%',
    unit: '%', min: 10, max: 50, step: 1, default: 38,
    source: 'MASE Piano Energetico; Terna dati rete 2024',
    format: (v) => `${v}%`,
  },
];

const YEARS = [2025, 2028, 2031, 2034, 2037, 2040];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'quota_rinnovabili', baseValues: [22, 30, 40, 52, 62, 72],
    sensitivities: { renewable_investment: 0.5, carbon_tax: 0.2, efficiency_rate: 0.1, gas_dependency: -0.3 } },
  { name: 'emissioni_co2', baseValues: [320, 280, 235, 190, 150, 115],
    sensitivities: { renewable_investment: -0.3, carbon_tax: -0.25, efficiency_rate: -0.2, gas_dependency: 0.4 } },
  { name: 'costo_energia_famiglia', baseValues: [2200, 2100, 1950, 1800, 1680, 1550],
    sensitivities: { renewable_investment: -0.15, carbon_tax: 0.2, efficiency_rate: -0.3, gas_dependency: 0.25 } },
  { name: 'posti_lavoro_verdi', baseValues: [0.5, 0.8, 1.2, 1.7, 2.2, 2.8],
    sensitivities: { renewable_investment: 0.6, carbon_tax: 0.1, efficiency_rate: 0.35, gas_dependency: -0.1 } },
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

const fmt = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(2);

function generateSDL(vals: Record<string, number>): string {
  const v: Record<string, number[]> = {};
  for (const spec of VARS) v[spec.name] = scale(spec, vals);

  return `
scenario "Transizione Energetica Italia 2025-2040" {
  timeframe: 2025 -> 2040
  resolution: yearly
  confidence: 0.40
  author: "Relatronica — Citizen Lab"
  description: "Percorso dell'Italia verso la decarbonizzazione: rinnovabili, emissioni, costi e lavoro verde"
  tags: ["italia", "energia", "clima", "rinnovabili", "co2"]

  assumption renewable_investment { value: ${vals.renewable_investment ?? 20}  source: "GSE, PNIEC 2024"  confidence: 0.55  uncertainty: normal(±20%) }
  assumption carbon_tax { value: ${vals.carbon_tax ?? 80}  source: "EU ETS"  confidence: 0.5  uncertainty: normal(±30%) }
  assumption efficiency_rate { value: ${(vals.efficiency_rate ?? 3) / 100}  source: "ENEA 2024"  confidence: 0.5  uncertainty: normal(±25%) }
  assumption gas_dependency { value: ${(vals.gas_dependency ?? 38) / 100}  source: "MASE, Terna"  confidence: 0.6  uncertainty: normal(±15%) }

  variable quota_rinnovabili {
    description: "Quota rinnovabili nel mix elettrico nazionale"
    unit: "percentuale"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.quota_rinnovabili[i])}`).join('\n    ')}
    depends_on: renewable_investment, carbon_tax, gas_dependency
    uncertainty: normal(±15%)
    interpolation: spline
  }

  variable emissioni_co2 {
    description: "Emissioni annue di CO2 dell'Italia"
    unit: "MtCO2"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.emissioni_co2[i])}`).join('\n    ')}
    depends_on: renewable_investment, carbon_tax, efficiency_rate, gas_dependency
    uncertainty: normal(±18%)
    interpolation: spline
  }

  variable costo_energia_famiglia {
    description: "Costo medio annuo energia per famiglia"
    unit: "EUR/anno"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.costo_energia_famiglia[i])}`).join('\n    ')}
    depends_on: renewable_investment, carbon_tax, efficiency_rate
    uncertainty: normal(±20%)
    interpolation: spline
  }

  variable posti_lavoro_verdi {
    description: "Occupazione nei settori green"
    unit: "milioni"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.posti_lavoro_verdi[i])}`).join('\n    ')}
    depends_on: renewable_investment, efficiency_rate
    uncertainty: normal(±22%)
    interpolation: spline
  }

  impact riduzione_emissioni {
    description: "Riduzione cumulata emissioni rispetto al 2025"
    unit: "MtCO2"
    derives_from: emissioni_co2
    formula: 320 - emissioni_co2
  }

  branch "Boom solare" when renewable_investment > 40 {
    probability: 0.30
    variable quota_rinnovabili { 2034: ${fmt(v.quota_rinnovabili[3] * 1.15)}  2037: ${fmt(v.quota_rinnovabili[4] * 1.2)}  2040: ${fmt(Math.min(95, v.quota_rinnovabili[5] * 1.25))}  uncertainty: normal(±12%) }
  }

  branch "Carbon tax aggressiva" when carbon_tax > 150 {
    probability: 0.25
    variable emissioni_co2 { 2034: ${fmt(v.emissioni_co2[3] * 0.8)}  2037: ${fmt(v.emissioni_co2[4] * 0.7)}  2040: ${fmt(v.emissioni_co2[5] * 0.6)}  uncertainty: normal(±20%) }
    variable costo_energia_famiglia { 2034: ${fmt(v.costo_energia_famiglia[3] * 1.15)}  2037: ${fmt(v.costo_energia_famiglia[4] * 1.1)}  2040: ${fmt(v.costo_energia_famiglia[5] * 1.05)}  uncertainty: normal(±15%) }
  }

  simulate { runs: 2000  method: monte_carlo  seed: 42  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.01 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'energia',
    title: 'Transizione Energetica',
    subtitle: 'Rinnovabili, emissioni e costi 2025-2040',
    description: 'L\'Italia raggiungerà gli obiettivi climatici? Esplora l\'impatto degli investimenti in rinnovabili, del prezzo del carbonio e dell\'efficienza energetica su emissioni, costi e lavoro verde.',
    category: 'ambiente',
    tags: ['energia', 'clima', 'rinnovabili', 'CO₂', 'green jobs'],
    icon: '⚡',
    color: '#10b981',
    period: '2025 — 2040',
    difficulty: 'base',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'quota_rinnovabili', label: 'Quota rinnovabili', description: 'Percentuale di energia elettrica da fonti rinnovabili', unit: '%', color: '#10b981', type: 'variable', icon: '☀' },
    { id: 'emissioni_co2', label: 'Emissioni CO₂', description: 'Emissioni annue di anidride carbonica in milioni di tonnellate', unit: 'MtCO₂', color: '#ef4444', type: 'variable', icon: '☁' },
    { id: 'riduzione_emissioni', label: 'Riduzione emissioni', description: 'Riduzione cumulata delle emissioni rispetto ai livelli 2025', unit: 'MtCO₂', color: '#06b6d4', type: 'impact', icon: '↓' },
    { id: 'costo_energia_famiglia', label: 'Costo energia famiglia', description: 'Spesa media annua per energia di una famiglia italiana', unit: '€/anno', color: '#f59e0b', type: 'variable', icon: '🏠' },
    { id: 'posti_lavoro_verdi', label: 'Lavoro verde', description: 'Milioni di occupati nei settori dell\'economia verde', unit: 'milioni', color: '#8b5cf6', type: 'variable', icon: '♻' },
  ],
  generateSDL,
};

export default scenario;
