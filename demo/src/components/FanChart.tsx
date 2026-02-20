/**
 * FanChart — Monte Carlo uncertainty visualization with optional historical data.
 *
 * Renders:
 *   - Historical observed data as a solid white line with dots (when available)
 *   - Stacked area bands (P5-P95, P25-P75) with a median line for projections
 *   - Human-readable legend, rich tooltip, uncertainty indicator
 *   - Source attribution for historical data
 */

import { useMemo } from 'react';
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, ComposedChart, ReferenceLine,
} from 'recharts';
import type { FanChartPoint } from '../lib/simulation';
import { formatValue, getUncertaintyLevel } from '../lib/simulation';
import type { UncertaintyLevel } from '../lib/simulation';
import type { HistoricalPoint, VariableHistorical } from '../lib/pulse-bridge';
import { SdlIcon } from '../lib/icons';

export interface FanChartDisplay {
  id: string;
  label: string;
  description: string;
  unit: string;
  color: string;
  icon: string;
}

interface MergedPoint {
  year: number;
  observed?: number;
  isProvisional?: boolean;
  base?: number;
  outerLower?: number;
  innerLower?: number;
  innerUpper?: number;
  outerUpper?: number;
  p50?: number;
  absP5?: number;
  absP25?: number;
  absP75?: number;
  absP95?: number;
}

const UNCERTAINTY_CONFIG: Record<UncertaintyLevel, { label: string; color: string; bg: string; hint: string }> = {
  'bassa': {
    label: 'Incertezza bassa',
    color: 'rgb(34,197,94)',
    bg: 'rgba(34,197,94,0.1)',
    hint: 'Le simulazioni convergono: il risultato futuro è relativamente prevedibile.',
  },
  'media': {
    label: 'Incertezza moderata',
    color: 'rgb(234,179,8)',
    bg: 'rgba(234,179,8,0.1)',
    hint: 'C\'è un margine di variabilità significativo tra gli scenari simulati.',
  },
  'alta': {
    label: 'Incertezza alta',
    color: 'rgb(249,115,22)',
    bg: 'rgba(249,115,22,0.1)',
    hint: 'Il ventaglio dei risultati è ampio: piccoli cambiamenti nelle assunzioni producono esiti molto diversi.',
  },
  'molto alta': {
    label: 'Incertezza molto alta',
    color: 'rgb(239,68,68)',
    bg: 'rgba(239,68,68,0.1)',
    hint: 'Il futuro è altamente incerto. I risultati vanno interpretati come esplorativi, non come previsioni.',
  },
};

function mergeData(
  fanData: FanChartPoint[],
  historical?: HistoricalPoint[],
): { merged: MergedPoint[]; transitionYear: number | null } {
  if (!historical || historical.length === 0) {
    return {
      merged: fanData.map(d => ({ ...d, observed: undefined })),
      transitionYear: null,
    };
  }

  const firstSimYear = fanData[0]?.year ?? Infinity;
  const map = new Map<number, MergedPoint>();

  for (const h of historical) {
    if (h.year < firstSimYear) {
      map.set(h.year, { year: h.year, observed: h.value, isProvisional: h.provisional });
    }
  }

  for (const d of fanData) {
    const histPoint = historical.find(h => h.year === d.year);
    map.set(d.year, {
      ...d,
      observed: histPoint?.value,
      isProvisional: histPoint?.provisional,
    });
  }

  const merged = Array.from(map.values()).sort((a, b) => a.year - b.year);
  const transitionYear = firstSimYear;

  return { merged, transitionYear };
}

