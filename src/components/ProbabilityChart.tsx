import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { DistributionGroup, HandShape } from '../types';
import { BarChart3 } from 'lucide-react';

interface ProbabilityChartProps {
  groups: DistributionGroup[];
  shapes: HandShape[];
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({
  groups,
  shapes,
}) => {
  const [chartMode, setChartMode] = useState<'groups' | 'shapes'>('groups');

  const groupData = groups.slice(0, 10).map((g) => ({
    name: g.patternName,
    shortName: g.distribution.join('+'),
    probability: Number((g.probability * 100).toFixed(2)),
    combinations: g.combinations.toLocaleString(),
    frequency: g.frequency,
  }));

  const shapeData = shapes.slice(0, 12).map((s) => ({
    name: s.tileString || '牌姿',
    shortName: s.emojiString || s.tileString,
    probability: Number((s.probability * 100).toFixed(2)),
    combinations: s.combinations.toLocaleString(),
    frequency: s.frequency,
    summary: s.componentsSummary,
  }));

  const data = chartMode === 'groups' ? groupData : shapeData;

  const COLORS = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#6366f1', // indigo
    '#14b8a6', // teal
  ];

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800/80 mb-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-white">出現確率分布グラフ</h3>
        </div>

        <div className="flex bg-gray-800/80 p-0.5 rounded-lg border border-gray-700">
          <button
            onClick={() => setChartMode('groups')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${
              chartMode === 'groups'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            内訳グループ別
          </button>
          <button
            onClick={() => setChartMode('shapes')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${
              chartMode === 'shapes'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            牌姿個別 (上位)
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
          表示可能なデータがありません（フィルター条件に一致するパターンが0件です）
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: -10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="shortName"
                stroke="#6b7280"
                fontSize={11}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                unit="%"
                domain={[0, 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 shadow-xl text-xs space-y-1">
                        <div className="font-bold text-gray-100">{d.name}</div>
                        {d.summary && (
                          <div className="text-gray-400">{d.summary}</div>
                        )}
                        <div className="text-emerald-400 font-mono font-bold text-sm">
                          確率: {d.probability}%
                        </div>
                        <div className="text-gray-400">
                          組み合わせ: {d.combinations} 通り
                        </div>
                        <div className="text-gray-400">頻度: {d.frequency}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
