/**
 * Scenario: Demografia e Pensioni in Italia 2025-2050
 * Categoria: Società / Economia
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'fertility_rate',
    label: 'Tasso di fecondità',
    description: 'Numero medio di figli per donna. L\'Italia è a 1.24, tra i più bassi al mondo. Servono 2.1 per il ricambio generazionale',
    unit: 'figli/donna', min: 0.9, max: 2.2, step: 0.05, default: 1.24,
    source: 'ISTAT Indicatori demografici 2024; Eurostat',
    format: (v) => `${v.toFixed(2)}`,
  },
  {
    id: 'immigration_net',
    label: 'Immigrazione netta annua',
    description: 'Differenza tra ingressi e uscite di residenti stranieri per anno',
    unit: 'migliaia', min: 50, max: 500, step: 10, default: 230,
    source: 'ISTAT Bilancio demografico 2024; Ministero Interno',
    format: (v) => `${v}K/anno`,
  },
  {
    id: 'retirement_age',
    label: 'Età pensionabile media',
    description: 'Età media effettiva di pensionamento, considerando tutte le forme previdenziali',
    unit: 'anni', min: 62, max: 72, step: 0.5, default: 64,
    source: 'INPS Rapporto Annuale 2024; Ragioneria dello Stato',
    format: (v) => `${v} anni`,
  },
  {
    id: 'health_spending',
    label: 'Spesa sanitaria pubblica',
    description: 'Spesa sanitaria pubblica in rapporto al PIL. Italia: 6.8% vs media OECD: 7.5%',
    unit: '% PIL', min: 5, max: 10, step: 0.1, default: 6.8,
    source: 'OECD Health at a Glance 2024; MEF DEF 2024',
    format: (v) => `${v.toFixed(1)}% PIL`,
  },
];

const YEARS = [2025, 2030, 2035, 2040, 2045, 2050];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'popolazione_totale', baseValues: [59.0, 58.2, 57.0, 55.5, 53.8, 52.0],
    sensitivities: { fertility_rate: 0.15, immigration_net: 0.25, retirement_age: 0.0, health_spending: 0.05 } },
  { name: 'indice_dipendenza', baseValues: [37, 42, 48, 55, 62, 68],
    sensitivities: { fertility_rate: -0.2, immigration_net: -0.15, retirement_age: -0.35, health_spending: 0.0 } },
  { name: 'spesa_pensioni_pil', baseValues: [16.0, 16.8, 17.5, 18.5, 19.2, 20.0],
    sensitivities: { fertility_rate: -0.1, immigration_net: -0.12, retirement_age: -0.45, health_spending: 0.0 } },
  { name: 'aspettativa_vita', baseValues: [83.6, 84.2, 84.8, 85.3, 85.8, 86.2],
    sensitivities: { fertility_rate: 0.0, immigration_net: 0.0, retirement_age: 0.0, health_spending: 0.15 } },
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
scenario "Demografia e Pensioni Italia 2025-2050" {
  timeframe: 2025 -> 2050
  resolution: yearly
  confidence: 0.50
  author: "Relatronica — Citizen Lab"
  description: "Proiezioni demografiche e sostenibilità del sistema pensionistico italiano"
  tags: ["italia", "demografia", "pensioni", "invecchiamento", "immigrazione"]
  subtitle: "Popolazione, invecchiamento e welfare 2025-2050"
  category: "societa"
  icon: "👥"
  color: "#8b5cf6"
  difficulty: "intermedio"

  parameter fertility_rate {
    label: "Tasso di fecondità"
    value: ${vals.fertility_rate ?? 1.24}
    range: [0.9, 2.2]
    step: 0.05
    unit: "figli/donna"
    source: "ISTAT 2024"
    format: "{value}"
    control: slider
    description: "Numero medio di figli per donna"
  }
  parameter immigration_net {
    label: "Immigrazione netta annua"
    value: ${vals.immigration_net ?? 230}
    range: [50, 500]
    step: 10
    unit: "migliaia"
    source: "ISTAT Bilancio demografico"
    format: "{value}K/anno"
    control: slider
    description: "Differenza tra ingressi e uscite di residenti stranieri per anno"
  }
  parameter retirement_age {
    label: "Età pensionabile media"
    value: ${vals.retirement_age ?? 64}
    range: [62, 72]
    step: 0.5
    unit: "anni"
    source: "INPS 2024"
    format: "{value} anni"
    control: slider
    description: "Età media effettiva di pensionamento"
  }
  parameter health_spending {
    label: "Spesa sanitaria pubblica"
    value: ${vals.health_spending ?? 6.8}
    range: [5, 10]
    step: 0.1
    unit: "% PIL"
    source: "OECD Health 2024"
    format: "{value}% PIL"
    control: slider
    description: "Spesa sanitaria pubblica in rapporto al PIL"
  }

  variable popolazione_totale {
    description: "Popolazione residente in Italia"
    unit: "milioni"
    label: "Popolazione"
    icon: "👥"
    color: "#3b82f6"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.popolazione_totale[i])}`).join('\n    ')}
    depends_on: fertility_rate, immigration_net
    uncertainty: normal(±5%)
    interpolation: spline
  }

  variable indice_dipendenza {
    description: "Rapporto anziani (65+) su popolazione attiva (15-64)"
    unit: "percentuale"
    label: "Indice di dipendenza"
    icon: "⚖"
    color: "#ef4444"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.indice_dipendenza[i])}`).join('\n    ')}
    depends_on: fertility_rate, immigration_net, retirement_age
    uncertainty: normal(±10%)
    interpolation: spline
  }

  variable spesa_pensioni_pil {
    description: "Spesa pensionistica in rapporto al PIL"
    unit: "percentuale PIL"
    label: "Spesa pensioni / PIL"
    icon: "💰"
    color: "#f59e0b"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.spesa_pensioni_pil[i])}`).join('\n    ')}
    depends_on: fertility_rate, immigration_net, retirement_age
    uncertainty: normal(±12%)
    interpolation: spline
  }

  variable aspettativa_vita {
    description: "Aspettativa di vita alla nascita"
    unit: "anni"
    label: "Aspettativa di vita"
    icon: "❤"
    color: "#10b981"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.aspettativa_vita[i])}`).join('\n    ')}
    depends_on: health_spending
    uncertainty: normal(±3%)
    interpolation: spline
  }

  impact pressione_fiscale_previdenza {
    description: "Differenza di spesa pensionistica rispetto al 2025"
    unit: "punti % PIL"
    label: "Pressione aggiuntiva"
    icon: "↑"
    color: "#ef4444"
    derives_from: spesa_pensioni_pil
    formula: spesa_pensioni_pil - 16
  }

  branch "Baby boom" when fertility_rate > 1.8 {
    probability: 0.10
    variable popolazione_totale { 2040: ${fmt(v.popolazione_totale[3] * 1.05)}  2045: ${fmt(v.popolazione_totale[4] * 1.08)}  2050: ${fmt(v.popolazione_totale[5] * 1.12)}  uncertainty: normal(±5%) }
  }

  branch "Riforma pensioni forte" when retirement_age > 68 {
    probability: 0.30
    variable spesa_pensioni_pil { 2040: ${fmt(v.spesa_pensioni_pil[3] * 0.88)}  2045: ${fmt(v.spesa_pensioni_pil[4] * 0.85)}  2050: ${fmt(v.spesa_pensioni_pil[5] * 0.82)}  uncertainty: normal(±10%) }
  }

  simulate { runs: 2000  method: monte_carlo  seed: 42  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.01 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'demografia',
    title: 'Demografia e Pensioni',
    subtitle: 'Popolazione, invecchiamento e welfare 2025-2050',
    description: 'L\'Italia invecchia: nel 2050 gli ultra-65enni saranno il 35% della popolazione. Come influiranno natalità, immigrazione e riforme pensionistiche sulla sostenibilità del welfare?',
    category: 'societa',
    tags: ['demografia', 'pensioni', 'natalità', 'immigrazione', 'welfare'],
    icon: '👥',
    color: '#8b5cf6',
    period: '2025 — 2050',
    difficulty: 'intermedio',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'popolazione_totale', label: 'Popolazione', description: 'Popolazione residente in Italia in milioni', unit: 'milioni', color: '#3b82f6', type: 'variable', icon: '👥' },
    { id: 'indice_dipendenza', label: 'Indice di dipendenza', description: 'Rapporto percentuale tra over-65 e popolazione in età lavorativa', unit: '%', color: '#ef4444', type: 'variable', icon: '⚖' },
    { id: 'spesa_pensioni_pil', label: 'Spesa pensioni / PIL', description: 'Quota del PIL destinata alla spesa pensionistica', unit: '% PIL', color: '#f59e0b', type: 'variable', icon: '💰' },
    { id: 'pressione_fiscale_previdenza', label: 'Pressione aggiuntiva', description: 'Punti % di PIL aggiuntivi per le pensioni rispetto al 2025', unit: 'pp PIL', color: '#ef4444', type: 'impact', icon: '↑' },
    { id: 'aspettativa_vita', label: 'Aspettativa di vita', description: 'Aspettativa di vita alla nascita in anni', unit: 'anni', color: '#10b981', type: 'variable', icon: '❤' },
  ],
  generateSDL,
};

export default scenario;
