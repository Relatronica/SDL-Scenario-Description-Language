/**
 * SensitivityPanel — Tornado chart showing which parameters most influence outputs.
 */

import { useMemo } from 'react';
import type { SensitivityResult } from '../lib/sensitivity';
import { formatValue } from '../lib/simulation';

interface SensitivityPanelProps {
  data: SensitivityResult[];
}

export default function SensitivityPanel({ data }: SensitivityPanelProps) {
  if (data.length === 0) {
    return (
      <p className="text-[11px] text-zinc-500">
        Questo scenario non ha parametri interattivi. La sensitivity analysis richiede almeno un parametro con cursore.
      </p>
    );
  }

  const maxSwing = useMemo(() => Math.max(...data.map(d => d.totalSwing), 1), [data]);

  return (
    <div className="space-y-5">
      <p className="text-[11px] text-zinc-500 leading-relaxed">
        Quali parametri influenzano di più i risultati? Ogni barra mostra quanto cambiano le uscite
        quando un singolo parametro viene portato dal minimo al massimo, tenendo fermi gli altri.
        I parametri più influenti sono in alto.
      </p>

      {data.map((item, i) => {
        const barWidth = Math.max(4, (item.totalSwing / maxSwing) * 100);
        const rank = i + 1;
        const isTop = rank <= 2;

        return (
          <div key={item.inputId} className="bg-zinc-900/40 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                isTop ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {rank}
              </span>
              <h4 className="text-xs font-semibold text-zinc-300 flex-1">
                {item.inputLabel}
              </h4>
              <span className={`text-[10px] font-medium ${
                isTop ? 'text-amber-400' : 'text-zinc-500'
              }`}>
                influenza totale: {item.totalSwing.toFixed(1)}%
              </span>
            </div>

            {/* Tornado bar */}
            <div className="mb-3">
              <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${barWidth}%`,
                    background: isTop
                      ? 'linear-gradient(90deg, rgb(245,158,11) 0%, rgb(249,115,22) 100%)'
                      : 'linear-gradient(90deg, rgb(59,130,246) 0%, rgb(99,102,241) 100%)',
                  }}
                />
              </div>
            </div>

            {/* Per-output detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {item.outputs.map(o => (
                <div key={o.outputId} className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded-lg bg-zinc-800/40">
                  <span className="text-zinc-400 truncate mr-2">{o.outputLabel}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-zinc-600">{formatValue(o.lowValue)}</span>
                    <span className="text-zinc-700">→</span>
                    <span className="text-zinc-600">{formatValue(o.highValue)}</span>
                    <span className={`font-medium ml-1 ${o.swingPct > 20 ? 'text-amber-400' : o.swingPct > 10 ? 'text-blue-400' : 'text-zinc-500'}`}>
                      ±{o.swingPct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
