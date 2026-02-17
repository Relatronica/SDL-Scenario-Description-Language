/**
 * Scenario: Mobilita' Autonoma 2025-2045
 * Categoria: Tecnologia / Trasporti
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'tech_readiness',
    label: 'Maturita\' tecnologica AV',
    description: 'Livello di maturita\' della tecnologia autonoma L4/L5 (0=sperimentale, 100=affidabile)',
    unit: 'indice', min: 20, max: 95, step: 5, default: 55,
    source: 'SAE/RAND AV Readiness Assessment 2025; Waymo/Cruise safety reports',
    format: (v) => `${v}/100`,
  },
  {
    id: 'regulatory_openness',
    label: 'Apertura regolatoria',
    description: 'Quanto velocemente i governi OCSE approvano framework per veicoli autonomi',
    unit: 'indice', min: 10, max: 90, step: 5, default: 30,
    source: 'UNECE WP.29; NHTSA AV rulemaking; EU Connected Driving strategy',
    format: (v) => `${v}/100`,
  },
  {
    id: 'public_trust',
    label: 'Fiducia pubblica',
    description: 'Percentuale della popolazione disposta a usare un veicolo senza conducente',
    unit: '%', min: 15, max: 85, step: 5, default: 42,
    source: 'AAA Foundation Trust Survey 2025; Eurobarometro mobilita\'',
    format: (v) => `${v}%`,
  },
  {
    id: 'sensor_cost_reduction',
    label: 'Riduzione costo sensori',
    description: 'Riduzione percentuale annua del costo dei sensori LiDAR e suite AV',
    unit: '%/anno', min: 5, max: 40, step: 1, default: 20,
    source: 'Velodyne/Luminar pricing trends; McKinsey Mobility Report 2025',
    format: (v) => `${v}%/anno`,
  },
];

const YEARS = [2025, 2029, 2033, 2037, 2041, 2045];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'flotta_av', baseValues: [25, 220, 1200, 4500, 11000, 19000],
    sensitivities: { tech_readiness: 0.45, regulatory_openness: 0.35, public_trust: 0.2, sensor_cost_reduction: 0.25 } },
  { name: 'ride_hailing_av', baseValues: [1, 7, 24, 48, 66, 76],
    sensitivities: { tech_readiness: 0.3, regulatory_openness: 0.3, public_trust: 0.35, sensor_cost_reduction: 0.15 } },
  { name: 'morti_stradali_ocse', baseValues: [95, 87, 72, 52, 36, 25],
    sensitivities: { tech_readiness: -0.3, regulatory_openness: -0.15, public_trust: -0.1, sensor_cost_reduction: -0.05 } },
  { name: 'domanda_parcheggi', baseValues: [100, 94, 80, 62, 48, 39],
    sensitivities: { tech_readiness: -0.15, regulatory_openness: -0.1, public_trust: -0.2, sensor_cost_reduction: -0.05 } },
  { name: 'merci_autonome', baseValues: [0.5, 4, 15, 34, 52, 63],
    sensitivities: { tech_readiness: 0.4, regulatory_openness: 0.35, public_trust: 0.05, sensor_cost_reduction: 0.2 } },
  { name: 'autisti_occupati', baseValues: [6.5, 6.0, 4.9, 3.5, 2.5, 2.0],
    sensitivities: { tech_readiness: -0.2, regulatory_openness: -0.15, public_trust: -0.05, sensor_cost_reduction: -0.1 } },
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
  const techReady = vals.tech_readiness ?? 55;
  const regOpen = vals.regulatory_openness ?? 30;
  const trust = vals.public_trust ?? 42;
  const sensorCost = vals.sensor_cost_reduction ?? 20;

  return `
scenario "Mobilita Autonoma 2025-2045" {
  timeframe: 2025 -> 2045
  resolution: yearly
  confidence: 0.35
  author: "Relatronica — Citizen Lab"
  version: "1.0"
  description: "Adozione dei veicoli autonomi L4/L5 e impatti su sicurezza, citta, logistica e lavoro"
  tags: ["ai", "mobilita", "veicoli-autonomi", "citta", "logistica", "sicurezza"]

  assumption tech_readiness { value: ${(techReady / 100).toFixed(2)}  source: "SAE/RAND 2025"  confidence: 0.4  uncertainty: beta(5, 4) }
  assumption regulatory_openness { value: ${(regOpen / 100).toFixed(2)}  source: "UNECE WP.29"  confidence: 0.3  uncertainty: beta(3, 6) }
  assumption public_trust { value: ${(trust / 100).toFixed(2)}  source: "AAA/Eurobarometro 2025"  confidence: 0.5  uncertainty: beta(4, 5) }
  assumption sensor_cost_reduction { value: ${(sensorCost / 100).toFixed(2)}  source: "Velodyne/Luminar"  confidence: 0.6  uncertainty: normal(±25%) }

  variable flotta_av {
    description: "Veicoli autonomi L4/L5 in circolazione (OCSE)"
    unit: "migliaia"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.flotta_av[i])}`).join('\n    ')}
    depends_on: tech_readiness, regulatory_openness, sensor_cost_reduction
    uncertainty: lognormal(7, 0.5)
    interpolation: spline
  }

  variable ride_hailing_av {
    description: "Quota veicoli autonomi sul ride-hailing totale"
    unit: "percentuale"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.ride_hailing_av[i])}`).join('\n    ')}
    depends_on: flotta_av, public_trust, regulatory_openness
    uncertainty: normal(±20%)
    interpolation: spline
  }

  variable morti_stradali_ocse {
    description: "Morti in incidenti stradali OCSE all'anno"
    unit: "migliaia"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.morti_stradali_ocse[i])}`).join('\n    ')}
    depends_on: flotta_av, tech_readiness
    uncertainty: normal(±12%)
    interpolation: spline
  }

  variable domanda_parcheggi {
    description: "Domanda parcheggi urbani (2025=100)"
    unit: "indice"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.domanda_parcheggi[i])}`).join('\n    ')}
    depends_on: flotta_av, ride_hailing_av
    uncertainty: normal(±15%)
    interpolation: spline
  }

  variable merci_autonome {
    description: "Quota merci long-haul trasportate da camion autonomi"
    unit: "percentuale"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.merci_autonome[i])}`).join('\n    ')}
    depends_on: tech_readiness, regulatory_openness
    uncertainty: normal(±22%)
    interpolation: spline
  }

  variable autisti_occupati {
    description: "Autisti di camion long-haul occupati (OCSE)"
    unit: "milioni"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.autisti_occupati[i])}`).join('\n    ')}
    depends_on: merci_autonome
    uncertainty: normal(±12%)
    interpolation: linear
  }

  impact vite_salvate {
    description: "Vite salvate annualmente rispetto al 2025"
    unit: "migliaia"
    derives_from: morti_stradali_ocse
    formula: 95 - morti_stradali_ocse
  }

  impact spazio_urbano_liberato {
    description: "Spazio urbano liberato dai parcheggi (0-100)"
    unit: "indice"
    derives_from: domanda_parcheggi
    formula: 100 - domanda_parcheggi
  }

  impact autisti_spostati {
    description: "Autisti spostati rispetto al 2025"
    unit: "milioni"
    derives_from: autisti_occupati
    formula: 6.5 - autisti_occupati
  }

  branch "Via libera regolatorio" when regulatory_openness > 0.6 {
    probability: 0.22
    variable flotta_av { 2033: ${fmt(v.flotta_av[2] * 1.8)}  2037: ${fmt(v.flotta_av[3] * 1.6)}  2041: ${fmt(v.flotta_av[4] * 1.4)}  uncertainty: lognormal(8, 0.4) }
    variable merci_autonome { 2033: ${fmt(v.merci_autonome[2] * 1.5)}  2037: ${fmt(v.merci_autonome[3] * 1.4)}  2041: ${fmt(Math.min(80, v.merci_autonome[4] * 1.3))}  uncertainty: normal(±18%) }
  }

  branch "Incidente fatale e backlash" when morti_stradali_ocse > 80 {
    probability: 0.18
    variable flotta_av { 2033: ${fmt(v.flotta_av[2] * 0.45)}  2037: ${fmt(v.flotta_av[3] * 0.5)}  2041: ${fmt(v.flotta_av[4] * 0.6)}  uncertainty: lognormal(6.5, 0.5) }
    variable ride_hailing_av { 2033: ${fmt(v.ride_hailing_av[2] * 0.5)}  2037: ${fmt(v.ride_hailing_av[3] * 0.55)}  2041: ${fmt(v.ride_hailing_av[4] * 0.65)}  uncertainty: normal(±20%) }
  }

  branch "Logistica first" when merci_autonome > 20 {
    probability: 0.20
    variable merci_autonome { 2037: ${fmt(v.merci_autonome[3] * 1.35)}  2041: ${fmt(Math.min(80, v.merci_autonome[4] * 1.3))}  2045: ${fmt(Math.min(85, v.merci_autonome[5] * 1.25))}  uncertainty: normal(±15%) }
    variable autisti_occupati { 2037: ${fmt(v.autisti_occupati[3] * 0.7)}  2041: ${fmt(v.autisti_occupati[4] * 0.6)}  2045: ${fmt(v.autisti_occupati[5] * 0.55)}  uncertainty: normal(±15%) }
  }

  simulate { runs: 2000  method: monte_carlo  seed: 42  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.01 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'mobilita-autonoma',
    title: 'Mobilita\' Autonoma',
    subtitle: 'Veicoli senza conducente, citta\' e logistica 2025-2045',
    description: 'Quando guideremo senza mani? I veicoli autonomi promettono 90% di incidenti in meno, citta\' senza parcheggi e logistica rivoluzionata. Ma i tempi e rischi sono enormi. Esplora gli scenari.',
    category: 'tecnologia',
    tags: ['ai', 'guida autonoma', 'citta\'', 'logistica', 'sicurezza'],
    icon: '🚗',
    color: '#06b6d4',
    period: '2025 — 2045',
    difficulty: 'base',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'flotta_av', label: 'Flotta AV', description: 'Migliaia di veicoli L4/L5 in circolazione nei paesi OCSE', unit: 'migliaia', color: '#06b6d4', type: 'variable', icon: '🚗' },
    { id: 'morti_stradali_ocse', label: 'Morti stradali', description: 'Migliaia di vittime della strada nei paesi OCSE', unit: 'migliaia', color: '#ef4444', type: 'variable', icon: '⚠' },
    { id: 'vite_salvate', label: 'Vite salvate', description: 'Vite salvate rispetto al livello 2025 (95K)', unit: 'migliaia', color: '#10b981', type: 'impact', icon: '❤' },
    { id: 'ride_hailing_av', label: 'Ride-hailing AV', description: 'Quota dei viaggi ride-hailing effettuati da veicoli autonomi', unit: '%', color: '#8b5cf6', type: 'variable', icon: '📱' },
    { id: 'merci_autonome', label: 'Merci autonome', description: 'Quota merci long-haul trasportate da camion senza conducente', unit: '%', color: '#f59e0b', type: 'variable', icon: '🚛' },
    { id: 'autisti_spostati', label: 'Autisti spostati', description: 'Milioni di autisti di camion spostati dal lavoro', unit: 'milioni', color: '#ef4444', type: 'impact', icon: '👷' },
    { id: 'spazio_urbano_liberato', label: 'Spazio urbano liberato', description: 'Spazio urbano recuperato dalla riduzione dei parcheggi', unit: 'indice', color: '#3b82f6', type: 'impact', icon: '🏙' },
  ],
  generateSDL,
};

export default scenario;
