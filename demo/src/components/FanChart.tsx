/**
 * FanChart — Monte Carlo uncertainty visualization.
 *
 * Renders stacked area bands (P5-P95, P25-P75) with a median line.
 */

import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, ComposedChart,
} from 'recharts';
import type { FanChartPoint } from '../lib/simulation';
import { formatValue } from '../lib/simulation';

export interface FanChartDisplay {
  id: string;
  label: string;
  description: string;
  unit: string;
  color: string;
  icon: string;
}

export default function FanChart({ data, display }: { data: FanChartPoint[]; display: FanChartDisplay }) {
  if (!data || data.length === 0) return null;
  const gid = `g-${display.id}`;
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 animate-fade-in">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-lg" aria-hidden>{display.icon}</span>
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">{display.label}</h3>
          <p className="text-[11px] text-zinc-500">{display.description}</p>
        </div>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-zinc-600 font-medium">{display.unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`${gid}-o`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={display.color} stopOpacity={0.1} /><stop offset="100%" stopColor={display.color} stopOpacity={0.1} /></linearGradient>
            <linearGradient id={`${gid}-i`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={display.color} stopOpacity={0.22} /><stop offset="100%" stopColor={display.color} stopOpacity={0.22} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(39,39,42)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgb(113,113,122)' }} axisLine={{ stroke: 'rgb(63,63,70)' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'rgb(113,113,122)' }} axisLine={{ stroke: 'rgb(63,63,70)' }} tickLine={false} tickFormatter={formatValue} width={50} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgb(24,24,27)', border: '1px solid rgb(63,63,70)', borderRadius: '12px', fontSize: '12px', color: 'rgb(212,212,216)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
            formatter={(value: number, name: string) => name === 'p50' ? [formatValue(value), 'Mediana'] : [null, null]}
            labelFormatter={(l) => `Anno ${l}`} labelStyle={{ color: 'rgb(161,161,170)', fontWeight: 600 }}
          />
          <Area type="monotone" dataKey="base" stackId="fan" fill="transparent" stroke="none" />
          <Area type="monotone" dataKey="outerLower" stackId="fan" fill={`url(#${gid}-o)`} stroke="none" />
          <Area type="monotone" dataKey="innerLower" stackId="fan" fill={`url(#${gid}-i)`} stroke="none" />
          <Area type="monotone" dataKey="innerUpper" stackId="fan" fill={`url(#${gid}-i)`} stroke="none" />
          <Area type="monotone" dataKey="outerUpper" stackId="fan" fill={`url(#${gid}-o)`} stroke="none" />
          <Line type="monotone" dataKey="p50" stroke={display.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: display.color, stroke: 'white', strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-2 text-[10px] text-zinc-600">
        <span className="flex items-center gap-1.5"><span className="w-6 h-1.5 rounded-full" style={{ backgroundColor: display.color, opacity: 0.2 }} />90% (P5-P95)</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-1.5 rounded-full" style={{ backgroundColor: display.color, opacity: 0.4 }} />50% (P25-P75)</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 rounded-full" style={{ backgroundColor: display.color }} />Mediana</span>
      </div>
    </div>
  );
}
