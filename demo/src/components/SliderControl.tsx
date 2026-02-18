/**
 * SliderControl — Interactive parameter control with range input.
 */

import type { SliderDef } from '../scenarios/types';

export default function SliderControl({ slider, value, onChange }: { slider: SliderDef; value: number; onChange: (v: number) => void }) {
  const isDefault = value === slider.default;
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-sm font-medium text-zinc-200">{slider.label}</label>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-white tabular-nums">{slider.format(value)}</span>
          {!isDefault && <button onClick={() => onChange(slider.default)} className="text-[10px] text-blue-400 hover:text-blue-300">reset</button>}
        </div>
      </div>
      <p className="text-[11px] text-zinc-500 mb-3 leading-relaxed">{slider.description}</p>
      <div className="relative">
        <input type="range" min={slider.min} max={slider.max} step={slider.step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full cursor-pointer" />
        <div className="flex justify-between mt-1 text-[10px] text-zinc-600"><span>{slider.format(slider.min)}</span><span>{slider.format(slider.max)}</span></div>
        {!isDefault && <div className="absolute top-0 w-0.5 h-[6px] bg-zinc-500 rounded-full pointer-events-none" style={{ left: `${((slider.default - slider.min) / (slider.max - slider.min)) * 100}%` }} />}
      </div>
      <div className="mt-2 text-[10px] text-zinc-600 italic">Fonte: {slider.source}</div>
    </div>
  );
}
