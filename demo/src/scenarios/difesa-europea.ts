/**
 * Scenario: Autonomia Strategica Difesa Europea 2025-2038
 * Categoria: Politica
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'us_commitment',
    label: 'Impegno USA/NATO',
    description: 'Livello di impegno degli Stati Uniti verso la NATO e la difesa europea (0=disimpegno, 100=pieno impegno)',
    unit: '%', min: 10, max: 100, step: 5, default: 65,
    source: 'US Congressional NATO support votes + postura esecutiva, 2025',
    format: (v) => `${v}%`,
  },
  {
    id: 'threat_level',
    label: 'Livello minaccia russa',
    description: 'Percezione della minaccia russa secondo le intelligence europee (0=bassa, 100=massima)',
    unit: '%', min: 20, max: 100, step: 5, default: 70,
    source: 'EU INTCEN threat assessment, 2025',
    format: (v) => `${v}%`,
  },
  {
    id: 'eu_cohesion',
    label: 'Coesione politica UE',
    description: 'Tasso di unanimità del Consiglio Europeo sulle decisioni PESC (0=paralisi, 100=unanimità)',
    unit: '%', min: 15, max: 90, step: 5, default: 55,
    source: 'European Council CFSP unanimity rate, 2024',
    format: (v) => `${v}%`,
  },
  {
    id: 'defense_budget',
    label: 'Obiettivo spesa difesa',
    description: 'Obiettivo medio di spesa per la difesa dei membri UE in percentuale del PIL',
    unit: '% PIL', min: 1.5, max: 4.5, step: 0.1, default: 2.5,
    source: 'NATO Defence Expenditure Guidelines; EU Council conclusions',
    format: (v) => `${v.toFixed(1)}% PIL`,
  },
];

const YEARS = [2025, 2027, 2029, 2031, 2033, 2035, 2038];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'defense_spending', baseValues: [1.9, 2.1, 2.3, 2.5, 2.7, 2.9, 3.1],
    sensitivities: { us_commitment: -0.25, threat_level: 0.4, eu_cohesion: 0.15, defense_budget: 0.5 } },
  { name: 'ammo_production', baseValues: [100, 130, 175, 230, 290, 350, 420],
    sensitivities: { us_commitment: -0.1, threat_level: 0.35, eu_cohesion: 0.1, defense_budget: 0.45 } },
  { name: 'us_dependency', baseValues: [55, 52, 48, 43, 38, 33, 28],
    sensitivities: { us_commitment: 0.3, threat_level: -0.1, eu_cohesion: -0.25, defense_budget: -0.15 } },
  { name: 'rapid_deployment', baseValues: [5, 12, 22, 35, 48, 60, 70],
    sensitivities: { us_commitment: -0.1, threat_level: 0.2, eu_cohesion: 0.45, defense_budget: 0.25 } },
  { name: 'cyber_readiness', baseValues: [42, 50, 58, 65, 72, 78, 84],
    sensitivities: { us_commitment: -0.05, threat_level: 0.25, eu_cohesion: 0.2, defense_budget: 0.35 } },
  { name: 'defense_employment', baseValues: [470, 510, 560, 620, 680, 740, 800],
    sensitivities: { us_commitment: -0.05, threat_level: 0.15, eu_cohesion: 0.1, defense_budget: 0.5 } },
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
scenario "Autonomia Strategica Difesa Europea 2025-2038" {
  timeframe: 2025 -> 2038
  resolution: yearly
  confidence: 0.25
  author: "Relatronica — Citizen Lab"
  description: "Traiettorie dell'autonomia strategica difensiva europea: relazioni transatlantiche, percezione minaccia, capacità industriale"
  tags: ["difesa", "europa", "geopolitica", "NATO", "industria"]
  subtitle: "NATO, industria e deterrenza 2025-2038"
  category: "politica"
  icon: "🛡"
  color: "#ef4444"
  difficulty: "avanzato"

  parameter us_commitment {
    label: "Impegno USA/NATO"
    value: ${((vals.us_commitment ?? 65) / 100).toFixed(2)}
    range: [10, 100]
    step: 5
    unit: "%"
    source: "US Congressional NATO support, 2025"
    format: "{value}%"
    control: slider
    description: "Livello di impegno degli Stati Uniti verso la NATO e la difesa europea"
  }
  parameter threat_level {
    label: "Livello minaccia russa"
    value: ${((vals.threat_level ?? 70) / 100).toFixed(2)}
    range: [20, 100]
    step: 5
    unit: "%"
    source: "EU INTCEN assessment, 2025"
    format: "{value}%"
    control: slider
    description: "Percezione della minaccia russa secondo le intelligence europee"
  }
  parameter eu_cohesion {
    label: "Coesione politica UE"
    value: ${((vals.eu_cohesion ?? 55) / 100).toFixed(2)}
    range: [15, 90]
    step: 5
    unit: "%"
    source: "European Council CFSP, 2024"
    format: "{value}%"
    control: slider
    description: "Tasso di unanimità del Consiglio Europeo sulle decisioni PESC"
  }
  parameter defense_budget {
    label: "Obiettivo spesa difesa"
    value: ${vals.defense_budget ?? 2.5}
    range: [1.5, 4.5]
    step: 0.1
    unit: "% PIL"
    source: "NATO Guidelines"
    format: "{value}% PIL"
    control: slider
    description: "Obiettivo medio di spesa per la difesa dei membri UE in percentuale del PIL"
  }

  variable defense_spending {
    description: "Spesa difesa media UE (% PIL)"
    unit: "percentuale PIL"
    label: "Spesa difesa"
    icon: "💰"
    color: "#3b82f6"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.defense_spending[i])}`).join('\n    ')}
    depends_on: threat_level, us_commitment, defense_budget
    uncertainty: normal(±15%)
    interpolation: spline
  }

  variable ammo_production {
    description: "Capacità produzione munizioni UE (2025=100)"
    unit: "indice"
    label: "Produzione munizioni"
    icon: "🏭"
    color: "#f59e0b"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.ammo_production[i])}`).join('\n    ')}
    depends_on: defense_spending
    uncertainty: normal(±20%)
    interpolation: spline
  }

  variable us_dependency {
    description: "Dipendenza da equipaggiamento USA (% procurement)"
    unit: "percentuale"
    label: "Dipendenza USA"
    icon: "🇺🇸"
    color: "#ef4444"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.us_dependency[i])}`).join('\n    ')}
    depends_on: us_commitment, eu_cohesion
    uncertainty: normal(±12%)
    interpolation: linear
  }

  variable rapid_deployment {
    description: "Capacità di schieramento rapido (truppe in 30 giorni)"
    unit: "migliaia"
    label: "Schieramento rapido"
    icon: "⚔"
    color: "#10b981"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.rapid_deployment[i])}`).join('\n    ')}
    depends_on: defense_spending, eu_cohesion
    uncertainty: normal(±25%)
    interpolation: spline
  }

  variable cyber_readiness {
    description: "Prontezza cyber-difesa collettiva UE (0-100)"
    unit: "indice"
    label: "Cyber difesa"
    icon: "🔒"
    color: "#8b5cf6"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.cyber_readiness[i])}`).join('\n    ')}
    depends_on: defense_spending
    uncertainty: normal(±18%)
    interpolation: spline
  }

  variable defense_employment {
    description: "Occupazione industria difesa UE"
    unit: "migliaia"
    label: "Occupazione difesa"
    icon: "👷"
    color: "#10b981"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.defense_employment[i])}`).join('\n    ')}
    depends_on: defense_spending, ammo_production
    uncertainty: normal(±12%)
    interpolation: linear
  }

  impact autonomia_strategica {
    description: "Indice composito autonomia difensiva UE"
    unit: "indice"
    label: "Autonomia strategica"
    icon: "🇪🇺"
    color: "#3b82f6"
    derives_from: us_dependency, rapid_deployment, cyber_readiness
    formula: ((100 - us_dependency) * 0.33) + (rapid_deployment / 80 * 33) + (cyber_readiness * 0.34)
  }

  impact credibilita_deterrenza {
    description: "Indice credibilità di deterrenza UE"
    unit: "indice"
    derives_from: defense_spending, ammo_production, rapid_deployment
    formula: (defense_spending / 3 * 30) + (ammo_production / 500 * 40) + (rapid_deployment / 80 * 30)
  }

  branch "Ritiro USA" when us_commitment < 0.35 {
    probability: 0.15
    variable defense_spending { 2029: ${fmt(v.defense_spending[2] * 1.22)}  2031: ${fmt(v.defense_spending[3] * 1.32)}  2035: ${fmt(v.defense_spending[5] * 1.31)}  uncertainty: normal(±12%) }
    variable us_dependency { 2031: ${fmt(v.us_dependency[3] * 0.74)}  2035: ${fmt(v.us_dependency[5] * 0.45)}  uncertainty: normal(±15%) }
  }

  branch "Esercito europeo" when eu_cohesion > 0.75 and defense_spending > 2.8 {
    probability: 0.10
    variable rapid_deployment { 2031: ${fmt(v.rapid_deployment[3] * 1.29)}  2035: ${fmt(v.rapid_deployment[5] * 1.33)}  2038: ${fmt(v.rapid_deployment[6] * 1.36)}  uncertainty: normal(±15%) }
  }

  branch "Escalation orientale" when threat_level > 0.85 {
    probability: 0.18
    variable defense_spending { 2027: ${fmt(v.defense_spending[1] * 1.19)}  2029: ${fmt(v.defense_spending[2] * 1.3)}  2031: ${fmt(v.defense_spending[3] * 1.4)}  2035: ${fmt(v.defense_spending[5] * 1.38)}  uncertainty: normal(±10%) }
    variable ammo_production { 2029: ${fmt(v.ammo_production[2] * 1.43)}  2031: ${fmt(v.ammo_production[3] * 1.74)}  2035: ${fmt(v.ammo_production[5] * 1.86)}  uncertainty: normal(±20%) }
  }

  simulate { runs: 2000  method: monte_carlo  seed: 2035  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.01 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'difesa-europea',
    title: 'Difesa Autonoma Europea',
    subtitle: 'NATO, industria e deterrenza 2025-2038',
    description: 'L\'Europa può difendersi da sola? Con l\'impegno USA incerto e la minaccia russa alta, esplora come spesa militare, coesione politica e capacità industriale plasmano l\'autonomia strategica europea.',
    category: 'politica',
    tags: ['difesa', 'NATO', 'geopolitica', 'industria', 'Europa'],
    icon: '🛡',
    color: '#ef4444',
    period: '2025 — 2038',
    difficulty: 'avanzato',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'defense_spending', label: 'Spesa difesa', description: 'Spesa media per la difesa dei membri UE in % del PIL', unit: '% PIL', color: '#3b82f6', type: 'variable', icon: '💰' },
    { id: 'ammo_production', label: 'Produzione munizioni', description: 'Capacità produttiva munizioni UE (2025=100)', unit: 'indice', color: '#f59e0b', type: 'variable', icon: '🏭' },
    { id: 'us_dependency', label: 'Dipendenza USA', description: 'Dipendenza da equipaggiamento militare statunitense', unit: '%', color: '#ef4444', type: 'variable', icon: '🇺🇸' },
    { id: 'rapid_deployment', label: 'Schieramento rapido', description: 'Truppe schierabili in 30 giorni (migliaia)', unit: 'migliaia', color: '#10b981', type: 'variable', icon: '⚔' },
    { id: 'autonomia_strategica', label: 'Autonomia strategica', description: 'Indice composito di autonomia difensiva europea', unit: 'indice', color: '#3b82f6', type: 'impact', icon: '🇪🇺' },
    { id: 'cyber_readiness', label: 'Cyber difesa', description: 'Prontezza collettiva di cyber-difesa UE', unit: 'indice', color: '#8b5cf6', type: 'variable', icon: '🔒' },
    { id: 'defense_employment', label: 'Occupazione difesa', description: 'Posti di lavoro diretti nell\'industria della difesa UE', unit: 'migliaia', color: '#10b981', type: 'variable', icon: '👷' },
  ],
  generateSDL,
};

export default scenario;
