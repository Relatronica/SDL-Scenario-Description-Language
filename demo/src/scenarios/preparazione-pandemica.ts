/**
 * Scenario: Preparazione Pandemica Globale 2025-2040
 * Categoria: Società
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'surveillance_coverage',
    label: 'Copertura sorveglianza',
    description: 'Percentuale della popolazione mondiale coperta da sorveglianza genomica dei patogeni',
    unit: '%', min: 10, max: 85, step: 5, default: 35,
    source: 'WHO Global Genomic Surveillance Strategy, 2024',
    format: (v) => `${v}%`,
  },
  {
    id: 'vaccine_investment',
    label: 'Investimenti vaccini',
    description: 'Investimento annuo globale in piattaforme vaccinali rapide (miliardi USD)',
    unit: 'miliardi $', min: 2, max: 30, step: 1, default: 8,
    source: 'CEPI 100-Day Mission; G20 Pandemic Fund',
    format: (v) => `${v} mld $`,
  },
  {
    id: 'amr_control',
    label: 'Contrasto AMR',
    description: 'Livello di investimento nel contrasto alla resistenza antimicrobica (0=minimo, 100=massimo)',
    unit: '%', min: 10, max: 100, step: 5, default: 40,
    source: 'WHO Global Action Plan on AMR; GARDP',
    format: (v) => `${v}%`,
  },
  {
    id: 'health_funding',
    label: 'Fondi sicurezza sanitaria',
    description: 'Finanziamento annuo globale per la sicurezza sanitaria in miliardi USD',
    unit: 'miliardi $', min: 10, max: 80, step: 5, default: 31,
    source: 'G20 Pandemic Fund + bilaterale, 2025',
    format: (v) => `${v} mld $`,
  },
];

const YEARS = [2025, 2027, 2029, 2031, 2033, 2035, 2040];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'genomic_surveillance', baseValues: [18, 25, 34, 44, 54, 62, 75],
    sensitivities: { surveillance_coverage: 0.65, vaccine_investment: 0.05, amr_control: 0.0, health_funding: 0.25 } },
  { name: 'vaccine_response_time', baseValues: [300, 250, 200, 160, 130, 100, 70],
    sensitivities: { surveillance_coverage: -0.1, vaccine_investment: -0.55, amr_control: 0.0, health_funding: -0.15 } },
  { name: 'amr_deaths', baseValues: [1.3, 1.5, 1.8, 2.1, 2.5, 2.9, 4.0],
    sensitivities: { surveillance_coverage: -0.05, vaccine_investment: 0.0, amr_control: -0.55, health_funding: -0.1 } },
  { name: 'pandemic_gdp_risk', baseValues: [0.8, 0.7, 0.6, 0.5, 0.4, 0.35, 0.25],
    sensitivities: { surveillance_coverage: -0.3, vaccine_investment: -0.35, amr_control: -0.05, health_funding: -0.2 } },
  { name: 'detection_time', baseValues: [45, 38, 30, 23, 18, 14, 8],
    sensitivities: { surveillance_coverage: -0.6, vaccine_investment: -0.05, amr_control: 0.0, health_funding: -0.2 } },
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
    return Math.max(0, Math.round(base * (1 + mod) * 1000) / 1000);
  });
}

const fmt = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(2);

function generateSDL(vals: Record<string, number>): string {
  const v: Record<string, number[]> = {};
  for (const spec of VARS) v[spec.name] = scale(spec, vals);

  return `
scenario "Preparazione Pandemica Globale 2025-2040" {
  timeframe: 2025 -> 2040
  resolution: yearly
  confidence: 0.30
  author: "Relatronica — Citizen Lab"
  description: "Sorveglianza genomica, velocità vaccini, AMR e impatto economico delle pandemie"
  tags: ["salute", "pandemia", "globale", "biosicurezza", "AMR"]
  subtitle: "Sorveglianza, vaccini e AMR 2025-2040"
  category: "societa"
  icon: "🦠"
  color: "#8b5cf6"
  difficulty: "intermedio"

  parameter surveillance_coverage {
    label: "Copertura sorveglianza"
    value: ${(vals.surveillance_coverage ?? 35) / 100}
    range: [10, 85]
    step: 5
    unit: "%"
    source: "WHO 2024"
    format: "{value}%"
    control: slider
    description: "Percentuale della popolazione mondiale coperta da sorveglianza genomica dei patogeni"
  }
  parameter vaccine_investment {
    label: "Investimenti vaccini"
    value: ${(vals.vaccine_investment ?? 8) * 1e9}
    range: [2, 30]
    step: 1
    unit: "miliardi $"
    source: "CEPI + G20 Pandemic Fund"
    format: "{value} mld $"
    control: slider
    description: "Investimento annuo globale in piattaforme vaccinali rapide (miliardi USD)"
  }
  parameter amr_control {
    label: "Contrasto AMR"
    value: ${((vals.amr_control ?? 40) / 100).toFixed(2)}
    range: [10, 100]
    step: 5
    unit: "%"
    source: "WHO AMR Action Plan"
    format: "{value}%"
    control: slider
    description: "Livello di investimento nel contrasto alla resistenza antimicrobica (0=minimo, 100=massimo)"
  }
  parameter health_funding {
    label: "Fondi sicurezza sanitaria"
    value: ${(vals.health_funding ?? 31) * 1e9}
    range: [10, 80]
    step: 5
    unit: "miliardi $"
    source: "G20 + bilaterale, 2025"
    format: "{value} mld $"
    control: slider
    description: "Finanziamento annuo globale per la sicurezza sanitaria in miliardi USD"
  }

  variable genomic_surveillance {
    description: "Copertura sorveglianza genomica globale"
    unit: "percentuale"
    label: "Sorveglianza genomica"
    icon: "🔬"
    color: "#3b82f6"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.genomic_surveillance[i])}`).join('\n    ')}
    depends_on: surveillance_coverage, health_funding
    uncertainty: normal(±18%)
    interpolation: spline
  }

  variable vaccine_response_time {
    description: "Giorni da identificazione patogeno a vaccino su scala"
    unit: "giorni"
    label: "Tempo risposta vaccino"
    icon: "💉"
    color: "#10b981"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.vaccine_response_time[i])}`).join('\n    ')}
    depends_on: vaccine_investment
    uncertainty: normal(±20%)
    interpolation: spline
  }

  variable amr_deaths {
    description: "Decessi annuali per resistenza antimicrobica (milioni)"
    unit: "milioni"
    label: "Decessi AMR"
    icon: "☠"
    color: "#ef4444"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.amr_deaths[i])}`).join('\n    ')}
    depends_on: amr_control
    uncertainty: lognormal(0.1, 0.3)
    interpolation: spline
  }

  variable pandemic_gdp_risk {
    description: "Perdita PIL attesa annua da rischio pandemico (%)"
    unit: "percentuale"
    label: "Rischio PIL pandemico"
    icon: "📉"
    color: "#f59e0b"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.pandemic_gdp_risk[i])}`).join('\n    ')}
    depends_on: genomic_surveillance, vaccine_response_time
    uncertainty: lognormal(-1.2, 0.6)
    interpolation: spline
  }

  variable detection_time {
    description: "Giorni medi per rilevare un nuovo focolaio"
    unit: "giorni"
    label: "Tempo rilevamento"
    icon: "⏱"
    color: "#8b5cf6"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.detection_time[i])}`).join('\n    ')}
    depends_on: genomic_surveillance
    uncertainty: lognormal(2.5, 0.5)
    interpolation: spline
  }

  impact indice_preparazione {
    description: "Score composito di preparazione pandemica (0-100)"
    unit: "indice"
    label: "Indice preparazione"
    icon: "🛡"
    color: "#10b981"
    derives_from: genomic_surveillance, vaccine_response_time
    formula: (genomic_surveillance * 0.5) + ((300 - vaccine_response_time) / 300 * 50)
  }

  impact resilienza_economica {
    description: "Guadagno di resilienza economica"
    unit: "percentuale"
    derives_from: pandemic_gdp_risk
    formula: 0.8 - pandemic_gdp_risk
  }

  branch "Pandemia X" when pandemic_gdp_risk > 0.5 {
    probability: 0.12
    variable pandemic_gdp_risk { 2029: ${fmt(v.pandemic_gdp_risk[2] * 7)}  2031: ${fmt(v.pandemic_gdp_risk[3] * 3)}  2033: ${fmt(v.pandemic_gdp_risk[4] * 1.5)}  uncertainty: lognormal(0.5, 0.8) }
  }

  branch "Vaccino in 100 giorni" when vaccine_response_time < 120 {
    probability: 0.30
    variable pandemic_gdp_risk { 2033: ${fmt(v.pandemic_gdp_risk[4] * 0.5)}  2035: ${fmt(v.pandemic_gdp_risk[5] * 0.4)}  2040: ${fmt(v.pandemic_gdp_risk[6] * 0.4)}  uncertainty: normal(±25%) }
  }

  branch "Crisi AMR" when amr_deaths > 3 {
    probability: 0.22
    variable amr_deaths { 2035: ${fmt(v.amr_deaths[5] * 1.55)}  2040: ${fmt(v.amr_deaths[6] * 2.1)}  uncertainty: lognormal(1.0, 0.5) }
  }

  simulate { runs: 2000  method: monte_carlo  seed: 2035  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.01 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'preparazione-pandemica',
    title: 'Preparazione Pandemica',
    subtitle: 'Sorveglianza, vaccini e AMR 2025-2040',
    description: 'Quanto siamo preparati alla prossima pandemia? Esplora come sorveglianza genomica, piattaforme vaccinali rapide e contrasto alla resistenza antimicrobica possono salvare milioni di vite e punti di PIL.',
    category: 'societa',
    tags: ['salute', 'pandemia', 'vaccini', 'AMR', 'sorveglianza'],
    icon: '🦠',
    color: '#8b5cf6',
    period: '2025 — 2040',
    difficulty: 'intermedio',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'genomic_surveillance', label: 'Sorveglianza genomica', description: 'Copertura della popolazione mondiale sotto sorveglianza genomica', unit: '%', color: '#3b82f6', type: 'variable', icon: '🔬' },
    { id: 'vaccine_response_time', label: 'Tempo risposta vaccino', description: 'Giorni da identificazione patogeno a vaccino disponibile', unit: 'giorni', color: '#10b981', type: 'variable', icon: '💉' },
    { id: 'amr_deaths', label: 'Decessi AMR', description: 'Decessi annuali globali per resistenza antimicrobica', unit: 'milioni', color: '#ef4444', type: 'variable', icon: '☠' },
    { id: 'pandemic_gdp_risk', label: 'Rischio PIL pandemico', description: 'Perdita annua di PIL attesa da rischio pandemico', unit: '%', color: '#f59e0b', type: 'variable', icon: '📉' },
    { id: 'indice_preparazione', label: 'Indice preparazione', description: 'Score composito di preparazione pandemica globale', unit: 'indice', color: '#10b981', type: 'impact', icon: '🛡' },
    { id: 'detection_time', label: 'Tempo rilevamento', description: 'Giorni medi per rilevare un nuovo focolaio epidemico', unit: 'giorni', color: '#8b5cf6', type: 'variable', icon: '⏱' },
  ],
  generateSDL,
};

export default scenario;
