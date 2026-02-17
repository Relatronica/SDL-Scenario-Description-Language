/**
 * SDL Editor — Template Library
 *
 * Starter templates for creating custom SDL scenarios.
 */

export interface SDLTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  source: string;
}

export const EDITOR_TEMPLATES: SDLTemplate[] = [
  {
    id: 'blank',
    name: 'Scenario vuoto',
    description: 'Struttura base con assunti, parametri interattivi e variabili',
    icon: '📄',
    source: `// Il tuo scenario personalizzato
// Modifica liberamente questo codice SDL

scenario "Il mio scenario" {
  timeframe: 2025 -> 2040
  resolution: yearly
  confidence: 0.6
  author: "Citizen Lab"
  version: "1.0"
  description: "Descrivi qui il tuo scenario"
  tags: ["custom"]
  subtitle: "Un template per iniziare"
  category: tecnologia
  icon: "🔬"
  color: "#3b82f6"
  difficulty: base

  // ── Assunzioni ──

  assumption crescita_base {
    value: 1.5
    source: "La tua fonte"
    confidence: 0.6
    uncertainty: normal(±20%)
  }

  // ── Parametri interattivi ──
  // I parametri con control: slider generano
  // automaticamente slider nell'interfaccia

  parameter intensita_investimento {
    value: 50
    range: [10, 100]
    label: "Intensità investimento"
    unit: "indice"
    step: 5
    format: "{value} / 100"
    control: slider
    description: "Livello di investimento nel progetto (0-100)"
  }

  // ── Variabili ──

  variable indicatore_principale {
    description: "Il tuo indicatore principale"
    unit: "indice"
    label: "Indicatore principale"
    icon: "📊"
    color: "#3b82f6"

    2025: 100
    2030: 120
    2035: 145
    2040: 170

    depends_on: crescita_base
    uncertainty: normal(±15%)
    interpolation: linear
  }

  // ── Impatti ──

  impact variazione_netta {
    description: "Variazione rispetto al 2025"
    unit: "indice"
    label: "Variazione netta"
    icon: "📈"
    color: "#10b981"
    derives_from: indicatore_principale
    formula: indicatore_principale - 100
  }

  // ── Simulazione ──

  simulate {
    runs: 2000
    method: monte_carlo
    seed: 42
    output: distribution
    percentiles: [5, 25, 50, 75, 95]
  }
}
`,
  },
  {
    id: 'economic',
    name: 'Economia & PIL',
    description: 'Template per scenari di crescita economica e occupazione',
    icon: '📈',
    source: `// Scenario economico — PIL e occupazione
// Modifica i valori per esplorare scenari alternativi

scenario "Crescita Economica Italia" {
  timeframe: 2025 -> 2040
  resolution: yearly
  confidence: 0.55
  author: "Citizen Lab"
  version: "1.0"
  description: "Proiezione della crescita economica italiana 
                con focus su PIL e tasso di occupazione"
  tags: ["economia", "pil", "occupazione", "italia"]

  // ── Assunzioni ──

  assumption tasso_crescita_pil {
    value: 0.8
    source: "ISTAT / Commissione Europea, previsioni 2025"
    confidence: 0.5
    uncertainty: normal(±40%)
  }

  assumption tasso_inflazione {
    value: 2.1
    source: "BCE target inflazione 2025"
    confidence: 0.6
    uncertainty: normal(±30%)
  }

  assumption investimenti_pnrr {
    value: 1
    source: "Piano Nazionale Ripresa e Resilienza"
    confidence: 0.7
    uncertainty: beta(7, 3)
  }

  // ── Parametri interattivi ──

  parameter spesa_pubblica_extra {
    value: 5
    range: [0, 15]
    label: "Spesa pubblica extra"
    unit: "mld €"
    step: 0.5
    format: "{value} mld €"
    control: slider
    description: "Spesa pubblica aggiuntiva annua per stimolo economico"
  }

  parameter aliquota_imprese {
    value: 24
    range: [15, 35]
    label: "Aliquota IRES"
    unit: "%"
    step: 1
    format: "{value}%"
    control: slider
    description: "Aliquota fiscale sulle imprese (attuale 24%)"
  }

  // ── Variabili ──

  variable pil_reale {
    description: "PIL reale (miliardi EUR, prezzi 2025)"
    unit: "mld EUR"

    2025: 1910
    2028: 1960
    2030: 2000
    2035: 2120
    2040: 2250

    depends_on: tasso_crescita_pil, investimenti_pnrr
    uncertainty: normal(±10%)
    interpolation: spline
  }

  variable tasso_occupazione {
    description: "Tasso di occupazione 15-64 anni"
    unit: "%"

    2025: 62
    2028: 63.5
    2030: 64.5
    2035: 66
    2040: 67.5

    depends_on: pil_reale, investimenti_pnrr
    uncertainty: normal(±8%)
    interpolation: linear
  }

  variable debito_pil {
    description: "Rapporto debito/PIL"
    unit: "%"

    2025: 137
    2028: 135
    2030: 133
    2035: 128
    2040: 122

    depends_on: pil_reale, tasso_crescita_pil
    uncertainty: normal(±12%)
    interpolation: linear
  }

  // ── Branches ──

  branch "Recessione Globale" when tasso_crescita_pil < 0 {
    probability: 0.15

    variable pil_reale {
      2028: 1880
      2030: 1900
      2035: 1980
      uncertainty: normal(±15%)
    }

    variable tasso_occupazione {
      2030: 60
      2035: 61.5
      uncertainty: normal(±10%)
    }
  }

  branch "Boom PNRR" when investimenti_pnrr > 0.9 {
    probability: 0.25

    variable pil_reale {
      2028: 1990
      2030: 2060
      2035: 2250
      uncertainty: normal(±8%)
    }

    variable tasso_occupazione {
      2030: 66
      2035: 69
      uncertainty: normal(±6%)
    }
  }

  // ── Impatti ──

  impact crescita_cumulata {
    description: "Crescita cumulata PIL dal 2025"
    unit: "mld EUR"
    derives_from: pil_reale
    formula: pil_reale - 1910
  }

  impact gap_occupazionale {
    description: "Gap rispetto a media UE (73%)"
    unit: "%"
    derives_from: tasso_occupazione
    formula: tasso_occupazione - 73
  }

  // ── Simulazione ──

  simulate {
    runs: 2000
    method: monte_carlo
    seed: 42
    output: distribution
    percentiles: [5, 25, 50, 75, 95]
  }
}
`,
  },
  {
    id: 'climate',
    name: 'Clima & Energia',
    description: 'Template per scenari di transizione energetica',
    icon: '🌍',
    source: `// Scenario climatico — Transizione energetica
// Modifica le assunzioni per esplorare futuri alternativi

scenario "Transizione Energetica Locale" {
  timeframe: 2025 -> 2045
  resolution: yearly
  confidence: 0.5
  author: "Citizen Lab"
  version: "1.0"
  description: "Modello di transizione energetica con focus su
                rinnovabili, emissioni e costi per i cittadini"
  tags: ["clima", "energia", "rinnovabili", "emissioni"]

  // ── Assunzioni ──

  assumption prezzo_carbonio {
    value: 85
    source: "EU ETS, prezzo medio 2025"
    confidence: 0.6
    uncertainty: normal(±25%)
  }

  assumption costo_solare {
    value: 35
    source: "IRENA, LCOE solare 2025 (EUR/MWh)"
    confidence: 0.7
    uncertainty: normal(±15%)
  }

  assumption volonta_politica {
    value: 0.7
    source: "Indice composito politiche green UE"
    confidence: 0.5
    uncertainty: beta(7, 3)
  }

  // ── Parametri interattivi ──

  parameter sussidio_rinnovabili {
    value: 30
    range: [0, 60]
    label: "Sussidio rinnovabili"
    unit: "%"
    step: 5
    format: "{value}%"
    control: slider
    icon: "☀"
    color: "#10b981"
    description: "Incentivo statale sulle installazioni rinnovabili"
  }

  parameter obiettivo_emissioni {
    value: 55
    range: [30, 80]
    label: "Obiettivo riduzione CO₂"
    unit: "%"
    step: 5
    format: "-{value}% al 2045"
    control: slider
    icon: "🎯"
    color: "#06b6d4"
    description: "Target di riduzione emissioni rispetto al 2025"
  }

  // ── Variabili ──

  variable quota_rinnovabili {
    description: "Quota rinnovabili nel mix energetico"
    unit: "%"

    2025: 22
    2030: 35
    2035: 50
    2040: 65
    2045: 78

    depends_on: prezzo_carbonio, costo_solare
    uncertainty: normal(±12%)
    interpolation: spline
  }

  variable emissioni_co2 {
    description: "Emissioni annue di CO2"
    unit: "MtCO2"

    2025: 320
    2030: 260
    2035: 185
    2040: 110
    2045: 55

    depends_on: quota_rinnovabili
    uncertainty: normal(±15%)
    interpolation: linear
  }

  variable costo_energia {
    description: "Indice costo energia per famiglie (2025 = 100)"
    unit: "indice"

    2025: 100
    2030: 105
    2035: 92
    2040: 78
    2045: 65

    depends_on: quota_rinnovabili, costo_solare
    uncertainty: normal(±18%)
    interpolation: spline
  }

  // ── Branches ──

  branch "Crisi Energetica" when prezzo_carbonio > 150 {
    probability: 0.10

    variable costo_energia {
      2030: 135
      2035: 115
      2040: 88
      uncertainty: normal(±25%)
    }
  }

  // ── Impatti ──

  impact riduzione_emissioni {
    description: "Riduzione emissioni rispetto al 2025"
    unit: "%"
    derives_from: emissioni_co2
    formula: (320 - emissioni_co2) / 320 * 100
  }

  impact risparmio_famiglie {
    description: "Risparmio famiglie su energia (vs 2025)"
    unit: "indice"
    derives_from: costo_energia
    formula: 100 - costo_energia
  }

  // ── Simulazione ──

  simulate {
    runs: 2000
    method: monte_carlo
    seed: 42
    output: distribution
    percentiles: [5, 25, 50, 75, 95]
  }
}
`,
  },
  {
    id: 'demographic',
    name: 'Demografia',
    description: 'Template per scenari demografici e invecchiamento',
    icon: '👥',
    source: `// Scenario demografico
// Esplora l'impatto dell'invecchiamento della popolazione

scenario "Sfida Demografica" {
  timeframe: 2025 -> 2050
  resolution: yearly
  confidence: 0.6
  author: "Citizen Lab"
  version: "1.0"
  description: "Analisi dell'impatto demografico su welfare,
                pensioni e forza lavoro"
  tags: ["demografia", "pensioni", "welfare", "societa"]

  // ── Assunzioni ──

  assumption tasso_natalita {
    value: 1.24
    source: "ISTAT, TFT 2024"
    confidence: 0.7
    uncertainty: normal(±10%)
  }

  assumption saldo_migratorio {
    value: 300000
    source: "ISTAT, flussi migratori netti 2024"
    confidence: 0.4
    uncertainty: normal(±35%)
  }

  assumption aspettativa_vita {
    value: 83.5
    source: "ISTAT, speranza di vita alla nascita 2024"
    confidence: 0.8
    uncertainty: normal(±3%)
  }

  // ── Parametri interattivi ──

  parameter bonus_natalita {
    value: 5000
    range: [0, 15000]
    label: "Bonus natalità"
    unit: "€/anno"
    step: 500
    format: "{value} €"
    control: slider
    icon: "👶"
    color: "#ec4899"
    description: "Incentivo economico annuale per nuove nascite"
  }

  parameter quota_immigrazione {
    value: 300
    range: [100, 600]
    label: "Quota immigrazione"
    unit: "migliaia/anno"
    step: 25
    format: "{value}K persone"
    control: slider
    icon: "🌍"
    color: "#06b6d4"
    description: "Flusso migratorio netto annuale autorizzato (in migliaia)"
  }

  // ── Variabili ──

  variable popolazione_totale {
    description: "Popolazione totale Italia"
    unit: "milioni"

    2025: 58.8
    2030: 57.9
    2035: 56.8
    2040: 55.4
    2050: 52.5

    depends_on: tasso_natalita, saldo_migratorio
    uncertainty: normal(±5%)
    interpolation: spline
  }

  variable indice_dipendenza {
    description: "Rapporto anziani (65+) / popolazione attiva (15-64)"
    unit: "%"

    2025: 38
    2030: 42
    2035: 47
    2040: 53
    2050: 62

    depends_on: aspettativa_vita, tasso_natalita
    uncertainty: normal(±8%)
    interpolation: linear
  }

  variable spesa_pensionistica {
    description: "Spesa pensionistica in % del PIL"
    unit: "%"

    2025: 16.3
    2030: 17.0
    2035: 17.8
    2040: 18.5
    2050: 19.5

    depends_on: indice_dipendenza
    uncertainty: normal(±10%)
    interpolation: linear
  }

  // ── Branches ──

  branch "Ripresa Natalita" when tasso_natalita > 1.5 {
    probability: 0.10

    variable popolazione_totale {
      2035: 58.0
      2040: 57.5
      2050: 56.0
      uncertainty: normal(±5%)
    }
  }

  branch "Immigrazione Alta" when saldo_migratorio > 500000 {
    probability: 0.15

    variable popolazione_totale {
      2035: 58.5
      2040: 58.0
      2050: 57.0
      uncertainty: normal(±8%)
    }

    variable indice_dipendenza {
      2035: 44
      2040: 48
      2050: 55
      uncertainty: normal(±10%)
    }
  }

  // ── Impatti ──

  impact calo_demografico {
    description: "Calo popolazione rispetto al 2025"
    unit: "milioni"
    derives_from: popolazione_totale
    formula: popolazione_totale - 58.8
  }

  impact pressione_welfare {
    description: "Pressione aggiuntiva sul welfare (da 2025)"
    unit: "%"
    derives_from: spesa_pensionistica
    formula: spesa_pensionistica - 16.3
  }

  // ── Simulazione ──

  simulate {
    runs: 2000
    method: monte_carlo
    seed: 42
    output: distribution
    percentiles: [5, 25, 50, 75, 95]
  }
}
`,
  },
];
