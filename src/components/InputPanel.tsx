import React from 'react';
import { TileType, TileSuit } from '../types';
import { TILE_PRESETS, createTile } from '../lib/tiles';
import { Sliders, Plus, RotateCcw, Trash2 } from 'lucide-react';

interface InputPanelProps {
  tiles: TileType[];
  handSize: number;
  onTilesChange: (tiles: TileType[]) => void;
  onHandSizeChange: (size: number) => void;
  onResetPreset: (presetIndex: number) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  tiles,
  handSize,
  onTilesChange,
  onHandSizeChange,
  onResetPreset,
}) => {
  const totalTilesInWall = tiles.reduce((acc, t) => acc + t.count, 0);

  // 牌の枚数を変更
  const handleCountChange = (index: number, delta: number) => {
    const updated = [...tiles];
    const newCount = Math.max(0, Math.min(4, updated[index].count + delta));
    updated[index] = { ...updated[index], count: newCount };
    onTilesChange(updated);
  };

  // 牌を削除
  const handleRemoveTile = (index: number) => {
    const updated = tiles.filter((_, i) => i !== index);
    onTilesChange(updated);
  };

  // 新規牌を追加
  const handleAddTile = (suit: TileSuit, num: number) => {
    const id = suit === 'honor' ? `${num}z` : `${num}${suit[0]}`;
    if (tiles.some((t) => t.id === id)) return;
    const newTile = createTile(suit, num, 4);
    onTilesChange([...tiles, newTile]);
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800/80 mb-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">入力パラメータ設定</h2>
        </div>

        {/* プリセット選択 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">プリセット:</span>
          <select
            className="text-xs bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            onChange={(e) => onResetPreset(Number(e.target.value))}
            defaultValue={0}
          >
            {TILE_PRESETS.map((p, i) => (
              <option key={i} value={i}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {/* 手牌枚数 N の指定 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-gray-300">
              作成する手牌の枚数 <span className="text-emerald-400 font-mono text-sm font-bold">N = {handSize}枚</span>
            </label>
            <span className="text-xs text-gray-400">
              山総数: <strong className="text-gray-200 font-mono">{totalTilesInWall}</strong> 枚
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={Math.min(14, totalTilesInWall || 14)}
              value={handSize}
              onChange={(e) => onHandSizeChange(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-gray-800 rounded-lg"
            />
            <div className="flex gap-1">
              {[3, 4, 5, 7, 10, 13, 14].map((size) => (
                <button
                  key={size}
                  onClick={() => onHandSizeChange(size)}
                  disabled={size > totalTilesInWall}
                  className={`text-xs px-2.5 py-1 rounded-md transition ${
                    handSize === size
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 牌の種類と各残枚数の設定 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium text-gray-300">
              分析対象の牌種 <span className="text-gray-400 font-normal">（残枚数 0〜4枚 を調整可能）</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">計 {tiles.length} 種類</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {tiles.map((tile, idx) => (
              <div
                key={tile.id}
                className={`p-2.5 rounded-xl border transition ${
                  tile.count === 0
                    ? 'bg-gray-900/40 border-gray-800/50 opacity-50'
                    : 'bg-gray-800/70 border-gray-700/80 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl leading-none select-none">{tile.emoji}</span>
                    <span className="text-xs font-bold text-gray-200">{tile.label}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveTile(idx)}
                    title="牌を削除"
                    className="text-gray-400 hover:text-rose-400 p-0.5 rounded transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-gray-900/60 rounded-lg p-1 border border-gray-800">
                  <button
                    onClick={() => handleCountChange(idx, -1)}
                    disabled={tile.count <= 0}
                    className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-20 flex items-center justify-center text-xs font-bold transition"
                  >
                    -
                  </button>
                  <span
                    className={`font-mono text-xs font-bold ${
                      tile.count === 4
                        ? 'text-emerald-400'
                        : tile.count === 0
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {tile.count}枚
                  </span>
                  <button
                    onClick={() => handleCountChange(idx, 1)}
                    disabled={tile.count >= 4}
                    className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-20 flex items-center justify-center text-xs font-bold transition"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* クイック牌追加ボタンバー */}
          <div className="mt-4 pt-3 border-t border-gray-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Plus className="w-3 h-3 text-emerald-400" /> 牌を追加:
            </span>
            <div className="flex flex-wrap gap-1">
              {['pin', 'man', 'sou'].map((s) => (
                <div key={s} className="flex gap-0.5 bg-gray-800/40 p-1 rounded-lg border border-gray-800">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                    const id = `${n}${s[0]}`;
                    const exists = tiles.some((t) => t.id === id);
                    return (
                      <button
                        key={id}
                        disabled={exists}
                        onClick={() => handleAddTile(s as TileSuit, n)}
                        className={`text-xs px-1.5 py-0.5 rounded transition ${
                          exists
                            ? 'text-gray-400 opacity-40 cursor-default'
                            : 'hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        {n}
                        {s === 'pin' ? 'p' : s === 'man' ? 'm' : 's'}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
