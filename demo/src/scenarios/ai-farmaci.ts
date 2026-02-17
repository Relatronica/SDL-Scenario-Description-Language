/**
 * Scenario: AI e Scoperta Farmaci 2025-2042
 * Categoria: Tecnologia / Salute
 */

import type { ScenarioDefinition, SliderDef } from './types';

const SLIDERS: SliderDef[] = [
  {
    id: 'ai_biomedical_capability',
    label: 'Capacita\' AI biomedica',
    description: 'Livello di maturita\' dei modelli AI per biologia e chimica (0=base, 100=superintelligenza biomedica)',
    unit: 'indice', min: 20, max: 95, step: 5, default: 55,
    source: 'AlphaFold/BioNeMo benchmarks; Nature Biotech reviews 2025',
    format: (v) => `${v}/100`,
  },
  {
    id: 'pharma_rd_spend',
    label: 'Investimento R&D pharma',
    description: 'Spesa globale annua in ricerca e sviluppo farmaceutico',
    unit: 'miliardi $', min: 150, max: 450, step: 10, default: 260,
    source: 'EFPIA/PhRMA Global R&D Spending Report 2025',
    format: (v) => `${v} mld $`,
  },
  {
    id: 'regulatory_readiness',
    label: 'Prontezza regolatoria (FDA/EMA)',
    description: 'Quanto velocemente le agenzie regolatorie adattano i processi all\'AI (0=lento, 100=rapido)',
    unit: 'indice', min: 10, max: 90, step: 5, default: 40,
    source: 'FDA AI/ML Action Plan; EMA AI Reflection Paper 2025',
    format: (v) => `${v}/100`,
  },
  {
    id: 'open_science',
    label: 'Apertura dati biomedici',
    description: 'Grado di condivisione aperta dei dati e modelli nel settore (0=chiuso, 100=completamente aperto)',
    unit: 'indice', min: 10, max: 80, step: 5, default: 35,
    source: 'UK Biobank, All of Us, Open Targets; Nature Open Science tracker',
    format: (v) => `${v}/100`,
  },
];

const YEARS = [2025, 2028, 2031, 2034, 2037, 2040, 2042];

interface VarSpec { name: string; baseValues: number[]; sensitivities: Record<string, number>; }

