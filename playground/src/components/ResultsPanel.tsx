import { useState } from 'react';
import type { SimulationResult } from '../lib/sdl-bridge';
import { extractFanChartData, getVariableNames, getImpactNames, humanizeName } from '../lib/sdl-bridge';
import FanChart from './charts/FanChart';
import DistributionChart from './charts/DistributionChart';

interface ResultsPanelProps {
  result: SimulationResult | null;
  isSimulating: boolean;
}

type Tab = 'timeseries' | 'distributions' | 'summary';

const VAR_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#a855f7',
];

export default function ResultsPanel({ result, isSimulating }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('timeseries');

  if (isSimulating) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/30" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
        </div>
        <p className="text-sm text-slate-400 animate-pulse-slow">Running Monte Carlo simulation...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
          <span className="text-3xl">📊</span>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-300">
            Run the simulation to explore outcomes
          </p>
          <p className="text-xs text-slate-600 mt-1">
            See how different assumptions affect future projections
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-600">
          <span className="w-3 h-1.5 rounded-full bg-blue-500/30" />
          <span>2,000 Monte Carlo iterations</span>
        </div>
      </div>
    );
  }

  const varNames = getVariableNames(result);
  const impactNames = getImpactNames(result);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'timeseries', label: 'Projections' },
    { id: 'distributions', label: 'Outcomes' },
    { id: 'summary', label: 'Data Table' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-slate-700/60 px-4 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-3 py-2.5 text-xs font-medium border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'timeseries' && (
          <>
            {varNames.map((name, i) => {
              const data = extractFanChartData(result, name);
              const varResult = result.variables.get(name);
              return (
                <FanChart
                  key={name}
                  data={data}
                  title={humanizeName(name)}
                  color={VAR_COLORS[i % VAR_COLORS.length]}
                />
              );
            })}
          </>
        )}

        {activeTab === 'distributions' && (
          <>
            {varNames.map((name, i) => {
              const varResult = result.variables.get(name);
              if (!varResult || varResult.timeseries.length === 0) return null;
              const last = varResult.timeseries[varResult.timeseries.length - 1];
              return (
                <DistributionChart
                  key={name}
                  mean={last.distribution.mean}
                  std={last.distribution.std}
                  percentiles={last.distribution.percentiles}
                  title={`${humanizeName(name)} (${last.date.getFullYear()})`}
                  color={VAR_COLORS[i % VAR_COLORS.length]}
                />
              );
            })}
            {impactNames.map((name, i) => {
              const impactResult = result.impacts.get(name);
              if (!impactResult || impactResult.timeseries.length === 0) return null;
              const last = impactResult.timeseries[impactResult.timeseries.length - 1];
              return (
                <DistributionChart
                  key={name}
                  mean={last.distribution.mean}
                  std={last.distribution.std}
                  percentiles={last.distribution.percentiles}
                  title={`${humanizeName(name)} (${last.date.getFullYear()})`}
                  color={VAR_COLORS[(varNames.length + i) % VAR_COLORS.length]}
                />
              );
            })}
          </>
        )}

        {activeTab === 'summary' && <SummaryTable result={result} />}
      </div>
    </div>
  );
}

// ─── Summary Table ───

function SummaryTable({ result }: { result: SimulationResult }) {
  const fmt = (n: number): string => {
    if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
    if (Math.abs(n) < 0.01 && n !== 0) return n.toExponential(2);
    if (Math.abs(n) < 1) return n.toFixed(3);
    return n.toFixed(2);
  };

  const rows: { name: string; type: string; mean: string; std: string; p5: string; p95: string }[] = [];

  for (const [name, v] of result.variables) {
    if (v.timeseries.length === 0) continue;
    const last = v.timeseries[v.timeseries.length - 1];
    rows.push({
      name,
      type: 'Variable',
      mean: fmt(last.distribution.mean),
      std: fmt(last.distribution.std),
      p5: fmt(last.distribution.percentiles.get(5) ?? last.distribution.mean - 2 * last.distribution.std),
      p95: fmt(last.distribution.percentiles.get(95) ?? last.distribution.mean + 2 * last.distribution.std),
    });
  }

  for (const [name, v] of result.impacts) {
    if (v.timeseries.length === 0) continue;
    const last = v.timeseries[v.timeseries.length - 1];
    rows.push({
      name,
      type: 'Impact',
      mean: fmt(last.distribution.mean),
      std: fmt(last.distribution.std),
      p5: fmt(last.distribution.percentiles.get(5) ?? last.distribution.mean - 2 * last.distribution.std),
      p95: fmt(last.distribution.percentiles.get(95) ?? last.distribution.mean + 2 * last.distribution.std),
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-500 text-left uppercase tracking-wider text-[10px] border-b border-slate-700/50">
            <th className="py-2 pr-3">Name</th>
            <th className="py-2 pr-3">Type</th>
            <th className="py-2 pr-3 text-right">Mean</th>
            <th className="py-2 pr-3 text-right">Std</th>
            <th className="py-2 pr-3 text-right">P5</th>
            <th className="py-2 text-right">P95</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-slate-800/50 hover:bg-slate-800/30">
              <td className="py-2 pr-3 text-slate-200">{humanizeName(row.name)}</td>
              <td className="py-2 pr-3">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  row.type === 'Variable' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-violet-900/40 text-violet-400'
                }`}>
                  {row.type}
                </span>
              </td>
              <td className="py-2 pr-3 text-right font-mono text-slate-300">{row.mean}</td>
              <td className="py-2 pr-3 text-right font-mono text-slate-500">{row.std}</td>
              <td className="py-2 pr-3 text-right font-mono text-slate-500">{row.p5}</td>
              <td className="py-2 text-right font-mono text-slate-500">{row.p95}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
