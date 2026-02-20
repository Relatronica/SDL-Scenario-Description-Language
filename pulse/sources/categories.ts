/**
 * SDL Pulse — Source Categories
 *
 * Taxonomy for the verified data-source registry.
 */

export type SourceCategory =
  | 'demographics'
  | 'energy'
  | 'climate'
  | 'economy'
  | 'digital'
  | 'health'
  | 'defense'
  | 'transport'
  | 'governance';

export const CATEGORY_META: Record<SourceCategory, { label: string; icon: string }> = {
  demographics: { label: 'Demografia', icon: '👥' },
  energy:       { label: 'Energia', icon: '⚡' },
  climate:      { label: 'Clima e Ambiente', icon: '🌍' },
  economy:      { label: 'Economia', icon: '📊' },
  digital:      { label: 'Digitale', icon: '💻' },
  health:       { label: 'Salute', icon: '🏥' },
  defense:      { label: 'Difesa e Sicurezza', icon: '🛡' },
  transport:    { label: 'Trasporti e Mobilità', icon: '🚗' },
  governance:   { label: 'Governance e Regolamentazione', icon: '⚖' },
};
