import React, { useState, useMemo } from 'react';
import { TileType, FilterCriteria } from './types';
import { TILE_PRESETS } from './lib/tiles';
import { analyzeMahjongHand, filterAndRecalculate } from './lib/analyzer';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { SummaryCard } from './components/SummaryCard';
import { FilterPanel } from './components/FilterPanel';
import { ProbabilityChart } from './components/ProbabilityChart';
import { PatternTable } from './components/PatternTable';

export default function App() {
  // 1. パラメータ初期状態（デフォルト: 筒子 1〜4、各4枚、手牌4枚）
  const [tiles, setTiles] = useState<TileType[]>(() => TILE_PRESETS[0].tiles());
  const [handSize, setHandSize] = useState<number>(4);

  // 2. フィルター条件
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    requiredTags: [],
    excludedTags: [],
    includeTileIds: [],
    excludeTileIds: [],
  });

  // 3. 全パターンの完全網羅計算（メモ化）
  const analysisResult = useMemo(() => {
    return analyzeMahjongHand({ tiles, handSize });
  }, [tiles, handSize]);

  // 4. フィルター適用と生存パターンの再計算（メモ化）
  const { filteredShapes, filteredTotalCombinations, filteredGroups } = useMemo(() => {
    return filterAndRecalculate(analysisResult, filterCriteria);
  }, [analysisResult, filterCriteria]);

  // プリセットのリセット
  const handleResetPreset = (index: number) => {
    const preset = TILE_PRESETS[index];
    if (preset) {
      const newTiles = preset.tiles();
      setTiles(newTiles);
      setFilterCriteria({
        requiredTags: [],
        excludedTags: [],
        includeTileIds: [],
        excludeTileIds: [],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* 入力パラメータ設定パネル */}
        <InputPanel
          tiles={tiles}
          handSize={handSize}
          onTilesChange={setTiles}
          onHandSizeChange={setHandSize}
          onResetPreset={handleResetPreset}
        />

        {/* 概要カード（総数・生存数・生存率） */}
        <SummaryCard
          result={analysisResult}
          filteredTotalCombinations={filteredTotalCombinations}
          filteredShapesCount={filteredShapes.length}
          filterCriteria={filterCriteria}
        />

        {/* 消去法・絞り込みフィルターパネル */}
        <FilterPanel
          tiles={tiles}
          allTags={analysisResult.allTags}
          criteria={filterCriteria}
          onCriteriaChange={setFilterCriteria}
        />

        {/* 出現確率分布グラフ (Recharts) */}
        <ProbabilityChart
          groups={filteredGroups}
          shapes={filteredShapes}
        />

        {/* パターン一覧テーブル */}
        <PatternTable
          groups={filteredGroups}
          shapes={filteredShapes}
        />
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-800/80 py-6 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>麻雀形 - 牌姿組合せ確率 & 消去法分析 SPA</span>
          <span className="font-mono text-gray-400">Powered by Vite + React + Recharts</span>
        </div>
      </footer>
    </div>
  );
}
