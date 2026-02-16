/**
 * Scenario: Euro Digitale — Adozione CBDC 2025-2032
 * Categoria: Economia
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'ecb_commitment',
    label: 'Impegno BCE',
    description: 'Probabilità e decisione della BCE di lanciare l\'Euro Digitale (0=annullamento, 100=lancio pieno)',
    unit: '%', min: 20, max: 100, step: 5, default: 85,
    source: 'ECB Digital Euro project, fase di preparazione 2025',
    format: (v) => `${v}%`,
  },
  {
    id: 'privacy_level',
    label: 'Tutela privacy',
    description: 'Livello di privacy garantito nelle transazioni (0=trasparenza totale, 100=anonimato simil-contante)',
    unit: '%', min: 10, max: 100, step: 5, default: 70,
    source: 'EU Digital Euro Regulation proposal, 2024',
    format: (v) => `${v}%`,
  },
  {
    id: 'holding_limit',
    label: 'Limite di detenzione',
    description: 'Importo massimo detenibile in Euro Digitale per persona, in euro',
    unit: '€', min: 500, max: 10000, step: 500, default: 3000,
    source: 'ECB proposta di limite individuale, 2025',
    format: (v) => `${v.toLocaleString('it')} €`,
  },
  {
    id: 'offline_capability',
    label: 'Capacità offline',
    description: 'Livello di supporto per pagamenti offline senza connessione internet',
    unit: '%', min: 10, max: 100, step: 5, default: 60,
    source: 'Requisiti tecnici BCE per offline payments',
    format: (v) => `${v}%`,
  },
];

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'wallet_adoption', baseValues: [0, 2, 8, 18, 32, 45, 55, 62],
    sensitivities: { ecb_commitment: 0.6, privacy_level: 0.35, holding_limit: 0.1, offline_capability: 0.25 } },
  { name: 'daily_transactions', baseValues: [0, 0.5, 3, 12, 35, 70, 110, 150],
    sensitivities: { ecb_commitment: 0.5, privacy_level: 0.2, holding_limit: 0.15, offline_capability: 0.3 } },
  { name: 'bank_branch_count', baseValues: [125, 122, 118, 112, 105, 97, 90, 84],
    sensitivities: { ecb_commitment: -0.15, privacy_level: 0.05, holding_limit: -0.1, offline_capability: -0.05 } },
  { name: 'bank_deposits_shift', baseValues: [0, 0.3, 1.2, 2.8, 4.5, 6.0, 7.2, 8.0],
    sensitivities: { ecb_commitment: 0.4, privacy_level: 0.1, holding_limit: 0.5, offline_capability: 0.1 } },
  { name: 'financial_inclusion', baseValues: [62, 63, 66, 70, 74, 78, 81, 84],
    sensitivities: { ecb_commitment: 0.3, privacy_level: 0.1, holding_limit: 0.05, offline_capability: 0.45 } },
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
  const ecb = vals.ecb_commitment ?? 85;
  const privacy = vals.privacy_level ?? 70;
  const limit = vals.holding_limit ?? 3000;
  const offline = vals.offline_capability ?? 60;

  return `
scenario "Euro Digitale — Adozione CBDC 2025-2032" {
  timeframe: 2025 -> 2032
  resolution: yearly
  confidence: 0.50
  author: "Relatronica — Citizen Lab"
  description: "Simulazione dell'adozione dell'Euro Digitale e impatto su banche, inclusione e depositi"
  tags: ["finanza", "cbdc", "eurozona", "banche", "inclusione"]

  assumption ecb_commitment { value: ${(ecb / 100).toFixed(2)}  source: "ECB Digital Euro project, 2025"  confidence: 0.7  uncertainty: beta(7, 2) }
  assumption privacy_level { value: ${(privacy / 100).toFixed(2)}  source: "EU Digital Euro Regulation, 2024"  confidence: 0.6  uncertainty: beta(5, 3) }
  assumption holding_limit { value: ${limit}  source: "BCE proposta limite individuale"  confidence: 0.5  uncertainty: uniform(${Math.max(500, limit - 1500)}, ${limit + 2000}) }
  assumption offline_capability { value: ${(offline / 100).toFixed(2)}  source: "Requisiti tecnici BCE"  confidence: 0.5  uncertainty: beta(5, 4) }

  variable wallet_adoption {
    description: "Percentuale adulti eurozona con wallet Euro Digitale"
    unit: "percentuale"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.wallet_adoption[i])}`).join('\n    ')}
    depends_on: ecb_commitment, privacy_level, offline_capability
    uncertainty: normal(±20%)
    interpolation: spline
  }

  variable daily_transactions {
    description: "Transazioni giornaliere medie in milioni"
    unit: "milioni"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.daily_transactions[i])}`).join('\n    ')}
    depends_on: wallet_adoption
    uncertainty: normal(±25%)
    interpolation: spline
  }

  variable bank_branch_count {
    description: "Filiali bancarie nell'eurozona (migliaia)"
    unit: "migliaia"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.bank_branch_count[i])}`).join('\n    ')}
    depends_on: wallet_adoption
    uncertainty: normal(±8%)
    interpolation: linear
  }

  variable bank_deposits_shift {
    description: "Depositi retail migrati da banche a CBDC (%)"
    unit: "percentuale"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.bank_deposits_shift[i])}`).join('\n    ')}
    depends_on: wallet_adoption, holding_limit
    uncertainty: normal(±15%)
    interpolation: linear
  }

  variable financial_inclusion {
    description: "Indice inclusione finanziaria (0-100)"
    unit: "indice"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.financial_inclusion[i])}`).join('\n    ')}
    depends_on: wallet_adoption, offline_capability
    uncertainty: normal(±10%)
    interpolation: spline
  }

  impact disruption_bancaria {
    description: "Indice di disruption del settore bancario"
    unit: "indice"
    derives_from: bank_deposits_shift, bank_branch_count
    formula: (bank_deposits_shift * 10) + ((125 - bank_branch_count) / 125 * 100)
  }

  impact guadagno_inclusione {
    description: "Guadagno netto in inclusione finanziaria"
    unit: "punti"
    derives_from: financial_inclusion
    formula: financial_inclusion - 62
  }

  branch "Adozione massiva" when wallet_adoption > 50 and daily_transactions > 100 {
    probability: 0.25
    variable bank_deposits_shift { 2031: ${fmt(v.bank_deposits_shift[6] * 1.4)}  2032: ${fmt(v.bank_deposits_shift[7] * 1.75)}  uncertainty: normal(±20%) }
  }

  branch "Rivolta privacy" when privacy_level < 0.4 {
    probability: 0.15
    variable wallet_adoption { 2030: ${fmt(v.wallet_adoption[5] * 0.5)}  2031: ${fmt(v.wallet_adoption[6] * 0.45)}  2032: ${fmt(v.wallet_adoption[7] * 0.45)}  uncertainty: normal(±15%) }
  }

  simulate { runs: 2000  method: monte_carlo  seed: 2026  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.02 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'euro-digitale',
    title: 'Euro Digitale',
    subtitle: 'Adozione CBDC, banche e inclusione 2025-2032',
    description: 'La BCE sta preparando l\'Euro Digitale. Come cambierà il sistema bancario? Quali effetti su depositi, filiali, inclusione finanziaria e privacy dei cittadini?',
    category: 'economia',
    tags: ['finanza', 'CBDC', 'banche', 'privacy', 'inclusione'],
    icon: '💶',
    color: '#f59e0b',
    period: '2025 — 2032',
    difficulty: 'base',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'wallet_adoption', label: 'Adozione wallet', description: 'Percentuale di adulti con wallet Euro Digitale', unit: '%', color: '#3b82f6', type: 'variable', icon: '📱' },
    { id: 'daily_transactions', label: 'Transazioni giornaliere', description: 'Milioni di transazioni al giorno in Euro Digitale', unit: 'milioni', color: '#10b981', type: 'variable', icon: '💳' },
    { id: 'bank_branch_count', label: 'Filiali bancarie', description: 'Numero di filiali bancarie rimaste nell\'eurozona (migliaia)', unit: 'migliaia', color: '#ef4444', type: 'variable', icon: '🏦' },
    { id: 'bank_deposits_shift', label: 'Shift depositi', description: 'Percentuale di depositi retail migrati verso CBDC', unit: '%', color: '#f59e0b', type: 'variable', icon: '↗' },
    { id: 'disruption_bancaria', label: 'Disruption bancaria', description: 'Indice composito di disruption del settore bancario', unit: 'indice', color: '#ef4444', type: 'impact', icon: '⚡' },
    { id: 'financial_inclusion', label: 'Inclusione finanziaria', description: 'Indice di inclusione finanziaria per la popolazione underbanked', unit: 'indice', color: '#8b5cf6', type: 'variable', icon: '🤝' },
  ],
  generateSDL,
};

export default scenario;
