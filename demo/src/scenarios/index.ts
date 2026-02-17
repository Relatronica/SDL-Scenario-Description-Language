/**
 * SDL Citizen Lab — Scenario Library
 *
 * Central registry of all available scenarios.
 */

export type { ScenarioDefinition, ScenarioMeta, SliderDef, VariableDisplay, ScenarioCategory } from './types';
export { CATEGORY_LABELS, CATEGORY_COLORS } from './types';

import aiLavoro from './ai-lavoro';
import aiEnergia from './ai-energia';
import aiFarmaci from './ai-farmaci';
import mobilitaAutonoma from './mobilita-autonoma';
import energia from './energia';
import demografia from './demografia';
import sovranitaDigitale from './sovranita-digitale';
import euroDigitale from './euro-digitale';
import invernoDemograficoEu from './inverno-demografico-eu';
import crisiIdrica from './crisi-idrica';
import preparazionePandemica from './preparazione-pandemica';
import urbanizzazioneAfrica from './urbanizzazione-africa';
import difesaEuropea from './difesa-europea';
import type { ScenarioDefinition } from './types';

export const SCENARIOS: ScenarioDefinition[] = [
  aiLavoro,
  aiEnergia,
  aiFarmaci,
  mobilitaAutonoma,
  energia,
  demografia,
  sovranitaDigitale,
  euroDigitale,
  invernoDemograficoEu,
  crisiIdrica,
  preparazionePandemica,
  urbanizzazioneAfrica,
  difesaEuropea,
];

export function getScenarioById(id: string): ScenarioDefinition | undefined {
  return SCENARIOS.find(s => s.meta.id === id);
}
