import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import type { FanChartData } from '../../lib/sdl-bridge';

interface FanChartProps {
  data: FanChartData[];
  title: string;
  unit?: string;
  color?: string;
}

function formatValue(v: number): string {
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(0)}B`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  if (Math.abs(v) >= 10_000) return `${(v / 1_000).toFixed(0)}K`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  if (Math.abs(v) < 0.01 && v !== 0) return v.toExponential(1);
  if (Math.abs(v) < 1) return v.toFixed(2);
  return v.toFixed(0);
}

export default function FanChart({ data, title, unit, color = '#3b82f6' }: FanChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        No data available
      </div>
    );
  }

  // Transform data for stacked area approach
  const chartData = data.map((d) => ({
    year: d.year,
    // Base (invisible): from 0 to p5
    base: d.p5,
    // Outer lower band: p5 to p25
    outerLower: d.p25 - d.p5,
    // Inner lower band: p25 to p50
    innerLower: d.p50 - d.p25,
    // Inner upper band: p50 to p75
    innerUpper: d.p75 - d.p50,
    // Outer upper band: p75 to p95
    outerUpper: d.p95 - d.p75,
    // Median for line
    p50: d.p50,
  }));

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        {unit && <span className="text-[10px] text-slate-500 uppercase">{unit}</span>}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`grad-outer-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.12} />
              <stop offset="100%" stopColor={color} stopOpacity={0.12} />
            </linearGradient>
            <linearGradient id={`grad-inner-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(30, 41, 59)" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 10, fill: 'rgb(100, 116, 139)' }}
            axisLine={{ stroke: 'rgb(51, 65, 85)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'rgb(100, 116, 139)' }}
            axisLine={{ stroke: 'rgb(51, 65, 85)' }}
            tickLine={false}
            tickFormatter={formatValue}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(30, 41, 59)',
              border: '1px solid rgb(51, 65, 85)',
              borderRadius: '8px',
              fontSize: '11px',
              color: 'rgb(203, 213, 225)',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'base' || name === 'outerLower' || name === 'innerLower' || name === 'innerUpper' || name === 'outerUpper') return [null, null];
              return [formatValue(value), 'Median'];
            }}
            labelStyle={{ color: 'rgb(148, 163, 184)' }}
          />

          {/* Stacked areas for fan shape */}
          <Area type="monotone" dataKey="base" stackId="fan" fill="transparent" stroke="none" />
          <Area type="monotone" dataKey="outerLower" stackId="fan" fill={`url(#grad-outer-${title})`} stroke="none" />
          <Area type="monotone" dataKey="innerLower" stackId="fan" fill={`url(#grad-inner-${title})`} stroke="none" />
          <Area type="monotone" dataKey="innerUpper" stackId="fan" fill={`url(#grad-inner-${title})`} stroke="none" />
          <Area type="monotone" dataKey="outerUpper" stackId="fan" fill={`url(#grad-outer-${title})`} stroke="none" />

          {/* Median line */}
          <Line
            type="monotone"
            dataKey="p50"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: 'white', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
