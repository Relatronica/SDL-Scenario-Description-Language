/**
 * SDL Citizen Lab — Scenario Type System
 *
 * Shared types for all scenarios in the library.
 */

// ─── Slider Definition ───

export interface SliderDef {
  id: string;
  label: string;
  description: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
  source: string;
  format: (v: number) => string;
}

// ─── Variable Display ───

export interface VariableDisplay {
  id: string;
  label: string;
  description: string;
  unit: string;
  color: string;
  type: 'variable' | 'impact';
  icon: string;
}

// ─── Scenario Metadata ───

export interface ScenarioMeta {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: ScenarioCategory;
  tags: string[];
  icon: string;
  color: string;
  period: string;
  difficulty: 'base' | 'intermedio' | 'avanzato';
}

export type ScenarioCategory =
  | 'tecnologia'
  | 'economia'
  | 'ambiente'
  | 'societa'
  | 'politica'
  | 'regolamentazione';

export const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  tecnologia: 'Tecnologia',
  economia: 'Economia',
  ambiente: 'Ambiente',
  societa: 'Società',
  politica: 'Politica',
  regolamentazione: 'Regolamentazione AI',
};

export const CATEGORY_COLORS: Record<ScenarioCategory, string> = {
  tecnologia: '#3b82f6',
  economia: '#f59e0b',
  ambiente: '#10b981',
  societa: '#8b5cf6',
  politica: '#ef4444',
  regolamentazione: '#6366f1',
};

