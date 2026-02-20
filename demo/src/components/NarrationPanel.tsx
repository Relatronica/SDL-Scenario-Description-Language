/**
 * NarrationPanel — Human-readable summary of simulation results.
 */

import type { NarrationBlock } from '../lib/narration';

interface NarrationPanelProps {
  blocks: NarrationBlock[];
}

const TONE_STYLES: Record<NarrationBlock['tone'], { border: string; icon: string; bg: string }> = {
  neutral: { border: 'border-zinc-700/50', icon: '📊', bg: 'bg-zinc-800/30' },
  positive: { border: 'border-emerald-500/30', icon: '✅', bg: 'bg-emerald-500/5' },
  warning: { border: 'border-amber-500/30', icon: '⚠️', bg: 'bg-amber-500/5' },
  critical: { border: 'border-red-500/30', icon: '🔴', bg: 'bg-red-500/5' },
};

function renderMarkdownBold(text: string): (string | JSX.Element)[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-zinc-200 font-semibold">{part}</strong>
      : part,
  );
}

export default function NarrationPanel({ blocks }: NarrationPanelProps) {
  if (blocks.length === 0) {
    return (
      <p className="text-[11px] text-zinc-500">
        Dati insufficienti per generare un riassunto narrativo.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-zinc-500 leading-relaxed">
        Riassunto automatico generato dall'analisi dei risultati della simulazione.
        I numeri sono espressi come valori mediani con intervallo di incertezza.
      </p>

      {blocks.map((block, i) => {
        const style = TONE_STYLES[block.tone];
        return (
          <div key={i} className={`rounded-xl border p-4 ${style.border} ${style.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{style.icon}</span>
              <h4 className="text-xs font-semibold text-zinc-300">{block.title}</h4>
            </div>
            <div className="text-[11px] text-zinc-400 leading-relaxed space-y-2">
              {block.text.split('\n\n').map((paragraph, pi) => (
                <p key={pi}>{renderMarkdownBold(paragraph)}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
