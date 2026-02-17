/**
 * Scenario: AI e Lavoro in Italia 2025-2035
 * Categoria: Tecnologia / Economia
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'ai_adoption_rate',
    label: 'Velocità di adozione AI',
    description: 'Percentuale annua di aziende italiane che adottano sistemi AI nei processi produttivi',
    unit: '%', min: 3, max: 35, step: 1, default: 14,
    source: 'ISTAT Imprese e ICT, 2024; OECD AI adoption estimates',
    format: (v) => `${v}%`,
  },
  {
    id: 'training_investment',
    label: 'Investimento in riqualificazione',
    description: 'Spesa pubblica + privata annua per formazione digitale e riconversione professionale',
    unit: 'miliardi €', min: 1, max: 25, step: 0.5, default: 5,
    source: 'PNRR Componente M1C1 Digitalizzazione; Fondi europei FSE+',
    format: (v) => `${v} mld €`,
  },
  {
    id: 'regulation_level',
    label: 'Livello di regolamentazione AI',
    description: 'Intensità della regolamentazione: 0 = nessuna, 100 = restrizioni massime (stile EU AI Act pieno)',
    unit: '%', min: 0, max: 100, step: 5, default: 50,
    source: 'EU AI Act (Reg. 2024/1689); AgID linee guida AI nella PA',
    format: (v) => `${v}%`,
  },
  {
    id: 'tech_progress',
    label: 'Velocità progresso AI',
    description: 'Quanto velocemente migliorano le capacità AI (crescita potenza di calcolo e modelli)',
    unit: 'fattore', min: 5, max: 50, step: 1, default: 22,
    source: 'Epoch AI compute tracking; Our World in Data AI index',
    format: (v) => `${(v / 100).toFixed(2)}x/anno`,
  },
];

const YEARS = [2025, 2027, 2029, 2031, 2033, 2035];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'posti_lavoro_a_rischio', baseValues: [0.8, 1.6, 2.8, 4.0, 4.8, 5.5],
    sensitivities: { ai_adoption_rate: 0.7, training_investment: -0.15, regulation_level: -0.35, tech_progress: 0.55 } },
  { name: 'nuovi_posti_digitali', baseValues: [0.2, 0.6, 1.2, 2.0, 2.8, 3.6],
    sensitivities: { ai_adoption_rate: 0.4, training_investment: 0.65, regulation_level: -0.1, tech_progress: 0.3 } },
  { name: 'indice_competenze_digitali', baseValues: [36, 40, 47, 54, 61, 68],
    sensitivities: { ai_adoption_rate: 0.1, training_investment: 0.6, regulation_level: 0.05, tech_progress: 0.15 } },
  { name: 'impatto_pil', baseValues: [5, 18, 40, 68, 100, 135],
    sensitivities: { ai_adoption_rate: 0.55, training_investment: 0.25, regulation_level: -0.15, tech_progress: 0.45 } },
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
    return Math.max(0, Math.round(base * (1 + mod) * 100) / 100);
  });
}

const fmt = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(2);

function generateSDL(vals: Record<string, number>): string {
  const v: Record<string, number[]> = {};
  for (const spec of VARS) v[spec.name] = scale(spec, vals);
  const adoption = vals.ai_adoption_rate ?? 14;
  const training = vals.training_investment ?? 5;
  const regulation = vals.regulation_level ?? 50;
  const techProgress = vals.tech_progress ?? 22;

  return `
scenario "AI e Lavoro in Italia 2025-2035" {
  timeframe: 2025 -> 2035
  resolution: yearly
  confidence: 0.45
  author: "Relatronica — Citizen Lab"
  version: "1.0"
  description: "Simulazione dell'impatto dell'AI sul mercato del lavoro italiano"
  tags: ["italia", "ai", "lavoro", "automazione", "formazione"]
  subtitle: "Automazione, occupazione e competenze 2025-2035"
  category: "tecnologia"
  icon: "🤖"
  color: "#3b82f6"
  difficulty: "base"

  parameter ai_adoption_rate {
    label: "Velocità di adozione AI"
    value: ${adoption}
    range: [3, 35]
    step: 1
    unit: "%"
    source: "ISTAT Imprese e ICT, 2024; OECD AI adoption estimates"
    format: "{value}%"
    control: slider
    description: "Percentuale annua di aziende italiane che adottano sistemi AI nei processi produttivi"
  }
  parameter training_investment {
    label: "Investimento in riqualificazione"
    value: ${training * 1e9}
    range: [1, 25]
    step: 0.5
    unit: "miliardi €"
    source: "PNRR Componente M1C1 Digitalizzazione; Fondi europei FSE+"
    format: "{value} mld €"
    control: slider
    description: "Spesa pubblica + privata annua per formazione digitale e riconversione professionale"
  }
  parameter regulation_level {
    label: "Livello di regolamentazione AI"
    value: ${(regulation / 100).toFixed(2)}
    range: [0, 100]
    step: 5
    unit: "%"
    source: "EU AI Act (Reg. 2024/1689); AgID linee guida AI nella PA"
    format: "{value}%"
    control: slider
    description: "Intensità della regolamentazione: 0 = nessuna, 100 = restrizioni massime (stile EU AI Act pieno)"
  }
  parameter tech_progress {
    label: "Velocità progresso AI"
    value: ${(techProgress / 100).toFixed(2)}
    range: [5, 50]
    step: 1
    unit: "fattore"
    source: "Epoch AI compute tracking; Our World in Data AI index"
    format: "{value}"
    control: slider
    description: "Quanto velocemente migliorano le capacità AI (crescita potenza di calcolo e modelli)"
  }

  variable posti_lavoro_a_rischio {
    label: "Posti di lavoro a rischio"
    description: "Posti di lavoro a rischio automazione"
    unit: "milioni"
    icon: "⚠"
    color: "#ef4444"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.posti_lavoro_a_rischio[i])}`).join('\n    ')}
    depends_on: ai_adoption_rate, tech_progress, regulation_level
    uncertainty: normal(±18%)
    interpolation: spline
  }

  variable nuovi_posti_digitali {
    label: "Nuovi posti digitali"
    description: "Nuovi posti di lavoro digitali"
    unit: "milioni"
    icon: "✦"
    color: "#10b981"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.nuovi_posti_digitali[i])}`).join('\n    ')}
    depends_on: training_investment, ai_adoption_rate
    uncertainty: normal(±20%)
    interpolation: spline
  }

  variable indice_competenze_digitali {
    label: "Competenze digitali"
    description: "Indice competenze digitali DESI (0-100)"
    unit: "indice"
    icon: "◈"
    color: "#8b5cf6"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.indice_competenze_digitali[i])}`).join('\n    ')}
    depends_on: training_investment
    uncertainty: normal(±10%)
    interpolation: spline
  }

  variable impatto_pil {
    label: "Impatto sul PIL"
    description: "Contributo AI al PIL italiano"
    unit: "miliardi EUR"
    icon: "◆"
    color: "#f59e0b"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.impatto_pil[i])}`).join('\n    ')}
    depends_on: ai_adoption_rate, nuovi_posti_digitali, indice_competenze_digitali
    uncertainty: normal(±22%)
    interpolation: spline
  }

  impact bilancio_netto_occupazione {
    label: "Bilancio netto occupazione"
    description: "Bilancio netto: nuovi posti meno posti a rischio"
    unit: "milioni"
    icon: "⊕"
    color: "#3b82f6"
    derives_from: nuovi_posti_digitali, posti_lavoro_a_rischio
    formula: nuovi_posti_digitali - posti_lavoro_a_rischio
  }

  branch "Regolamentazione forte" when regulation_level > 0.7 {
    probability: 0.40
    variable posti_lavoro_a_rischio { 2031: ${fmt(v.posti_lavoro_a_rischio[3] * 0.7)}  2033: ${fmt(v.posti_lavoro_a_rischio[4] * 0.65)}  2035: ${fmt(v.posti_lavoro_a_rischio[5] * 0.6)}  uncertainty: normal(±12%) }
  }

  branch "Boom formazione" when training_investment > 15000000000 {
    probability: 0.35
    variable nuovi_posti_digitali { 2031: ${fmt(v.nuovi_posti_digitali[3] * 1.4)}  2033: ${fmt(v.nuovi_posti_digitali[4] * 1.5)}  2035: ${fmt(v.nuovi_posti_digitali[5] * 1.6)}  uncertainty: normal(±18%) }
    variable indice_competenze_digitali { 2031: ${fmt(Math.min(100, v.indice_competenze_digitali[3] * 1.2))}  2033: ${fmt(Math.min(100, v.indice_competenze_digitali[4] * 1.25))}  2035: ${fmt(Math.min(100, v.indice_competenze_digitali[5] * 1.3))}  uncertainty: normal(±8%) }
  }

  branch "Accelerazione tecnologica" when tech_progress > 0.4 {
    probability: 0.15
    variable posti_lavoro_a_rischio { 2031: ${fmt(v.posti_lavoro_a_rischio[3] * 1.3)}  2033: ${fmt(v.posti_lavoro_a_rischio[4] * 1.5)}  2035: ${fmt(v.posti_lavoro_a_rischio[5] * 1.7)}  uncertainty: normal(±30%) }
    variable impatto_pil { 2031: ${fmt(v.impatto_pil[3] * 1.3)}  2033: ${fmt(v.impatto_pil[4] * 1.5)}  2035: ${fmt(v.impatto_pil[5] * 1.7)}  uncertainty: normal(±25%) }
  }

  simulate { runs: 2000  method: monte_carlo  seed: 42  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.01 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'ai-lavoro',
    title: 'AI e Lavoro in Italia',
    subtitle: 'Automazione, occupazione e competenze 2025-2035',
    description: 'Come cambierà il mercato del lavoro italiano con l\'intelligenza artificiale? Esplora l\'impatto su occupazione, nuovi posti digitali, competenze e PIL.',
    category: 'tecnologia',
    tags: ['ai', 'lavoro', 'automazione', 'PNRR', 'competenze'],
    icon: '🤖',
    color: '#3b82f6',
    period: '2025 — 2035',
    difficulty: 'base',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'posti_lavoro_a_rischio', label: 'Posti di lavoro a rischio', description: 'Milioni di posti esposti all\'automazione da sistemi AI', unit: 'milioni', color: '#ef4444', type: 'variable', icon: '⚠' },
    { id: 'nuovi_posti_digitali', label: 'Nuovi posti digitali', description: 'Nuovi posti di lavoro nei settori digitali, AI e tech', unit: 'milioni', color: '#10b981', type: 'variable', icon: '✦' },
    { id: 'bilancio_netto_occupazione', label: 'Bilancio netto occupazione', description: 'Differenza tra posti creati e posti a rischio', unit: 'milioni', color: '#3b82f6', type: 'impact', icon: '⊕' },
    { id: 'indice_competenze_digitali', label: 'Competenze digitali', description: 'Indice DESI delle competenze digitali (0-100)', unit: 'indice', color: '#8b5cf6', type: 'variable', icon: '◈' },
    { id: 'impatto_pil', label: 'Impatto sul PIL', description: 'Contributo dell\'AI al PIL italiano in miliardi di euro', unit: 'mld €', color: '#f59e0b', type: 'variable', icon: '◆' },
  ],
  generateSDL,
};

export default scenario;