const VARS: VarSpec[] = [
  { name: 'approvazioni_ai', baseValues: [8, 18, 38, 62, 88, 110, 125],
    sensitivities: { ai_biomedical_capability: 0.5, pharma_rd_spend: 0.2, regulatory_readiness: 0.35, open_science: 0.15 } },
  { name: 'tempo_approvazione', baseValues: [10.5, 9.2, 8.0, 6.8, 5.8, 5.0, 4.5],
    sensitivities: { ai_biomedical_capability: -0.3, pharma_rd_spend: -0.05, regulatory_readiness: -0.35, open_science: -0.1 } },
  { name: 'costo_sviluppo', baseValues: [2.3, 2.0, 1.7, 1.4, 1.1, 0.9, 0.8],
    sensitivities: { ai_biomedical_capability: -0.35, pharma_rd_spend: 0.0, regulatory_readiness: -0.15, open_science: -0.2 } },
  { name: 'tasso_successo_clinico', baseValues: [12, 15, 21, 27, 34, 39, 42],
    sensitivities: { ai_biomedical_capability: 0.45, pharma_rd_spend: 0.05, regulatory_readiness: 0.1, open_science: 0.25 } },
  { name: 'candidati_malattie_rare', baseValues: [120, 260, 550, 950, 1500, 2100, 2600],
    sensitivities: { ai_biomedical_capability: 0.5, pharma_rd_spend: 0.15, regulatory_readiness: 0.05, open_science: 0.4 } },
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
  const aiCap = vals.ai_biomedical_capability ?? 55;
  const rdSpend = vals.pharma_rd_spend ?? 260;
  const regReady = vals.regulatory_readiness ?? 40;
  const openSci = vals.open_science ?? 35;

  return `
scenario "AI e Scoperta Farmaci 2025-2042" {
  timeframe: 2025 -> 2042
  resolution: yearly
  confidence: 0.30
  author: "Relatronica — Citizen Lab"
  version: "1.0"
  description: "Impatto dell'AI sulla scoperta farmaci: tempi, costi, successo clinico e malattie rare"
  tags: ["ai", "salute", "farmaci", "pharma", "diagnostica"]
  subtitle: "Pharma, diagnostica e malattie rare 2025-2042"
  category: "tecnologia"
  icon: "💊"
  color: "#10b981"
  difficulty: "intermedio"

  parameter ai_biomedical_capability {
    label: "Capacità AI biomedica"
    value: ${(aiCap / 100).toFixed(2)}
    range: [20, 95]
    step: 5
    unit: "indice"
    source: "AlphaFold/BioNeMo benchmarks; Nature Biotech reviews 2025"
    format: "{value}/100"
    control: slider
    description: "Livello di maturità dei modelli AI per biologia e chimica (0=base, 100=superintelligenza biomedica)"
  }
  parameter pharma_rd_spend {
    label: "Investimento R&D pharma"
    value: ${rdSpend}
    range: [150, 450]
    step: 10
    unit: "miliardi $"
    source: "EFPIA/PhRMA Global R&D Spending Report 2025"
    format: "{value} mld $"
    control: slider
    description: "Spesa globale annua in ricerca e sviluppo farmaceutico"
  }
  parameter regulatory_readiness {
    label: "Prontezza regolatoria (FDA/EMA)"
    value: ${(regReady / 100).toFixed(2)}
    range: [10, 90]
    step: 5
    unit: "indice"
    source: "FDA AI/ML Action Plan; EMA AI Reflection Paper 2025"
    format: "{value}/100"
    control: slider
    description: "Quanto velocemente le agenzie regolatorie adattano i processi all'AI (0=lento, 100=rapido)"
  }
  parameter open_science {
    label: "Apertura dati biomedici"
    value: ${(openSci / 100).toFixed(2)}
    range: [10, 80]
    step: 5
    unit: "indice"
    source: "UK Biobank, All of Us, Open Targets; Nature Open Science tracker"
    format: "{value}/100"
    control: slider
    description: "Grado di condivisione aperta dei dati e modelli nel settore (0=chiuso, 100=completamente aperto)"
  }

  variable approvazioni_ai {
    description: "Farmaci approvati con ruolo sostanziale dell'AI (FDA+EMA/anno)"
    unit: "farmaci"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.approvazioni_ai[i])}`).join('\n    ')}
    depends_on: ai_biomedical_capability, regulatory_readiness, pharma_rd_spend
    uncertainty: lognormal(3, 0.4)
    interpolation: spline
  }

  variable tempo_approvazione {
    description: "Tempo medio da candidato preclinico ad approvazione"
    unit: "anni"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.tempo_approvazione[i])}`).join('\n    ')}
    depends_on: ai_biomedical_capability, regulatory_readiness
    uncertainty: normal(±15%)
    interpolation: spline
  }

  variable costo_sviluppo {
    description: "Costo medio di sviluppo di un nuovo farmaco"
    unit: "miliardi USD"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.costo_sviluppo[i])}`).join('\n    ')}
    depends_on: ai_biomedical_capability, tempo_approvazione
    uncertainty: lognormal(0.2, 0.3)
    interpolation: spline
  }

  variable tasso_successo_clinico {
    description: "Tasso di successo Fase I -> approvazione per farmaci AI-assistiti"
    unit: "percentuale"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.tasso_successo_clinico[i])}`).join('\n    ')}
    depends_on: ai_biomedical_capability, open_science
    uncertainty: beta(4, 10)
    interpolation: spline
  }

  variable candidati_malattie_rare {
    description: "Candidati farmaci AI per malattie rare (cumulativo)"
    unit: "candidati"
    ${YEARS.map((y, i) => `${y}: ${fmt(v.candidati_malattie_rare[i])}`).join('\n    ')}
    depends_on: ai_biomedical_capability, open_science
    uncertainty: lognormal(5.5, 0.4)
    interpolation: spline
  }

  impact anni_risparmiati {
    label: "Anni risparmiati"
    description: "Anni risparmiati per farmaco rispetto al baseline 2025"
    unit: "anni"
    icon: "⚡"
    color: "#06b6d4"
    derives_from: tempo_approvazione
    formula: 10.5 - tempo_approvazione
  }

  impact indice_malattie_rare {
    description: "Percentuale delle 7000 malattie rare con candidati AI"
    unit: "percentuale"
    derives_from: candidati_malattie_rare
    formula: candidati_malattie_rare / 7000 * 100
  }

  branch "Momento AlphaFold" when ai_biomedical_capability > 0.8 {
    probability: 0.15
    variable tempo_approvazione { 2034: ${fmt(v.tempo_approvazione[3] * 0.65)}  2037: ${fmt(v.tempo_approvazione[4] * 0.5)}  2040: ${fmt(v.tempo_approvazione[5] * 0.4)}  uncertainty: normal(±20%) }
    variable costo_sviluppo { 2034: ${fmt(v.costo_sviluppo[3] * 0.6)}  2037: ${fmt(v.costo_sviluppo[4] * 0.45)}  2040: ${fmt(v.costo_sviluppo[5] * 0.35)}  uncertainty: lognormal(-0.5, 0.3) }
  }

  branch "Muro regolatorio" when regulatory_readiness < 0.25 {
    probability: 0.22
    variable approvazioni_ai { 2034: ${fmt(v.approvazioni_ai[3] * 0.6)}  2037: ${fmt(v.approvazioni_ai[4] * 0.55)}  2040: ${fmt(v.approvazioni_ai[5] * 0.55)}  uncertainty: normal(±20%) }
    variable tempo_approvazione { 2034: ${fmt(v.tempo_approvazione[3] * 1.15)}  2037: ${fmt(v.tempo_approvazione[4] * 1.2)}  2040: ${fmt(v.tempo_approvazione[5] * 1.25)}  uncertainty: normal(±12%) }
  }

  branch "Open Science accelera" when open_science > 0.6 {
    probability: 0.20
    variable tasso_successo_clinico { 2034: ${fmt(v.tasso_successo_clinico[3] * 1.3)}  2037: ${fmt(v.tasso_successo_clinico[4] * 1.4)}  2040: ${fmt(Math.min(55, v.tasso_successo_clinico[5] * 1.5))}  uncertainty: beta(6, 8) }
    variable candidati_malattie_rare { 2034: ${fmt(v.candidati_malattie_rare[3] * 1.4)}  2037: ${fmt(v.candidati_malattie_rare[4] * 1.6)}  2040: ${fmt(v.candidati_malattie_rare[5] * 1.8)}  uncertainty: lognormal(6.5, 0.4) }
  }

  simulate { runs: 2000  method: monte_carlo  seed: 42  output: distribution  percentiles: [5, 25, 50, 75, 95]  convergence: 0.01 }
}`;
}

