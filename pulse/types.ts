/**
 * SDL Pulse — Type Definitions
 *
 * Types for the live data binding, calibration, and watchdog system.
 */

import type { DistributionExpression } from '../core/types';

// ── Observed Data ──

export interface ObservedPoint {
  date: Date;
  value: number;
  source: string;
  provisional?: boolean;
}

export interface ObservedTimeseries {
  targetId: string;
  points: ObservedPoint[];
  lastFetch: Date;
  sourceUrl: string;
  unit?: string;
  label?: string;
}

// ── Watch Alerts ──

export interface WatchAlert {
  target: string;
  severity: 'warn' | 'error';
  message: string;
  observed: number;
  assumed: number;
  rule: string;
  timestamp: Date;
}

// ── Calibration ──

export interface CalibrationResult {
  target: string;
  originalDistribution: DistributionExpression;
  calibratedDistribution: DistributionExpression;
  dataPointsUsed: number;
  posteriorMean: number;
  posteriorStd: number;
}

// ── Pulse Result (aggregate) ──

export interface PulseResult {
  scenario: string;
  observed: Map<string, ObservedTimeseries>;
  alerts: WatchAlert[];
  calibrations: Map<string, CalibrationResult>;
  fetchedAt: Date;
  isLive: boolean;
}

// ── Data Adapter interface ──

export interface DataAdapterConfig {
  sourceUrl: string;
  field?: string;
  fallbackValue?: number;
  targetId: string;
  label?: string;
  unit?: string;
}

export interface DataAdapter {
  readonly name: string;
  canHandle(url: string): boolean;
  fetch(config: DataAdapterConfig): Promise<ObservedPoint[]>;
}

// ── Pulse Options ──

export interface PulseOptions {
  adapters?: DataAdapter[];
  timeoutMs?: number;
  skipFetch?: boolean;
  skipCalibration?: boolean;
  skipWatch?: boolean;
}
