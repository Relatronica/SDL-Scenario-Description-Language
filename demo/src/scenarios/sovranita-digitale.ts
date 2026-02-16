/**
 * Scenario: Sovranità Digitale Europea 2025-2035
 * Categoria: Politica / Tecnologia
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'eu_cloud_investment',
    label: 'Investimento in cloud EU',
    description: 'Investimento annuo in infrastruttura cloud e data center europei (IPCEI, Gaia-X, fondi nazionali)',
    unit: 'miliardi €', min: 2, max: 40, step: 1, default: 10,
    source: 'Commissione UE Digital Decade 2030; IPCEI Cloud',
    format: (v) => `${v} mld €`,
  },
  {
    id: 'data_localization',
    label: 'Localizzazione dati',
    description: 'Percentuale di dati europei processati su infrastrutture europee. Oggi circa 20%',
    unit: '%', min: 10, max: 90, step: 5, default: 20,
    source: 'ENISA Data Flow Report 2024; Eurostat Digital Economy',
    format: (v) => `${v}%`,
  },
  {
    id: 'open_source_adoption',
    label: 'Adozione open source nella PA',
    description: 'Percentuale di PA europee che usano software open source per sistemi critici',
    unit: '%', min: 5, max: 80, step: 5, default: 25,
    source: 'OSOR EU Observatory 2024; AgID Piano Triennale IT',
    format: (v) => `${v}%`,
  },
  {
    id: 'digital_regulation_strength',
    label: 'Forza regolamentazione digitale',
    description: 'Intensità dell\'applicazione di DSA, DMA, AI Act, Data Act (0=debole, 100=massima)',
    unit: 'indice', min: 10, max: 100, step: 5, default: 55,
    source: 'DG CONNECT enforcement reports; DSA Transparency DB',
    format: (v) => `${v}/100`,
  },
];

const YEARS = [2025, 2027, 2029, 2031, 2033, 2035];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'indice_sovranita_digitale', baseValues: [22, 28, 35, 43, 52, 60],
    sensitivities: { eu_cloud_investment: 0.35, data_localization: 0.3, open_source_adoption: 0.2, digital_regulation_strength: 0.15 } },
  { name: 'dipendenza_big_tech', baseValues: [78, 72, 65, 57, 50, 42],
    sensitivities: { eu_cloud_investment: -0.2, data_localization: -0.3, open_source_adoption: -0.25, digital_regulation_strength: -0.15 } },
  { name: 'mercato_cloud_eu', baseValues: [12, 18, 28, 42, 58, 78],
    sensitivities: { eu_cloud_investment: 0.55, data_localization: 0.25, open_source_adoption: 0.15, digital_regulation_strength: 0.1 } },
  { name: 'posti_lavoro_tech_eu', baseValues: [1.2, 1.5, 1.9, 2.4, 3.0, 3.6],
    sensitivities: { eu_cloud_investment: 0.45, data_localization: 0.15, open_source_adoption: 0.2, digital_regulation_strength: -0.05 } },
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
scenario "Sovranita Digitale Europea 2025-2035" {
  timeframe: 2025 -> 2035
  resolution: yearly
  confidence: 0.35
  author: "Relatronica — Citizen Lab"
  description: "L'Europa puo' costruire una propria autonomia tecnologica? Cloud, dati, open source e regolamentazione"
  tags: ["europa", "sovranita", "cloud", "dati", "open-source", "regolamentazione"]

  assumption eu_cloud_investment { value: ${vals.eu_cloud_investment ?? 10}  source: "IPCEI Cloud, Gaia-X"  confidence: 0.45  uncertainty: normal(±25%) }
  assumption data_localization { value: ${((vals.data_localization ?? 20) / 100).toFixed(2)}  source: "ENISA 2024"  confidence: 0.4  uncertainty: normal(±30%) }
  assumption open_source_adoption { value: ${((vals.open_source_adoption ?? 25) / 100).toFixed(2)}  source: "OSOR EU 2024"  confidence: 0.5  uncertainty: normal(±20%) }
  assumption digital_regulation_strength { value: ${((vals.digital_regulation_strength ?? 55) / 100).toFixed(2)}  source: "DG CONNECT"  confidence: 0.5  uncertainty: beta(5, 4) }

  variable indice_sovranita_digitale {
    description: "Indice composito di sovranita digitale EU (0-100)"
    unit: "indice"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.indice_sovranita_digitale[i])}`).join('\n    ')}
    depends_on: eu_cloud_investment, data_localization, open_source_adoption, digital_regulation_strength
    uncertainty: normal(±18%)
    interpolation: spline
  }

  variable dipendenza_big_tech {
    description: "Dipendenza da Big Tech extra-UE per servizi digitali critici"
    unit: "percentuale"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.dipendenza_big_tech[i])}`).join('\n    ')}
    depends_on: eu_cloud_investment, data_localization, open_source_adoption
    uncertainty: normal(±15%)
    interpolation: spline
  }

  variable mercato_cloud_eu {
    description: "Fatturato annuo dei provider cloud europei"
    unit: "miliardi EUR"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.mercato_cloud_eu[i])}`).join('\n    ')}
    depends_on: eu_cloud_investment, data_localization
    uncertainty: normal(±22%)
    interpolation: spline
  }

  variable posti_lavoro_tech_eu {
    description: "Occupati nel settore tech europeo (non Big Tech)"
    unit: "milioni"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.posti_lavoro_tech_eu[i])}`).join('\n    ')}
    depends_on: eu_cloud_investment, open_source_adoption
    uncertainty: normal(±20%)
    interpolation: spline
  }

  impact guadagno_sovranita {
    description: "Guadagno di sovranita digitale rispetto al 2025"
    unit: "punti indice"
    derives_from: indice_sovranita_digitale
    formula: indice_sovranita_digitale - 22
  }

  branch "Gaia-X decolla" when eu_cloud_investment > 25 {
    probability: 0.25
    variable mercato_cloud_eu { 2031: ${fmt(v.mercato_cloud_eu[3] * 1.3)}  2033: ${fmt(v.mercato_cloud_eu[4] * 1.4)}  2035: ${fmt(v.mercato_cloud_eu[5] * 1.5)}  uncertainty: normal(±20%) }
    variable dipendenza_big_tech { 2031: ${fmt(v.dipendenza_big_tech[3] * 0.85)}  2033: ${fmt(v.dipendenza_big_tech[4] * 0.8)}  2035: ${fmt(v.dipendenza_big_tech[5] * 0.75)}  uncertainty: normal(±15%) }
  }

  branch "Digital sovereignty push" when digital_regulation_strength > 0.8 {
    probability: 0.20
    variable indice_sovranita_digitale { 2031: ${fmt(v.indice_sovranita_digitale[3] * 1.15)}  2033: ${fmt(v.indice_sovranita_digitale[4] * 1.2)}  2035: ${fmt(Math.min(95, v.indice_sovranita_digitale[5] * 1.25))}  uncertainty: normal(±15%) }
  }

  simulate { runs: 2000  method: monte_carlo  seed: 42  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.01 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'sovranita-digitale',
    title: 'Sovranità Digitale Europea',
    subtitle: 'Cloud, dati e autonomia tecnologica 2025-2035',
    description: 'L\'80% dei dati europei è processato su infrastrutture americane. L\'Europa può costruire una propria autonomia digitale? Esplora l\'impatto di investimenti, regolamentazione e open source.',
    category: 'politica',
    tags: ['sovranità', 'cloud', 'Gaia-X', 'open source', 'GDPR'],
    icon: '🛡',
    color: '#ef4444',
    period: '2025 — 2035',
    difficulty: 'avanzato',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'indice_sovranita_digitale', label: 'Sovranità digitale', description: 'Indice composito di autonomia digitale europea (0-100)', unit: 'indice', color: '#3b82f6', type: 'variable', icon: '🛡' },
    { id: 'dipendenza_big_tech', label: 'Dipendenza Big Tech', description: 'Percentuale di servizi digitali critici dipendenti da Big Tech extra-UE', unit: '%', color: '#ef4444', type: 'variable', icon: '⛓' },
    { id: 'guadagno_sovranita', label: 'Guadagno sovranità', description: 'Punti guadagnati nell\'indice di sovranità digitale rispetto al 2025', unit: 'punti', color: '#10b981', type: 'impact', icon: '↑' },
    { id: 'mercato_cloud_eu', label: 'Cloud EU', description: 'Fatturato dei provider cloud europei in miliardi di euro', unit: 'mld €', color: '#f59e0b', type: 'variable', icon: '☁' },
    { id: 'posti_lavoro_tech_eu', label: 'Lavoro tech EU', description: 'Milioni di occupati nel settore tech europeo (non Big Tech)', unit: 'milioni', color: '#8b5cf6', type: 'variable', icon: '💻' },
  ],
  generateSDL,
};

export default scenario;
