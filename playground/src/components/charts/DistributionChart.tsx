import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface DistributionChartProps {
  mean: number;
  std: number;
  percentiles: Map<number, number>;
  title: string;
  unit?: string;
  color?: string;
}

function formatValue(v: number): string {
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 10_000) return `${(v / 1_000).toFixed(1)}K`;
  if (Math.abs(v) < 1) return v.toFixed(3);
  return v.toFixed(1);
}

export default function DistributionChart({ mean, std, percentiles, title, unit, color = '#8b5cf6' }: DistributionChartProps) {
  // Generate approximate distribution bars from percentiles
  const p5 = percentiles.get(5) ?? mean - 2 * std;
  const p25 = percentiles.get(25) ?? mean - 0.674 * std;
  const p50 = percentiles.get(50) ?? mean;
  const p75 = percentiles.get(75) ?? mean + 0.674 * std;
  const p95 = percentiles.get(95) ?? mean + 2 * std;

  const range = p95 - p5;
  const numBins = 12;
  const binWidth = range / numBins;

  const bins = [];
  for (let i = 0; i < numBins; i++) {
    const binStart = p5 + i * binWidth;
    const binMid = binStart + binWidth / 2;
    // Approximate normal density
    const z = (binMid - mean) / std;
    const density = Math.exp(-0.5 * z * z);
    bins.push({
      range: formatValue(binMid),
      value: density,
      binMid,
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        {unit && <span className="text-[10px] text-slate-500 uppercase">{unit}</span>}
      </div>

      <div className="flex gap-4 text-[10px] text-slate-400 mb-1">
        <span>Mean: <strong className="text-slate-200">{formatValue(mean)}</strong></span>
        <span>Std: <strong className="text-slate-200">{formatValue(std)}</strong></span>
        <span>P5-P95: <strong className="text-slate-200">{formatValue(p5)} — {formatValue(p95)}</strong></span>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={bins} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(30, 41, 59)" vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 9, fill: 'rgb(100, 116, 139)' }}
            axisLine={{ stroke: 'rgb(51, 65, 85)' }}
            tickLine={false}
            interval={1}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(30, 41, 59)',
              border: '1px solid rgb(51, 65, 85)',
              borderRadius: '8px',
              fontSize: '11px',
              color: 'rgb(203, 213, 225)',
            }}
            formatter={() => [null, null]}
            labelFormatter={(label) => `Value: ${label}`}
          />
          <Bar
            dataKey="value"
            fill={color}
            fillOpacity={0.6}
            radius={[3, 3, 0, 0]}
          />
          <ReferenceLine
            x={formatValue(p50)}
            stroke="white"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
