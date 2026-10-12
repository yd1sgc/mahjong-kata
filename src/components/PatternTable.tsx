import React, { useState } from 'react';
import { DistributionGroup, HandShape } from '../types';
import { Table, Eye, EyeOff } from 'lucide-react';

interface PatternTableProps {
  groups: DistributionGroup[];
  shapes: HandShape[];
}

export const PatternTable: React.FC<PatternTableProps> = ({ groups, shapes }) => {
  const [viewTab, setViewTab] = useState<'shapes' | 'groups'>('shapes');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const toggleGroupExpand = (key: string) => {
    setExpandedGroupId(expandedGroupId === key ? null : key);
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-800/80 mb-5 gap-3">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-white">パターン一覧テーブル</h3>
          <span className="text-xs text-gray-400">
            ({viewTab === 'shapes' ? `${shapes.length}件` : `${groups.length}グループ`})
          </span>
        </div>

        {/* タブ切り替え */}
        <div className="flex bg-gray-800/80 p-0.5 rounded-lg border border-gray-700">
          <button
            onClick={() => setViewTab('shapes')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${
              viewTab === 'shapes'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            具体的な牌姿一覧
          </button>
          <button
            onClick={() => setViewTab('groups')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${
              viewTab === 'groups'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            内訳グループ一覧
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {viewTab === 'shapes' ? (
          /* 1. 具体的な牌姿一覧テーブル */
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">牌姿 (絵文字 / テキスト)</th>
                <th className="py-3 px-3">構成・麻雀的解釈</th>
                <th className="py-3 px-3">特徴タグ</th>
                <th className="py-3 px-3 text-right">組合せ数</th>
                <th className="py-3 px-3 text-right min-w-36">出現確率 (%)</th>
                <th className="py-3 px-3 text-right">出現頻度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {shapes.map((shape, idx) => {
                const pct = (shape.probability * 100).toFixed(2);
                return (
                  <tr
                    key={shape.id}
                    className="hover:bg-gray-800/40 transition group"
                  >
                    <td className="py-3 px-3 font-mono text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl leading-none tracking-tight select-none font-serif">
                          {shape.emojiString}
                        </span>
                        <span className="font-mono text-gray-300 font-medium">
                          {shape.tileString}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-300 font-mono">
                      {shape.componentsSummary}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {shape.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              tag.includes('順子')
                                ? 'bg-blue-950/40 border-blue-700/60 text-blue-300'
                                : tag.includes('刻子') || tag.includes('槓子')
                                ? 'bg-purple-950/40 border-purple-700/60 text-purple-300'
                                : tag.includes('対子')
                                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                                : tag.includes('両面')
                                ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                                : 'bg-gray-800 border-gray-700 text-gray-400'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-gray-200">
                      {shape.combinations.toLocaleString()}通り
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{
                              width: `${Math.min(100, shape.probability * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono font-bold text-emerald-400 min-w-12 text-right">
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-gray-400">
                      {shape.frequency}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* 2. 内訳グループ一覧テーブル */
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">内訳 (枚数分割)</th>
                <th className="py-3 px-3">パターン名</th>
                <th className="py-3 px-3">含まれる牌姿数</th>
                <th className="py-3 px-3 text-right">合計算計数</th>
                <th className="py-3 px-3 text-right min-w-36">合計確率 (%)</th>
                <th className="py-3 px-3 text-right">出現頻度</th>
                <th className="py-3 px-3 text-center">内訳</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {groups.map((group, idx) => {
                const groupKey = group.distribution.join('-');
                const isExpanded = expandedGroupId === groupKey;
                const pct = (group.probability * 100).toFixed(2);

                return (
                  <React.Fragment key={groupKey}>
                    <tr
                      className="hover:bg-gray-800/40 transition cursor-pointer"
                      onClick={() => toggleGroupExpand(groupKey)}
                    >
                      <td className="py-3 px-3 font-mono text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-400">
                        [{group.distribution.join(', ')}]
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-200">
                        {group.patternName}
                      </td>
                      <td className="py-3 px-3 text-gray-400">
                        {group.shapes.length} 種
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-gray-200">
                        {group.combinations.toLocaleString()}通り
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full"
                              style={{
                                width: `${Math.min(100, group.probability * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono font-bold text-blue-400 min-w-12 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-gray-400">
                        {group.frequency}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-400">
                        {isExpanded ? (
                          <EyeOff className="w-4 h-4 mx-auto text-blue-400" />
                        ) : (
                          <Eye className="w-4 h-4 mx-auto" />
                        )}
                      </td>
                    </tr>

                    {/* 展開時の個別詳細リスト */}
                    {isExpanded && (
                      <tr className="bg-gray-950/50">
                        <td colSpan={8} className="p-4">
                          <div className="space-y-2 pl-4 border-l-2 border-blue-500/50">
                            <div className="text-[11px] font-semibold text-gray-400 mb-2">
                              この内訳に含まれる具体的な牌姿一覧:
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {group.shapes.map((s) => (
                                <div
                                  key={s.id}
                                  className="bg-gray-900 border border-gray-800 rounded-lg p-2.5 flex items-center justify-between"
                                >
                                  <div>
                                    <div className="text-xl leading-none mb-1 font-serif">
                                      {s.emojiString}
                                    </div>
                                    <div className="text-[11px] text-gray-300 font-mono">
                                      {s.tileString}
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                      {s.componentsSummary}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-mono font-bold text-emerald-400 text-xs">
                                      {(s.probability * 100).toFixed(2)}%
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                      {s.combinations.toLocaleString()}通り
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
