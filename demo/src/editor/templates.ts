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
    icon: 'file-text',
    source: `// ═══════════════════════════════════════════════════════
// SDL — Scenario Description Language
// ═══════════════════════════════════════════════════════
//
// Uno scenario SDL descrive un possibile futuro attraverso
// dati, assunzioni e simulazioni probabilistiche.
//
// Struttura:
//   scenario → assumption → parameter → variable → impact → simulate
//
// Modifica liberamente questo template per creare
// il tuo scenario personalizzato.
// ═══════════════════════════════════════════════════════

scenario "Il mio scenario" {

  // ── Metadati dello scenario ──
  // Definiscono l'orizzonte temporale, l'autore
  // e le informazioni generali.

  timeframe: 2025 -> 2040       // Intervallo di analisi (anno_inizio -> anno_fine)
  resolution: yearly             // Granularità: yearly | quarterly | monthly
  confidence: 0.6                // Fiducia complessiva (0 = bassa, 1 = alta)
  author: "Citizen Lab"
  version: "1.0"
  description: "Descrivi qui il tuo scenario"
  tags: ["custom"]
  subtitle: "Un template per iniziare"
  category: tecnologia           // Categoria tematica per la classificazione
  icon: "🔬"                     // Emoji visualizzata nella card
  color: "#3b82f6"               // Colore primario (hex)
  difficulty: base               // base | intermedio | avanzato

  // ── Assunzioni (assumption) ──
  // Un'assunzione è un dato di partenza che alimenta il modello.
  // Ha un valore, una fonte, un grado di fiducia e un'incertezza
  // statistica usata nella simulazione Monte Carlo.

  assumption crescita_base {
    value: 1.5                   // Valore numerico dell'assunzione
    source: "La tua fonte"       // Citazione della fonte dati
    confidence: 0.6              // Quanto sei sicuro di questo dato (0-1)
    uncertainty: normal(±20%)    // Distribuzione: normal(±X%) | beta(a,b) | uniform(a,b)
  }

  // ── Parametri interattivi (parameter) ──
  // I parametri con "control: slider" generano slider nell'interfaccia,
  // permettendo di esplorare scenari "what-if" in tempo reale.

  parameter intensita_investimento {
    value: 50                    // Valore di default
    range: [10, 100]             // Intervallo min-max dello slider
    label: "Intensità investimento"
    unit: "indice"               // Unità di misura mostrata all'utente
    step: 5                      // Incremento dello slider
    format: "{value} / 100"      // Formato di visualizzazione ({value} = placeholder)
    control: slider              // Tipo di controllo UI
    description: "Livello di investimento nel progetto (0-100)"
  }

  // ── Variabili (variable) ──
  // Contengono le serie temporali dello scenario.
  // Inserisci i dati-punto per gli anni chiave:
  // SDL interpola automaticamente i valori intermedi.

  variable indicatore_principale {
    description: "Il tuo indicatore principale"
    unit: "indice"
    label: "Indicatore principale"
    icon: "📊"
    color: "#3b82f6"

    // Serie temporale — anno: valore
    2025: 100
    2030: 120
    2035: 145
    2040: 170

    depends_on: crescita_base, intensita_investimento  // Dipendenze del modello
    uncertainty: normal(±15%)    // Incertezza sulla variabile (genera il fan chart)
    interpolation: linear        // Metodo: linear | spline
  }

  // ── Impatti (impact) ──
  // Variabili derivate, calcolate tramite formula a partire
  // da altre variabili. Utili per mostrare differenze,
  // percentuali o indicatori sintetici.

  impact variazione_netta {
    description: "Variazione rispetto al 2025"
    unit: "indice"
    label: "Variazione netta"
    icon: "📈"
    color: "#10b981"
    derives_from: indicatore_principale   // Variabile sorgente
    formula: indicatore_principale - 100  // Espressione di calcolo
  }

  // ── Simulazione Monte Carlo ──
  // Configura il motore probabilistico. Esegue N run con
  // variazioni casuali basate sulle incertezze dichiarate,
  // producendo distribuzioni statistiche (fan chart).

  simulate {
    runs: 2000                   // Numero di simulazioni (più = più preciso)
    method: monte_carlo          // Metodo di simulazione
    seed: 42                     // Seme per riproducibilità dei risultati
    output: distribution         // Tipo di output
    percentiles: [5, 25, 50, 75, 95]  // Percentili calcolati (bande del fan chart)
  }
}
`,
  },
  {
    id: 'economic',
    name: 'Economia & PIL',
    description: 'Template per scenari di crescita economica e occupazione',
    icon: 'trending-up',
    source: `// ═══════════════════════════════════════════════════════
// Scenario Economico — PIL, occupazione e debito
// ═══════════════════════════════════════════════════════
//
// Questo scenario modella la crescita economica italiana
// con tre variabili chiave (PIL reale, occupazione, debito/PIL)
// e due rami alternativi (recessione vs boom).
//
// Prova a muovere gli slider per rispondere a domande come:
//   → Cosa succede se aumentiamo la spesa pubblica?
//   → Come cambia il PIL se l'IRES scende al 18%?
// ═══════════════════════════════════════════════════════

scenario "Crescita Economica Italia" {

  // ── Metadati ──

  timeframe: 2025 -> 2040
  resolution: yearly
  confidence: 0.55              // Fiducia moderata: le previsioni macro a 15 anni sono incerte
  author: "Citizen Lab"
  version: "1.0"
  description: "Proiezione della crescita economica italiana
                con focus su PIL e tasso di occupazione"
  tags: ["economia", "pil", "occupazione", "italia"]

  // ── Assunzioni ──
  // Dati macro di partenza da fonti ufficiali.
  // L'incertezza alta (±40%) sulla crescita riflette
  // la volatilità delle previsioni economiche.

  assumption tasso_crescita_pil {
    value: 0.8                   // Crescita PIL tendenziale (% annuo)
    source: "ISTAT / Commissione Europea, previsioni 2025"
    confidence: 0.5              // Previsione incerta
    uncertainty: normal(±40%)    // Ampia variabilità possibile
  }

  assumption tasso_inflazione {
    value: 2.1                   // Target BCE
    source: "BCE target inflazione 2025"
    confidence: 0.6
    uncertainty: normal(±30%)
  }

  assumption investimenti_pnrr {
    value: 1                     // Indice 0-1 di completamento PNRR
    source: "Piano Nazionale Ripresa e Resilienza"
    confidence: 0.7
    uncertainty: beta(7, 3)      // Beta: asimmetrica, più probabile vicino a 1
  }

  // ── Parametri interattivi ──
  // Due leve di politica economica che l'utente può modificare
  // in tempo reale tramite slider.

  parameter spesa_pubblica_extra {
    value: 5                     // Default: 5 miliardi aggiuntivi/anno
    range: [0, 15]               // Da zero a forte stimolo fiscale
    label: "Spesa pubblica extra"
    unit: "mld €"
    step: 0.5
    format: "{value} mld €"
    control: slider
    description: "Spesa pubblica aggiuntiva annua per stimolo economico"
  }

  parameter aliquota_imprese {
    value: 24                    // IRES attuale
    range: [15, 35]              // Da taglio aggressivo a aumento
    label: "Aliquota IRES"
    unit: "%"
    step: 1
    format: "{value}%"
    control: slider
    description: "Aliquota fiscale sulle imprese (attuale 24%)"
  }

  // ── Variabili ──
  // Tre indicatori macroeconomici interconnessi.
  // Nota come depends_on collega ogni variabile alle sue cause:
  // il PIL dipende da crescita e investimenti, l'occupazione dal PIL.

  variable pil_reale {
    description: "PIL reale (miliardi EUR, prezzi 2025)"
    unit: "mld EUR"

    // Serie temporale — valori a prezzi costanti
    2025: 1910
    2028: 1960
    2030: 2000
    2035: 2120
    2040: 2250

    depends_on: tasso_crescita_pil, investimenti_pnrr, spesa_pubblica_extra
    uncertainty: normal(±10%)
    interpolation: spline        // Curva morbida tra i punti
  }

  variable tasso_occupazione {
    description: "Tasso di occupazione 15-64 anni"
    unit: "%"

    2025: 62
    2028: 63.5
    2030: 64.5
    2035: 66
    2040: 67.5

    depends_on: pil_reale, investimenti_pnrr, spesa_pubblica_extra
    uncertainty: normal(±8%)
    interpolation: linear
  }

  variable debito_pil {
    description: "Rapporto debito/PIL"
    unit: "%"

    // Traiettoria di discesa graduale
    2025: 137
    2028: 135
    2030: 133
    2035: 128
    2040: 122

    depends_on: pil_reale, tasso_crescita_pil, aliquota_imprese
    uncertainty: normal(±12%)
    interpolation: linear
  }

  // ── Branches (scenari alternativi) ──
  // Un branch si attiva "when" una condizione è vera.
  // Ridefinisce solo i dati-punto che cambiano;
  // il resto della variabile resta invariato.

  branch "Recessione Globale" when tasso_crescita_pil < 0 {
    probability: 0.15            // 15% di probabilità

    variable pil_reale {
      2028: 1880                 // Contrazione del PIL
      2030: 1900
      2035: 1980
      uncertainty: normal(±15%)  // Incertezza più alta in recessione
    }

    variable tasso_occupazione {
      2030: 60
      2035: 61.5
      uncertainty: normal(±10%)
    }
  }

  branch "Boom PNRR" when investimenti_pnrr > 0.9 {
    probability: 0.25            // 25% di probabilità

    variable pil_reale {
      2028: 1990                 // Crescita accelerata
      2030: 2060
      2035: 2250
      uncertainty: normal(±8%)   // Più certezza con investimenti forti
    }

    variable tasso_occupazione {
      2030: 66
      2035: 69
      uncertainty: normal(±6%)
    }
  }

  // ── Impatti ──
  // Metriche derivate per confronto immediato.

  impact crescita_cumulata {
    description: "Crescita cumulata PIL dal 2025"
    unit: "mld EUR"
    derives_from: pil_reale
    formula: pil_reale - 1910    // Differenza rispetto al valore iniziale
  }

  impact gap_occupazionale {
    description: "Gap rispetto a media UE (73%)"
    unit: "%"
    derives_from: tasso_occupazione
    formula: tasso_occupazione - 73  // Negativo = sotto la media UE
  }

  // ── Simulazione Monte Carlo ──

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
    icon: 'globe',
    source: `// ═══════════════════════════════════════════════════════
// Scenario Climatico — Transizione energetica
// ═══════════════════════════════════════════════════════
//
// Modella la transizione dal fossile alle rinnovabili,
// tracciando emissioni CO₂, quota green e costo energia.
//
// Domande esplorabili con gli slider:
//   → I sussidi alle rinnovabili accelerano davvero la transizione?
//   → Quanto risparmiano le famiglie nel lungo periodo?
//   → Cosa succede se il prezzo del carbonio raddoppia?
// ═══════════════════════════════════════════════════════

scenario "Transizione Energetica Locale" {

  // ── Metadati ──

  timeframe: 2025 -> 2045       // Orizzonte a 20 anni (transizione lenta)
  resolution: yearly
  confidence: 0.5               // Fiducia bassa: forte dipendenza da scelte politiche
  author: "Citizen Lab"
  version: "1.0"
  description: "Modello di transizione energetica con focus su
                rinnovabili, emissioni e costi per i cittadini"
  tags: ["clima", "energia", "rinnovabili", "emissioni"]

  // ── Assunzioni ──
  // Tre driver fondamentali: il prezzo del carbonio (EU ETS),
  // il costo del solare (in calo strutturale) e la volontà
  // politica di sostenere la transizione.

  assumption prezzo_carbonio {
    value: 85                    // EUR/tonnellata CO₂ nel mercato ETS
    source: "EU ETS, prezzo medio 2025"
    confidence: 0.6
    uncertainty: normal(±25%)    // Mercato volatile
  }

  assumption costo_solare {
    value: 35                    // Costo livellato dell'energia solare
    source: "IRENA, LCOE solare 2025 (EUR/MWh)"
    confidence: 0.7              // Trend tecnologico abbastanza prevedibile
    uncertainty: normal(±15%)
  }

  assumption volonta_politica {
    value: 0.7                   // Indice 0-1 (1 = massimo impegno green)
    source: "Indice composito politiche green UE"
    confidence: 0.5
    uncertainty: beta(7, 3)      // Asimmetrica: più probabile sopra 0.5
  }

  // ── Parametri interattivi ──
  // L'utente può regolare le politiche climatiche:
  // sussidi alle rinnovabili e target di riduzione CO₂.

  parameter sussidio_rinnovabili {
    value: 30
    range: [0, 60]               // 0% = nessun incentivo, 60% = molto generoso
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
    range: [30, 80]              // Target ambizioso (80%) vs minimo (30%)
    label: "Obiettivo riduzione CO₂"
    unit: "%"
    step: 5
    format: "-{value}% al 2045"  // Formato custom: mostra il target
    control: slider
    icon: "🎯"
    color: "#06b6d4"
    description: "Target di riduzione emissioni rispetto al 2025"
  }

  // ── Variabili ──
  // Tre metriche interconnesse: la quota rinnovabili guida
  // la discesa delle emissioni, che a sua volta influenza
  // il costo energia nel medio-lungo periodo.

  variable quota_rinnovabili {
    description: "Quota rinnovabili nel mix energetico"
    unit: "%"

    // Crescita dal 22% attuale al 78% nel 2045
    2025: 22
    2030: 35
    2035: 50
    2040: 65
    2045: 78

    depends_on: prezzo_carbonio, costo_solare, sussidio_rinnovabili
    uncertainty: normal(±12%)
    interpolation: spline        // Curva a S tipica dell'adozione tecnologica
  }

  variable emissioni_co2 {
    description: "Emissioni annue di CO2"
    unit: "MtCO2"

    // Traiettoria di decarbonizzazione
    2025: 320
    2030: 260
    2035: 185
    2040: 110
    2045: 55

    depends_on: quota_rinnovabili, obiettivo_emissioni
    uncertainty: normal(±15%)
    interpolation: linear
  }

  variable costo_energia {
    description: "Indice costo energia per famiglie (2025 = 100)"
    unit: "indice"

    // Inizialmente sale (costi di transizione),
    // poi scende grazie alle rinnovabili più economiche
    2025: 100
    2030: 105
    2035: 92
    2040: 78
    2045: 65

    depends_on: quota_rinnovabili, costo_solare, sussidio_rinnovabili
    uncertainty: normal(±18%)    // Alta incertezza sui prezzi energetici
    interpolation: spline
  }

  // ── Branch (scenario alternativo) ──
  // Se il prezzo del carbonio supera 150 €/t (shock energetico),
  // i costi per le famiglie salgono nel breve periodo.

  branch "Crisi Energetica" when prezzo_carbonio > 150 {
    probability: 0.10            // 10% di probabilità

    variable costo_energia {
      2030: 135                  // Picco dei costi
      2035: 115
      2040: 88
      uncertainty: normal(±25%)  // Grande incertezza in scenario di crisi
    }
  }

  // ── Impatti ──
  // Due metriche sintetiche per comunicare i risultati
  // in modo immediato al cittadino.

  impact riduzione_emissioni {
    description: "Riduzione emissioni rispetto al 2025"
    unit: "%"
    derives_from: emissioni_co2
    formula: (320 - emissioni_co2) / 320 * 100  // % di riduzione dal baseline
  }

  impact risparmio_famiglie {
    description: "Risparmio famiglie su energia (vs 2025)"
    unit: "indice"
    derives_from: costo_energia
    formula: 100 - costo_energia  // Positivo = risparmio, negativo = aumento
  }

  // ── Simulazione Monte Carlo ──

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
    icon: 'users',
    source: `// ═══════════════════════════════════════════════════════
// Scenario Demografico — Popolazione, welfare e pensioni
// ═══════════════════════════════════════════════════════
//
// L'Italia perde circa 300.000 abitanti/anno. Questo scenario
// modella l'impatto dell'invecchiamento su popolazione,
// indice di dipendenza e spesa pensionistica fino al 2050.
//
// Domande esplorabili con gli slider:
//   → Un bonus natalità di 10.000€ frena il declino?
//   → Quanta immigrazione serve per stabilizzare la popolazione?
//   → Come cambia la pressione sul welfare?
// ═══════════════════════════════════════════════════════

scenario "Sfida Demografica" {

  // ── Metadati ──

  timeframe: 2025 -> 2050       // Orizzonte a 25 anni (i trend demografici sono lenti)
  resolution: yearly
  confidence: 0.6               // Fiducia discreta: i dati ISTAT sono solidi
  author: "Citizen Lab"
  version: "1.0"
  description: "Analisi dell'impatto demografico su welfare,
                pensioni e forza lavoro"
  tags: ["demografia", "pensioni", "welfare", "societa"]

  // ── Assunzioni ──
  // Tre fattori demografici fondamentali: quanti nascono,
  // quanti arrivano dall'estero, quanto si vive.

  assumption tasso_natalita {
    value: 1.24                  // Figli per donna (TFT) — tra i più bassi al mondo
    source: "ISTAT, TFT 2024"
    confidence: 0.7              // Dato stabile negli ultimi anni
    uncertainty: normal(±10%)
  }

  assumption saldo_migratorio {
    value: 300000                // Ingressi netti annui
    source: "ISTAT, flussi migratori netti 2024"
    confidence: 0.4              // Molto sensibile a politiche e crisi geopolitiche
    uncertainty: normal(±35%)    // Ampia variabilità storica
  }

  assumption aspettativa_vita {
    value: 83.5                  // Anni, alla nascita
    source: "ISTAT, speranza di vita alla nascita 2024"
    confidence: 0.8              // Trend stabile e prevedibile
    uncertainty: normal(±3%)
  }

  // ── Parametri interattivi ──
  // Due leve politiche: incentivi alla natalità
  // e gestione dei flussi migratori.

  parameter bonus_natalita {
    value: 5000                  // Incentivo attuale
    range: [0, 15000]            // Da nessun bonus a incentivo forte
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
    value: 300                   // Migliaia di persone/anno
    range: [100, 600]            // Da restrittivo a porte aperte
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
  // Tre indicatori interconnessi: la popolazione cala,
  // l'indice di dipendenza sale, la spesa pensionistica cresce.

  variable popolazione_totale {
    description: "Popolazione totale Italia"
    unit: "milioni"

    // Declino costante: -6,3 milioni in 25 anni
    2025: 58.8
    2030: 57.9
    2035: 56.8
    2040: 55.4
    2050: 52.5

    depends_on: tasso_natalita, saldo_migratorio, bonus_natalita, quota_immigrazione
    uncertainty: normal(±5%)
    interpolation: spline
  }

  variable indice_dipendenza {
    description: "Rapporto anziani (65+) / popolazione attiva (15-64)"
    unit: "%"

    // Da 38 a 62: quasi 2 anziani ogni 3 lavoratori nel 2050
    2025: 38
    2030: 42
    2035: 47
    2040: 53
    2050: 62

    depends_on: aspettativa_vita, tasso_natalita, bonus_natalita, quota_immigrazione
    uncertainty: normal(±8%)
    interpolation: linear
  }

  variable spesa_pensionistica {
    description: "Spesa pensionistica in % del PIL"
    unit: "%"

    // Crescita graduale trainata dall'invecchiamento
    2025: 16.3
    2030: 17.0
    2035: 17.8
    2040: 18.5
    2050: 19.5

    depends_on: indice_dipendenza  // Legata direttamente al rapporto anziani/attivi
    uncertainty: normal(±10%)
    interpolation: linear
  }

  // ── Branches (scenari alternativi) ──
  // Due ipotesi ottimistiche: ripresa della natalità
  // oppure flussi migratori molto più alti.

  branch "Ripresa Natalita" when tasso_natalita > 1.5 {
    probability: 0.10            // 10% — scenario poco probabile ma possibile

    variable popolazione_totale {
      2035: 58.0                 // Declino rallentato
      2040: 57.5
      2050: 56.0
      uncertainty: normal(±5%)
    }
  }

  branch "Immigrazione Alta" when saldo_migratorio > 500000 {
    probability: 0.15            // 15% — dipende da politiche migratorie

    variable popolazione_totale {
      2035: 58.5                 // Popolazione quasi stabile
      2040: 58.0
      2050: 57.0
      uncertainty: normal(±8%)
    }

    variable indice_dipendenza {
      2035: 44                   // Più lavoratori giovani = meno pressione
      2040: 48
      2050: 55
      uncertainty: normal(±10%)
    }
  }

  // ── Impatti ──
  // Metriche sintetiche per comunicare
  // la portata del cambiamento demografico.

  impact calo_demografico {
    description: "Calo popolazione rispetto al 2025"
    unit: "milioni"
    derives_from: popolazione_totale
    formula: popolazione_totale - 58.8  // Negativo = popolazione persa
  }

  impact pressione_welfare {
    description: "Pressione aggiuntiva sul welfare (da 2025)"
    unit: "%"
    derives_from: spesa_pensionistica
    formula: spesa_pensionistica - 16.3  // Punti % di spesa in più
  }

  // ── Simulazione Monte Carlo ──

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
