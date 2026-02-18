/**
 * SDL Native Scenarios — Loaded directly from .sdl files.
 *
 * These scenarios are parsed and rendered entirely from SDL source,
 * without any TypeScript definitions. The UI (sliders, charts, metadata)
 * is extracted automatically from the AST by the SDL Renderer.
 */

import aiLavoroSdl from '../../public/sdl/ai-lavoro.sdl?raw';
import aiEnergiaSdl from '../../public/sdl/ai-energia.sdl?raw';
import aiFarmaciSdl from '../../public/sdl/ai-farmaci.sdl?raw';
import euroDigitaleSdl from '../../public/sdl/euro-digitale.sdl?raw';
import demografiaSdl from '../../public/sdl/demografia.sdl?raw';
import invernoEuSdl from '../../public/sdl/inverno-demografico-eu.sdl?raw';
import mobilitaSdl from '../../public/sdl/mobilita-autonoma.sdl?raw';
import difesaSdl from '../../public/sdl/difesa-europea.sdl?raw';
import sovranitaSdl from '../../public/sdl/sovranita-digitale.sdl?raw';
import crisiIdricaSdl from '../../public/sdl/crisi-idrica.sdl?raw';
import pandemicaSdl from '../../public/sdl/preparazione-pandemica.sdl?raw';
import urbanizzazioneSdl from '../../public/sdl/urbanizzazione-africa.sdl?raw';
import sorveglianzaSdl from '../../public/sdl/sorveglianza-biometrica.sdl?raw';
import rischioAiActSdl from '../../public/sdl/rischio-ai-act.sdl?raw';
import greenTransitionSdl from '../../public/sdl/green-transition-italy.sdl?raw';

export interface SdlNativeScenario {
  kind: 'sdl-native';
  id: string;
  source: string;
}

export const SDL_NATIVE_SCENARIOS: SdlNativeScenario[] = [
  { kind: 'sdl-native', id: 'sdl-ai-lavoro', source: aiLavoroSdl },
  { kind: 'sdl-native', id: 'sdl-ai-energia', source: aiEnergiaSdl },
  { kind: 'sdl-native', id: 'sdl-ai-farmaci', source: aiFarmaciSdl },
  { kind: 'sdl-native', id: 'sdl-euro-digitale', source: euroDigitaleSdl },
  { kind: 'sdl-native', id: 'sdl-demografia', source: demografiaSdl },
  { kind: 'sdl-native', id: 'sdl-inverno-demografico-eu', source: invernoEuSdl },
  { kind: 'sdl-native', id: 'sdl-mobilita-autonoma', source: mobilitaSdl },
  { kind: 'sdl-native', id: 'sdl-difesa-europea', source: difesaSdl },
  { kind: 'sdl-native', id: 'sdl-sovranita-digitale', source: sovranitaSdl },
  { kind: 'sdl-native', id: 'sdl-crisi-idrica', source: crisiIdricaSdl },
  { kind: 'sdl-native', id: 'sdl-preparazione-pandemica', source: pandemicaSdl },
  { kind: 'sdl-native', id: 'sdl-urbanizzazione-africa', source: urbanizzazioneSdl },
  { kind: 'sdl-native', id: 'sdl-sorveglianza-biometrica', source: sorveglianzaSdl },
  { kind: 'sdl-native', id: 'sdl-rischio-ai-act', source: rischioAiActSdl },
  { kind: 'sdl-native', id: 'sdl-green-transition', source: greenTransitionSdl },
];
