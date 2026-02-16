/**
 * Scenario: Crisi Idrica Mediterraneo 2025-2045
 * Categoria: Ambiente
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'rainfall_index',
    label: 'Indice precipitazioni',
    description: 'Indice precipitazioni annuali nel Mediterraneo (100 = media 2020-2024). Valori bassi indicano siccità',
    unit: 'indice', min: 50, max: 120, step: 5, default: 100,
    source: 'Copernicus ERA5 Mediterranean precipitation baseline, 2020-2024',
    format: (v) => `${v}`,
  },
  {
    id: 'temperature_anomaly',
    label: 'Anomalia termica',
    description: 'Anomalia di temperatura media rispetto al periodo pre-industriale in gradi Celsius',
    unit: '°C', min: 0.8, max: 3.0, step: 0.1, default: 1.3,
    source: 'IPCC AR6 Mediterranean hotspot',
    format: (v) => `+${v.toFixed(1)}°C`,
  },
  {
    id: 'infra_investment',
    label: 'Investimenti infrastruttura',
    description: 'Investimento annuo EU + nazionale in infrastruttura idrica in miliardi di euro',
    unit: 'miliardi €', min: 2, max: 30, step: 1, default: 8,
    source: 'EU Water Framework Directive budget allocation',
    format: (v) => `${v} mld €`,
  },
  {
    id: 'irrigation_efficiency',
    label: 'Efficienza irrigazione',
    description: 'Target di efficienza irrigua per l\'agricoltura mediterranea (% acqua effettivamente utilizzata)',
    unit: '%', min: 40, max: 95, step: 5, default: 75,
    source: 'FAO AQUASTAT irrigation efficiency data',
    format: (v) => `${v}%`,
  },
];

const YEARS = [2025, 2028, 2030, 2035, 2040, 2045];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'water_stress', baseValues: [42, 47, 52, 63, 72, 78],
    sensitivities: { rainfall_index: -0.55, temperature_anomaly: 0.4, infra_investment: -0.15, irrigation_efficiency: -0.2 } },
  { name: 'desalination_capacity', baseValues: [12, 15, 19, 30, 42, 55],
    sensitivities: { rainfall_index: -0.1, temperature_anomaly: 0.1, infra_investment: 0.6, irrigation_efficiency: 0.0 } },
  { name: 'agricultural_output', baseValues: [100, 97, 93, 84, 76, 70],
    sensitivities: { rainfall_index: 0.4, temperature_anomaly: -0.35, infra_investment: 0.1, irrigation_efficiency: 0.35 } },
  { name: 'population_at_risk', baseValues: [80, 95, 110, 142, 165, 180],
    sensitivities: { rainfall_index: -0.4, temperature_anomaly: 0.35, infra_investment: -0.15, irrigation_efficiency: -0.1 } },
  { name: 'conflict_risk', baseValues: [22, 28, 35, 48, 58, 65],
    sensitivities: { rainfall_index: -0.45, temperature_anomaly: 0.3, infra_investment: -0.2, irrigation_efficiency: -0.1 } },
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
  const rain = vals.rainfall_index ?? 100;
  const temp = vals.temperature_anomaly ?? 1.3;
  const infra = vals.infra_investment ?? 8;
  const irrig = vals.irrigation_efficiency ?? 75;

  return `
scenario "Crisi Idrica Mediterraneo 2025-2045" {
  timeframe: 2025 -> 2045
  resolution: yearly
  confidence: 0.40
  author: "Relatronica — Citizen Lab"
  description: "Modelli della crisi idrica mediterranea: precipitazioni, agricoltura, desalinizzazione e conflitti"
  tags: ["acqua", "clima", "agricoltura", "mediterraneo", "infrastrutture"]

  assumption rainfall_index { value: ${rain}  source: "Copernicus ERA5"  confidence: 0.6  uncertainty: normal(±18%) }
  assumption temperature_anomaly { value: ${temp}  source: "IPCC AR6"  confidence: 0.7  uncertainty: normal(±15%) }
  assumption infra_investment { value: ${infra * 1e9}  source: "EU Water Framework Directive"  confidence: 0.4  uncertainty: normal(±25%) }
  assumption irrigation_efficiency { value: ${(irrig / 100).toFixed(2)}  source: "FAO AQUASTAT"  confidence: 0.5  uncertainty: normal(±15%) }

  variable water_stress {
    description: "Indice stress idrico Mediterraneo (0=abbondante, 100=scarsità estrema)"
    unit: "indice"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.water_stress[i])}`).join('\n    ')}
    depends_on: rainfall_index, temperature_anomaly
    uncertainty: normal(±15%)
    interpolation: spline
  }

  variable desalination_capacity {
    description: "Capacità desalinizzazione installata"
    unit: "milioni m³/giorno"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.desalination_capacity[i])}`).join('\n    ')}
    depends_on: infra_investment
    uncertainty: normal(±18%)
    interpolation: spline
  }

  variable agricultural_output {
    description: "Produzione agricola mediterranea (2025=100)"
    unit: "indice"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.agricultural_output[i])}`).join('\n    ')}
    depends_on: water_stress, irrigation_efficiency
    uncertainty: normal(±15%)
    interpolation: spline
  }

  variable population_at_risk {
    description: "Popolazione sotto stress idrico elevato"
    unit: "milioni"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.population_at_risk[i])}`).join('\n    ')}
    depends_on: water_stress, desalination_capacity
    uncertainty: normal(±12%)
    interpolation: linear
  }

  variable conflict_risk {
    description: "Rischio conflitto idrico transfrontaliero (0-100)"
    unit: "indice"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.conflict_risk[i])}`).join('\n    ')}
    depends_on: water_stress
    uncertainty: beta(4, 4)
    interpolation: spline
  }

  impact rischio_alimentare {
    description: "Rischio sicurezza alimentare"
    unit: "indice"
    derives_from: agricultural_output
    formula: 100 - agricultural_output
  }

  impact gap_infrastrutturale {
    description: "Gap tra capacità desalinizzazione e fabbisogno"
    unit: "milioni m³/giorno"
    derives_from: desalination_capacity, population_at_risk
    formula: (population_at_risk * 0.15) - desalination_capacity
  }

  branch "Siccità estrema" when rainfall_index < 70 and temperature_anomaly > 2.0 {
    probability: 0.18
    variable water_stress { 2030: ${fmt(Math.min(95, v.water_stress[2] * 1.25))}  2035: ${fmt(Math.min(95, v.water_stress[3] * 1.27))}  2040: ${fmt(Math.min(95, v.water_stress[4] * 1.25))}  uncertainty: normal(±10%) }
    variable agricultural_output { 2035: ${fmt(v.agricultural_output[3] * 0.77)}  2040: ${fmt(v.agricultural_output[4] * 0.66)}  uncertainty: normal(±20%) }
  }

  branch "Piano Marshall idrico" when infra_investment > 15000000000 {
    probability: 0.15
    variable desalination_capacity { 2035: ${fmt(v.desalination_capacity[3] * 1.5)}  2040: ${fmt(v.desalination_capacity[4] * 1.67)}  2045: ${fmt(v.desalination_capacity[5] * 1.73)}  uncertainty: normal(±15%) }
  }

  simulate { runs: 2000  method: monte_carlo  seed: 2040  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.01 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'crisi-idrica',
    title: 'Crisi Idrica Mediterraneo',
    subtitle: 'Acqua, agricoltura e conflitti 2025-2045',
    description: 'Il Mediterraneo è un hotspot climatico: le precipitazioni calano, le temperature salgono, le falde si svuotano. Quanto investire in desalinizzazione? Basterà l\'efficienza irrigua? Esplora gli scenari.',
    category: 'ambiente',
    tags: ['acqua', 'clima', 'siccità', 'agricoltura', 'Mediterraneo'],
    icon: '💧',
    color: '#10b981',
    period: '2025 — 2045',
    difficulty: 'avanzato',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'water_stress', label: 'Stress idrico', description: 'Indice di stress idrico (0=abbondante, 100=scarsità estrema)', unit: 'indice', color: '#ef4444', type: 'variable', icon: '🔥' },
    { id: 'desalination_capacity', label: 'Desalinizzazione', description: 'Capacità installata in milioni m³/giorno', unit: 'Mm³/g', color: '#3b82f6', type: 'variable', icon: '🏭' },
    { id: 'agricultural_output', label: 'Produzione agricola', description: 'Indice di produzione agricola mediterranea', unit: 'indice', color: '#10b981', type: 'variable', icon: '🌾' },
    { id: 'population_at_risk', label: 'Popolazione a rischio', description: 'Milioni di persone sotto stress idrico elevato', unit: 'milioni', color: '#f59e0b', type: 'variable', icon: '⚠' },
    { id: 'rischio_alimentare', label: 'Rischio alimentare', description: 'Indice di rischio sicurezza alimentare', unit: 'indice', color: '#ef4444', type: 'impact', icon: '🍽' },
    { id: 'conflict_risk', label: 'Rischio conflitto', description: 'Rischio di conflitto idrico transfrontaliero', unit: 'indice', color: '#8b5cf6', type: 'variable', icon: '⚔' },
  ],
  generateSDL,
};

export default scenario;