function CustomTooltip({ active, payload, label, unit, color }: {
  active?: boolean;
  payload?: Array<{ payload: MergedPoint }>;
  label?: number;
  unit: string;
  color: string;
}) {
  if (!active || !payload || !payload[0]) return null;
  const d = payload[0].payload;
  const hasObserved = d.observed != null;
  const hasProjection = d.p50 != null;

  return (
    <div style={{
      backgroundColor: 'rgb(24,24,27)',
      border: '1px solid rgb(63,63,70)',
      borderRadius: '14px',
      padding: '14px 16px',
      fontSize: '12px',
      color: 'rgb(212,212,216)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      minWidth: '200px',
    }}>
      <p style={{ color: 'rgb(161,161,170)', fontWeight: 700, marginBottom: '10px', fontSize: '13px' }}>
        Anno {label}
      </p>

      {hasObserved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: hasProjection ? '8px' : 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white', display: 'inline-block', border: '2px solid rgb(161,161,170)' }} />
          <span style={{ fontWeight: 600 }}>
            Dato osservato: {formatValue(d.observed!)} {unit}
          </span>
          {d.isProvisional && <span style={{ fontSize: '9px', color: 'rgb(113,113,122)', fontStyle: 'italic' }}>(provvisorio)</span>}
        </div>
      )}

      {hasProjection && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              width: '10px', height: '3px', borderRadius: '2px',
              backgroundColor: color, display: 'inline-block',
            }} />
            <span style={{ color: 'rgb(228,228,231)', fontWeight: 600 }}>
              Valore mediano: {formatValue(d.p50!)} {unit}
            </span>
          </div>

          {hasObserved && d.p50 != null && (
            <div style={{
              padding: '4px 8px', borderRadius: '6px', marginBottom: '8px', fontSize: '10px',
              backgroundColor: Math.abs(d.p50 - d.observed!) / Math.abs(d.observed! || 1) < 0.1
                ? 'rgba(34,197,94,0.1)' : 'rgba(249,115,22,0.1)',
              color: Math.abs(d.p50 - d.observed!) / Math.abs(d.observed! || 1) < 0.1
                ? 'rgb(34,197,94)' : 'rgb(249,115,22)',
            }}>
              Scarto: {((d.p50 - d.observed!) / Math.abs(d.observed! || 1) * 100).toFixed(1)}%
            </div>
          )}

          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '8px 10px',
          }}>
            <p style={{ fontSize: '10px', color: 'rgb(113,113,122)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Range dei risultati simulati
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
              <span style={{ color: 'rgb(161,161,170)' }}>Scenario più probabile</span>
              <span style={{ color: 'rgb(212,212,216)', fontWeight: 500 }}>
                {formatValue(d.absP25!)} – {formatValue(d.absP75!)} {unit}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: 'rgb(161,161,170)' }}>Scenario più ampio</span>
              <span style={{ color: 'rgb(161,161,170)', fontWeight: 500 }}>
                {formatValue(d.absP5!)} – {formatValue(d.absP95!)} {unit}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface FanChartProps {
  data: FanChartPoint[];
  display: FanChartDisplay;
  historical?: VariableHistorical;
}

