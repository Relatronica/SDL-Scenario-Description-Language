/**
 * Scenario: Inverno Demografico Europeo 2025-2060
 * Categoria: Società / Economia
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'fertility_rate',
    label: 'Tasso di fecondità EU',
    description: 'Tasso di fecondità medio EU-27. Attualmente 1.46, servirebbero 2.1 per il ricambio generazionale',
    unit: 'figli/donna', min: 1.0, max: 2.2, step: 0.05, default: 1.46,
    source: 'Eurostat, EU-27 Total Fertility Rate 2024',
    format: (v) => `${v.toFixed(2)}`,
  },
  {
    id: 'net_migration',
    label: 'Immigrazione netta annua',
    description: 'Saldo migratorio netto annuo nell\'UE-27 in migliaia di persone',
    unit: 'migliaia', min: 200, max: 4000, step: 100, default: 1500,
    source: 'Eurostat migration statistics 2024',
    format: (v) => `${v}K/anno`,
  },
  {
    id: 'retirement_age',
    label: 'Età pensionabile media',
    description: 'Età media effettiva di pensionamento nell\'UE',
    unit: 'anni', min: 62, max: 72, step: 0.5, default: 65,
    source: 'European Commission Ageing Report 2024',
    format: (v) => `${v} anni`,
  },
  {
    id: 'productivity_growth',
    label: 'Crescita produttività',
    description: 'Tasso annuo di crescita della produttività del lavoro in percentuale',
    unit: '%', min: 0.2, max: 3.0, step: 0.1, default: 1.2,
    source: 'European Commission Ageing Report 2024; OECD Productivity',
    format: (v) => `${v.toFixed(1)}%`,
  },
];

const YEARS = [2025, 2030, 2035, 2040, 2045, 2050, 2055, 2060];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'total_population', baseValues: [448, 446, 442, 436, 428, 418, 407, 395],
    sensitivities: { fertility_rate: 0.12, net_migration: 0.2, retirement_age: 0.0, productivity_growth: 0.02 } },
  { name: 'working_age_pop', baseValues: [290, 280, 268, 255, 242, 228, 216, 205],
    sensitivities: { fertility_rate: 0.15, net_migration: 0.3, retirement_age: 0.15, productivity_growth: 0.0 } },
  { name: 'dependency_ratio', baseValues: [33, 37, 43, 48, 53, 57, 59, 60],
    sensitivities: { fertility_rate: -0.18, net_migration: -0.15, retirement_age: -0.30, productivity_growth: 0.0 } },
  { name: 'pension_expenditure', baseValues: [12.5, 13.2, 14.1, 15.0, 15.8, 16.4, 16.8, 17.0],
    sensitivities: { fertility_rate: -0.08, net_migration: -0.1, retirement_age: -0.40, productivity_growth: -0.12 } },
  { name: 'gdp_growth', baseValues: [1.4, 1.1, 0.8, 0.5, 0.3, 0.1, -0.1, -0.3],
    sensitivities: { fertility_rate: 0.1, net_migration: 0.2, retirement_age: 0.05, productivity_growth: 0.6 } },
  { name: 'labor_shortage', baseValues: [100, 115, 135, 155, 172, 185, 192, 198],
    sensitivities: { fertility_rate: -0.1, net_migration: -0.35, retirement_age: -0.1, productivity_growth: -0.15 } },
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
    return Math.round(base * (1 + mod) * 100) / 100;
  });
}

const fmt = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(2);

function generateSDL(vals: Record<string, number>): string {
  const v: Record<string, number[]> = {};
  for (const spec of VARS) v[spec.name] = scale(spec, vals);

  return `
scenario "Inverno Demografico Europeo 2025-2060" {
  timeframe: 2025 -> 2060
  resolution: yearly
  confidence: 0.45
  author: "Relatronica — Citizen Lab"
  description: "Proiezioni demografiche EU-27: popolazione, forza lavoro, pensioni e crescita economica"
  tags: ["europa", "demografia", "pensioni", "migrazione", "fiscale"]

  assumption fertility_rate { value: ${vals.fertility_rate ?? 1.46}  source: "Eurostat 2024"  confidence: 0.7  uncertainty: normal(±8%) }
  assumption net_migration { value: ${((vals.net_migration ?? 1500) * 1000)}  source: "Eurostat migration 2024"  confidence: 0.4  uncertainty: triangular(500000, 1500000, 3500000) }
  assumption retirement_age { value: ${vals.retirement_age ?? 65}  source: "EC Ageing Report 2024"  confidence: 0.8  uncertainty: uniform(64, 70) }
  assumption productivity_growth { value: ${((vals.productivity_growth ?? 1.2) / 100).toFixed(3)}  source: "EC Ageing Report 2024"  confidence: 0.5  uncertainty: normal(±30%) }

  variable total_population {
    description: "Popolazione totale EU-27"
    unit: "milioni"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.total_population[i])}`).join('\n    ')}
    depends_on: fertility_rate, net_migration
    uncertainty: normal(±3%)
    interpolation: spline
  }

  variable working_age_pop {
    description: "Popolazione in età lavorativa (15-64)"
    unit: "milioni"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.working_age_pop[i])}`).join('\n    ')}
    depends_on: fertility_rate, net_migration, retirement_age
    uncertainty: normal(±5%)
    interpolation: spline
  }

  variable dependency_ratio {
    description: "Rapporto di dipendenza anziani (65+ / 15-64)"
    unit: "percentuale"
    label: "Indice dipendenza"
    icon: "⚖"
    color: "#ef4444"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.dependency_ratio[i])}`).join('\n    ')}
    depends_on: working_age_pop
    uncertainty: normal(±8%)
    interpolation: spline
  }

  variable pension_expenditure {
    description: "Spesa pensionistica pubblica (% PIL)"
    unit: "percentuale PIL"
    label: "Spesa pensioni / PIL"
    icon: "💰"
    color: "#f59e0b"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.pension_expenditure[i])}`).join('\n    ')}
    depends_on: dependency_ratio, productivity_growth
    uncertainty: normal(±12%)
    interpolation: spline
  }

  variable gdp_growth {
    description: "Tasso di crescita reale PIL EU-27"
    unit: "percentuale"
    label: "Crescita PIL"
    icon: "📈"
    color: "#10b981"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.gdp_growth[i])}`).join('\n    ')}
    depends_on: working_age_pop, productivity_growth
    uncertainty: normal(±25%)
    interpolation: spline
  }

  variable labor_shortage {
    description: "Indice carenza manodopera (2025=100)"
    unit: "indice"
    label: "Carenza manodopera"
    icon: "🔍"
    color: "#8b5cf6"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.labor_shortage[i])}`).join('\n    ')}
    depends_on: working_age_pop, net_migration
    uncertainty: normal(±15%)
    interpolation: spline
  }

  impact pressione_fiscale {
    description: "Aumento spesa pensionistica rispetto al 2025"
    unit: "punti % PIL"
    label: "Pressione aggiuntiva"
    icon: "↑"
    color: "#ef4444"
    derives_from: pension_expenditure
    formula: pension_expenditure - 12.5
  }

  impact declino_forza_lavoro {
    description: "Calo cumulativo della popolazione in età lavorativa"
    unit: "milioni"
    derives_from: working_age_pop
    formula: 290 - working_age_pop
  }

  branch "Apertura migratoria" when net_migration > 2500000 {
    probability: 0.20
    variable working_age_pop { 2035: ${fmt(v.working_age_pop[2] * 1.04)}  2040: ${fmt(v.working_age_pop[3] * 1.06)}  2050: ${fmt(v.working_age_pop[5] * 1.12)}  uncertainty: normal(±6%) }
  }

  branch "Stagnazione secolare" when gdp_growth < 0.3 and dependency_ratio > 50 {
    probability: 0.30
    variable pension_expenditure { 2045: ${fmt(v.pension_expenditure[4] * 1.1)}  2050: ${fmt(v.pension_expenditure[5] * 1.15)}  2060: ${fmt(v.pension_expenditure[7] * 1.25)}  uncertainty: normal(±15%) }
  }

  simulate { runs: 2000  method: monte_carlo  seed: 2050  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.01 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'inverno-demografico-eu',
    title: 'Inverno Demografico Europeo',
    subtitle: 'Popolazione, pensioni e forza lavoro EU 2025-2060',
    description: 'L\'Europa perde 85 milioni di abitanti in età lavorativa entro il 2060. Come reagire? Migrazione, natalità, riforma pensioni e automazione: esplora i futuri possibili.',
    category: 'societa',
    tags: ['demografia', 'pensioni', 'migrazione', 'EU', 'invecchiamento'],
    icon: '🧓',
    color: '#8b5cf6',
    period: '2025 — 2060',
    difficulty: 'intermedio',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'total_population', label: 'Popolazione EU', description: 'Popolazione totale EU-27 in milioni', unit: 'milioni', color: '#3b82f6', type: 'variable', icon: '👥' },
    { id: 'working_age_pop', label: 'Forza lavoro', description: 'Popolazione 15-64 anni in milioni', unit: 'milioni', color: '#10b981', type: 'variable', icon: '👷' },
    { id: 'dependency_ratio', label: 'Indice dipendenza', description: 'Rapporto anziani 65+ su popolazione attiva', unit: '%', color: '#ef4444', type: 'variable', icon: '⚖' },
    { id: 'pension_expenditure', label: 'Spesa pensioni / PIL', description: 'Spesa pensionistica pubblica come percentuale del PIL', unit: '% PIL', color: '#f59e0b', type: 'variable', icon: '💰' },
    { id: 'pressione_fiscale', label: 'Pressione aggiuntiva', description: 'Punti % di PIL aggiuntivi per le pensioni rispetto al 2025', unit: 'pp PIL', color: '#ef4444', type: 'impact', icon: '↑' },
    { id: 'gdp_growth', label: 'Crescita PIL', description: 'Tasso di crescita reale annuo del PIL EU', unit: '%', color: '#10b981', type: 'variable', icon: '📈' },
    { id: 'labor_shortage', label: 'Carenza manodopera', description: 'Indice di severità della carenza di manodopera', unit: 'indice', color: '#8b5cf6', type: 'variable', icon: '🔍' },
  ],
  generateSDL,
};

export default scenario;
