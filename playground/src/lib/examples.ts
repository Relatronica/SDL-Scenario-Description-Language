/**
 * SDL Playground — Example Loader
 *
 * Loads .sdl files from examples/ via Vite raw imports.
 * Metadata (name, description, tags) is extracted automatically
 * from the SDL source — no duplication needed.
 */

import aiGovernanceSource from '@sdl/examples/ai-governance-2030.sdl?raw';
import greenTransitionSource from '@sdl/examples/green-transition-italy.sdl?raw';
import digitalEuroSource from '@sdl/examples/digital-euro-adoption.sdl?raw';
import demographicWinterSource from '@sdl/examples/demographic-winter-europe.sdl?raw';
import waterScarcitySource from '@sdl/examples/water-scarcity-mediterranean.sdl?raw';
import pandemicSource from '@sdl/examples/pandemic-preparedness-2035.sdl?raw';
import africanUrbanSource from '@sdl/examples/african-urban-leapfrog-2050.sdl?raw';
import euDefenseSource from '@sdl/examples/eu-defense-autonomy-2035.sdl?raw';

export interface SDLExample {
  name: string;
  description: string;
  tags: string[];
  source: string;
}

function parseExample(source: string): SDLExample {
  const name = source.match(/scenario\s+"([^"]+)"/)?.[1] ?? 'Unknown Scenario';

  const rawDesc = source.match(/description:\s+"([^"]+)"/)?.[1] ?? '';
  const description = rawDesc.replace(/\s+/g, ' ').trim();

  const tagsBlock = source.match(/tags:\s+\[([^\]]+)\]/)?.[1] ?? '';
  const tags = [...tagsBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

  return { name, description, tags, source };
}

export const EXAMPLES: SDLExample[] = [
  parseExample(aiGovernanceSource),
  parseExample(greenTransitionSource),
  parseExample(digitalEuroSource),
  parseExample(demographicWinterSource),
  parseExample(waterScarcitySource),
  parseExample(pandemicSource),
  parseExample(africanUrbanSource),
  parseExample(euDefenseSource),
];
