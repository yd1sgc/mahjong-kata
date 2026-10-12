import React from 'react';
import { FilterCriteria, TileType } from '../types';
import { Filter, RotateCcw, Check, X, ShieldAlert } from 'lucide-react';

interface FilterPanelProps {
  tiles: TileType[];
  allTags: string[];
  criteria: FilterCriteria;
  onCriteriaChange: (newCriteria: FilterCriteria) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  tiles,
  allTags,
  criteria,
  onCriteriaChange,
}) => {
  // 牌の包含・除外トグル (なし -> 含む -> 除外 -> なし)
  const cycleTileState = (tileId: string) => {
    const isIncluded = criteria.includeTileIds.includes(tileId);
    const isExcluded = criteria.excludeTileIds.includes(tileId);

    let nextInclude = [...criteria.includeTileIds];
    let nextExclude = [...criteria.excludeTileIds];

    if (!isIncluded && !isExcluded) {
      // なし -> 含む
      nextInclude.push(tileId);
    } else if (isIncluded) {
      // 含む -> 除外
      nextInclude = nextInclude.filter((id) => id !== tileId);
      nextExclude.push(tileId);
    } else {
      // 除外 -> なし
      nextExclude = nextExclude.filter((id) => id !== tileId);
    }

    onCriteriaChange({
      ...criteria,
      includeTileIds: nextInclude,
      excludeTileIds: nextExclude,
    });
  };

  // タグのトグル (なし -> 必須 -> 除外 -> なし)
  const cycleTagState = (tag: string) => {
    const isReq = criteria.requiredTags.includes(tag);
    const isExc = criteria.excludedTags.includes(tag);

    let nextReq = [...criteria.requiredTags];
    let nextExc = [...criteria.excludedTags];

    if (!isReq && !isExc) {
      // なし -> 必須
      nextReq.push(tag);
    } else if (isReq) {
      // 必須 -> 除外
      nextReq = nextReq.filter((t) => t !== tag);
      nextExc.push(tag);
    } else {
      // 除外 -> なし
      nextExc = nextExc.filter((t) => t !== tag);
    }

    onCriteriaChange({
      ...criteria,
      requiredTags: nextReq,
      excludedTags: nextExc,
    });
  };

  // 全リセット
  const handleReset = () => {
    onCriteriaChange({
      requiredTags: [],
      excludedTags: [],
      includeTileIds: [],
      excludeTileIds: [],
    });
  };

  const hasFilter =
    criteria.requiredTags.length > 0 ||
    criteria.excludedTags.length > 0 ||
    criteria.includeTileIds.length > 0 ||
    criteria.excludeTileIds.length > 0;

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800/80 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-semibold text-white">
            消去法・絞り込みフィルター
          </h3>
          <span className="text-xs text-gray-400 hidden sm:inline">
            （クリックで <span className="text-emerald-400 font-bold">必須(緑)</span> → <span className="text-rose-400 font-bold">除外(赤)</span> → 解除）
          </span>
        </div>

        {hasFilter && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/30 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            フィルター全解除
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* 1. 牌の指定フィルター */}
        <div>
          <div className="text-xs font-medium text-gray-300 mb-2">
            牌ごとの指定（「含む」または「含まない/消去」）:
          </div>
          <div className="flex flex-wrap gap-2">
            {tiles.map((tile) => {
              const isIncluded = criteria.includeTileIds.includes(tile.id);
              const isExcluded = criteria.excludeTileIds.includes(tile.id);

              return (
                <button
                  key={tile.id}
                  onClick={() => cycleTileState(tile.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                    isIncluded
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-900/50'
                      : isExcluded
                      ? 'bg-rose-950/60 border-rose-500/80 text-rose-300 line-through opacity-80'
                      : 'bg-gray-800/80 border-gray-700 hover:border-gray-600 text-gray-300'
                  }`}
                >
                  <span className="text-lg leading-none">{tile.emoji}</span>
                  <span>{tile.label}</span>
                  {isIncluded && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                  {isExcluded && <X className="w-3.5 h-3.5 text-rose-400 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 麻雀的特徴タグフィルター */}
        {allTags.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-300 mb-2">
              形の意味・役構造タグでの消去法:
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isReq = criteria.requiredTags.includes(tag);
                const isExc = criteria.excludedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    onClick={() => cycleTagState(tag)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                      isReq
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-900/50'
                        : isExc
                        ? 'bg-rose-950/60 border-rose-500/80 text-rose-300 line-through opacity-80'
                        : 'bg-gray-800/80 border-gray-700 hover:border-gray-600 text-gray-300'
                    }`}
                  >
                    <span>{tag}</span>
                    {isReq && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />}
                    {isExc && <X className="w-3.5 h-3.5 text-rose-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