export default function FanChart({ data, display, historical }: FanChartProps) {
  if (!data || data.length === 0) return null;

  const gid = `g-${display.id}`;
  const uncertainty = getUncertaintyLevel(data);
  const uConfig = UNCERTAINTY_CONFIG[uncertainty];

  const { merged, transitionYear } = useMemo(
    () => mergeData(data, historical?.data),
    [data, historical?.data],
  );

  const hasHistorical = historical && historical.data.length > 0;
  const firstYear = merged[0]?.year;
  const lastYear = merged[merged.length - 1]?.year;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <span aria-hidden style={{ color: display.color }}><SdlIcon name={display.icon} size={20} /></span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-zinc-200">{display.label}</h3>
          <p className="text-[11px] text-zinc-500">{display.description}</p>
        </div>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-zinc-600 font-medium shrink-0">{display.unit}</span>
      </div>

      {/* Contextual reading hint */}
      <p className="text-[11px] text-zinc-600 mb-4 leading-relaxed">
        {hasHistorical ? (
          <>
            I <strong className="text-zinc-400">punti bianchi</strong> sono dati reali osservati ({historical.source}).
            La <strong className="text-zinc-500">banda colorata</strong> è la proiezione simulata dal {transitionYear} in poi: più è larga, più il futuro è incerto.
          </>
        ) : (
          <>
            Possibile evoluzione di <strong className="text-zinc-500">{display.label.toLowerCase()}</strong> dal {firstYear} al {lastYear}.
            La banda colorata mostra il ventaglio dei risultati simulati: più è larga, più il futuro è incerto.
          </>
        )}
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={hasHistorical ? 240 : 210}>
        <ComposedChart data={merged} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`${gid}-o`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={display.color} stopOpacity={0.1} /><stop offset="100%" stopColor={display.color} stopOpacity={0.1} /></linearGradient>
            <linearGradient id={`${gid}-i`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={display.color} stopOpacity={0.22} /><stop offset="100%" stopColor={display.color} stopOpacity={0.22} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(39,39,42)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgb(113,113,122)' }} axisLine={{ stroke: 'rgb(63,63,70)' }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: 'rgb(113,113,122)' }}
            axisLine={{ stroke: 'rgb(63,63,70)' }}
            tickLine={false}
            tickFormatter={formatValue}
            width={55}
            label={{ value: display.unit, position: 'insideTopLeft', offset: -5, style: { fontSize: 10, fill: 'rgb(82,82,91)', fontWeight: 500 } }}
          />
          <Tooltip content={<CustomTooltip unit={display.unit} color={display.color} />} />

          {transitionYear && (
            <ReferenceLine
              x={transitionYear}
              stroke="rgb(63,63,70)"
              strokeDasharray="4 4"
              label={{ value: 'Proiezione →', position: 'top', style: { fontSize: 9, fill: 'rgb(82,82,91)' } }}
            />
          )}

          {/* Fan chart areas */}
          <Area type="monotone" dataKey="base" stackId="fan" fill="transparent" stroke="none" />
          <Area type="monotone" dataKey="outerLower" stackId="fan" fill={`url(#${gid}-o)`} stroke="none" />
          <Area type="monotone" dataKey="innerLower" stackId="fan" fill={`url(#${gid}-i)`} stroke="none" />
          <Area type="monotone" dataKey="innerUpper" stackId="fan" fill={`url(#${gid}-i)`} stroke="none" />
          <Area type="monotone" dataKey="outerUpper" stackId="fan" fill={`url(#${gid}-o)`} stroke="none" />

          {/* Median projection line */}
          <Line type="monotone" dataKey="p50" stroke={display.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: display.color, stroke: 'white', strokeWidth: 2 }} />

          {/* Historical observed data */}
          {hasHistorical && (
            <Line
              type="monotone"
              dataKey="observed"
              stroke="rgb(228,228,231)"
              strokeWidth={2}
              dot={{ r: 3.5, fill: 'rgb(24,24,27)', stroke: 'rgb(228,228,231)', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: 'white', stroke: 'rgb(228,228,231)', strokeWidth: 2 }}
              connectNulls={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2.5 text-[10px] text-zinc-500 flex-wrap">
        {hasHistorical && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border-2 border-zinc-300 bg-zinc-950" />
            Dato osservato
          </span>
        )}
        <span className="flex items-center gap-1.5" title="Il 90% delle simulazioni ricade in questa fascia">
          <span className="w-6 h-1.5 rounded-full" style={{ backgroundColor: display.color, opacity: 0.2 }} />
          Fascia ampia <span className="text-zinc-600">(9 su 10)</span>
        </span>
        <span className="flex items-center gap-1.5" title="Il 50% delle simulazioni ricade in questa fascia">
          <span className="w-6 h-1.5 rounded-full" style={{ backgroundColor: display.color, opacity: 0.4 }} />
          Fascia probabile <span className="text-zinc-600">(1 su 2)</span>
        </span>
        <span className="flex items-center gap-1.5" title="Il valore che divide a metà tutti i risultati simulati">
          <span className="w-6 h-0.5 rounded-full" style={{ backgroundColor: display.color }} />
          Valore mediano
        </span>
      </div>

      {/* Uncertainty indicator */}
      <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: uConfig.bg }}>
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: uConfig.color }} />
        <span className="text-[11px] font-medium" style={{ color: uConfig.color }}>{uConfig.label}</span>
        <span className="text-[10px] text-zinc-500 leading-snug">{uConfig.hint}</span>
      </div>

      {/* Source attribution */}
      {hasHistorical && (
        <div className="mt-2 flex items-center gap-2 text-[9px] text-zinc-600">
          <span className="shrink-0">Fonte dati:</span>
          <a
            href={historical.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400/60 hover:text-blue-400 transition-colors truncate"
          >
            {historical.source}
          </a>
          <span className="shrink-0 text-zinc-700">Agg. {historical.lastUpdate}</span>
        </div>
      )}
    </div>
  );
}