const scenario: ScenarioDefinition = {
  meta: {
    id: 'ai-farmaci',
    title: 'AI e Scoperta Farmaci',
    subtitle: 'Pharma, diagnostica e malattie rare 2025-2042',
    description: 'Sviluppare un farmaco costa 2.3 miliardi e richiede 10 anni. L\'AI puo\' dimezzare tempi e costi? Esplora l\'impatto su approvazioni, trial clinici e malattie rare.',
    category: 'tecnologia',
    tags: ['ai', 'farmaci', 'pharma', 'malattie rare', 'diagnostica'],
    icon: '💊',
    color: '#10b981',
    period: '2025 — 2042',
    difficulty: 'intermedio',
  },
  sliders: SLIDERS,
  variables: [
    { id: 'approvazioni_ai', label: 'Farmaci AI approvati', description: 'Farmaci approvati annualmente con ruolo sostanziale dell\'AI', unit: 'farmaci/anno', color: '#10b981', type: 'variable', icon: '💊' },
    { id: 'tempo_approvazione', label: 'Tempo di sviluppo', description: 'Anni medi dalla scoperta all\'approvazione regolatoria', unit: 'anni', color: '#3b82f6', type: 'variable', icon: '⏱' },
    { id: 'anni_risparmiati', label: 'Anni risparmiati', description: 'Anni risparmiati per farmaco rispetto al baseline 2025', unit: 'anni', color: '#06b6d4', type: 'impact', icon: '⚡' },
    { id: 'costo_sviluppo', label: 'Costo per farmaco', description: 'Costo medio di sviluppo dalla scoperta al mercato', unit: 'mld $', color: '#f59e0b', type: 'variable', icon: '💰' },
    { id: 'tasso_successo_clinico', label: 'Successo clinico', description: 'Tasso di successo dalla Fase I all\'approvazione', unit: '%', color: '#8b5cf6', type: 'variable', icon: '📊' },
    { id: 'candidati_malattie_rare', label: 'Candidati malattie rare', description: 'Candidati farmaci AI per le 7000 malattie rare conosciute', unit: 'candidati', color: '#ef4444', type: 'variable', icon: '🧬' },
  ],
  generateSDL,
};

export default scenario;
