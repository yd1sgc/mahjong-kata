import React from 'react';
import { AnalysisResult, FilterCriteria } from '../types';
import { Calculator, Target, Filter, Percent } from 'lucide-react';

interface SummaryCardProps {
  result: AnalysisResult;
  filteredTotalCombinations: bigint;
  filteredShapesCount: number;
  filterCriteria: FilterCriteria;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  result,
  filteredTotalCombinations,
  filteredShapesCount,
  filterCriteria,
}) => {
  const isFiltered =
    filterCriteria.requiredTags.length > 0 ||
    filterCriteria.excludedTags.length > 0 ||
    filterCriteria.includeTileIds.length > 0 ||
    filterCriteria.excludeTileIds.length > 0;

  const totalCombNum = Number(result.totalCombinations);
  const filteredCombNum = Number(filteredTotalCombinations);
  const survivalRate = totalCombNum > 0 ? (filteredCombNum / totalCombNum) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. 全組み合わせ総数 */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between text-gray-400 mb-2">
          <span className="text-xs font-medium">全組み合わせ総数</span>
          <Calculator className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-white tracking-tight">
          {result.totalCombinations.toLocaleString()}
          <span className="text-xs font-normal text-gray-400 ml-1.5">通り</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          C({result.params.tiles.reduce((a, b) => a + b.count, 0)},{' '}
          {result.params.handSize}) から算出
        </p>
      </div>

      {/* 2. 牌姿パターン数 */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between text-gray-400 mb-2">
          <span className="text-xs font-medium">牌姿パターン数</span>
          <Target className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-white tracking-tight">
          {result.totalShapesCount}
          <span className="text-xs font-normal text-gray-400 ml-1.5">種</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          内訳グループ: {result.distributionGroups.length} 系統
        </p>
      </div>

      {/* 3. フィルター後の生存数 */}
      <div
        className={`border rounded-xl p-4 shadow-lg backdrop-blur transition ${
          isFiltered
            ? 'bg-amber-950/20 border-amber-500/40'
            : 'bg-gray-900/60 border-gray-800'
        }`}
      >
        <div className="flex items-center justify-between text-gray-400 mb-2">
          <span className="text-xs font-medium">絞り込み後 生存パターン</span>
          <Filter
            className={`w-4 h-4 ${
              isFiltered ? 'text-amber-400' : 'text-gray-400'
            }`}
          />
        </div>
        <div
          className={`text-2xl font-bold font-mono tracking-tight ${
            isFiltered ? 'text-amber-300' : 'text-gray-300'
          }`}
        >
          {filteredShapesCount}
          <span className="text-xs font-normal text-gray-400 ml-1.5">
            / {result.totalShapesCount} 種
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          組合せ数: {filteredTotalCombinations.toLocaleString()} 通り
        </p>
      </div>

      {/* 4. 生存率 / 絞り込み割合 */}
      <div
        className={`border rounded-xl p-4 shadow-lg backdrop-blur transition ${
          isFiltered
            ? 'bg-emerald-950/20 border-emerald-500/40'
            : 'bg-gray-900/60 border-gray-800'
        }`}
      >
        <div className="flex items-center justify-between text-gray-400 mb-2">
          <span className="text-xs font-medium">
            {isFiltered ? '条件合致率 (生存確率)' : '条件ステータス'}
          </span>
          <Percent
            className={`w-4 h-4 ${
              isFiltered ? 'text-emerald-400' : 'text-gray-400'
            }`}
          />
        </div>
        <div
          className={`text-2xl font-bold font-mono tracking-tight ${
            isFiltered ? 'text-emerald-400' : 'text-gray-300'
          }`}
        >
          {isFiltered ? `${survivalRate.toFixed(1)}%` : '全網羅中'}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {isFiltered ? '消去法による生存確率' : 'フィルター未適用'}
        </p>
      </div>
    </div>
  );
};
